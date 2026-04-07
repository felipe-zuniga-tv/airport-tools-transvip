'use client';

import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Clock, Star, Users } from 'lucide-react';
import { TransvipLogo } from '@/components/transvip/transvip-logo';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LiveClock } from '@/components/ui/live-clock';
import { QRCodeScannerDialog } from '@/components/qr/qr-code-scanner-dialog';
import type { AirportZone } from '@/lib/config/airport';
import { readApiEnvelope } from '@/lib/api/client';
import type { BoardActiveResponse, BoardListItem } from '@/lib/board/types';
import type { BoardMapPoint } from './board-destinations-map';

const BoardDestinationsMap = dynamic(
	() =>
		import('./board-destinations-map').then((mod) => mod.BoardDestinationsMap),
	{
		ssr: false,
		loading: () => (
			<div className="h-44 w-full animate-pulse rounded-md bg-slate-200/70 ring-1 ring-slate-300/60" />
		),
	},
);

const POLL_MS = 22_000;

function categoryBadgeClass(category: string) {
	const u = category.toUpperCase();
	if (u === 'SUPERVIP') return 'bg-yellow-200 text-black border-yellow-400';
	if (u === 'VIP') return 'bg-teal-600 text-white border-teal-700';
	return 'bg-slate-100 text-slate-800 border-slate-200';
}

function hasCategoryBadge(category: string) {
	const t = category.trim();
	if (!t || t === '—' || t === '-') return false;
	if (t.toUpperCase() === 'NO VIP') return false;
	return true;
}

export const WaitingBoardClient = ({
	zone,
	hideHeader = false,
	boardReloadRef,
	initialSnapshot,
}: {
	zone: AirportZone;
	hideHeader?: boolean;
	/** When set (e.g. from workspace shell), registers `load` for header QR refresh. */
	boardReloadRef?: MutableRefObject<(() => void) | null>;
	/**
	 * Latest board from parent polling (e.g. workspace tab badge) so counts/lists match
	 * immediately instead of showing "—" until this component's fetch completes.
	 */
	initialSnapshot?: BoardActiveResponse | null;
}) => {
	const [data, setData] = useState<BoardActiveResponse | null>(
		() => initialSnapshot ?? null,
	);
	const [error, setError] = useState<string | null>(null);
	const [tab, setTab] = useState<'shared' | 'exclusive'>('shared');

	const load = useCallback(async () => {
		try {
			const res = await fetch(
				`/api/board/active?branchId=${encodeURIComponent(String(zone.branch_id))}`,
				{ cache: 'no-store' },
			);
			const payload = await readApiEnvelope<BoardActiveResponse>(res);
			if (!res.ok || payload.error || payload.data === null) {
				throw new Error(payload.error ?? 'Error al cargar tablero');
			}
			setData(payload.data);
			setError(null);
		} catch (e) {
			console.error(e);
			setError(e instanceof Error ? e.message : 'Error al cargar tablero');
		}
	}, [zone.branch_id]);

	useEffect(() => {
		if (initialSnapshot) {
			setData((prev) => prev ?? initialSnapshot);
		}
	}, [initialSnapshot]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		const id = window.setInterval(() => void load(), POLL_MS);
		return () => window.clearInterval(id);
	}, [load]);

	useEffect(() => {
		if (!boardReloadRef) return;
		boardReloadRef.current = load;
		return () => {
			boardReloadRef.current = null;
		};
	}, [boardReloadRef, load]);

	const showLoadingShell = data === null && error === null;

	const mapPoints: BoardMapPoint[] = useMemo(() => {
		if (!data) return [];
		const out: BoardMapPoint[] = [];
		const pushRow = (
			row: (typeof data.shared)[number],
			kind: 'shared' | 'exclusive',
		) => {
			if (
				row.dest_lat == null ||
				row.dest_lng == null ||
				!Number.isFinite(row.dest_lat) ||
				!Number.isFinite(row.dest_lng)
			) {
				return;
			}
			if (row.dest_lat === 0 && row.dest_lng === 0) return;
			out.push({
				booking_id: row.booking_id,
				lat: row.dest_lat,
				lng: row.dest_lng,
				service_name: row.service_name,
				pax_count: row.pax_count,
				address: row.destination_address?.trim() || row.service_name,
				kind,
			});
		};
		for (const row of data.shared) pushRow(row, 'shared');
		for (const row of data.exclusive) pushRow(row, 'exclusive');
		return out;
	}, [data]);

	const list = tab === 'shared' ? data?.shared ?? [] : data?.exclusive ?? [];
	return (
		<div
			className={cn(
				'flex flex-col bg-gray-100',
				hideHeader ? 'h-full min-h-0 flex-1' : 'min-h-screen',
			)}
		>
			{!hideHeader && (
				<header className="flex flex-col items-center gap-3 bg-transvip/90 p-4 shadow-md sm:flex-row sm:justify-between">
					<div className="flex flex-row items-center gap-4">
						<TransvipLogo size={36} colored={false} logoOnly className="" />
						<div className="flex flex-col gap-1 text-white">
							<span className="text-lg font-bold lg:text-xl">
								Tablero de espera · {zone.city_name}
							</span>
							<span className="w-fit rounded-full bg-transvip-dark px-3 py-1 text-xs font-semibold">
								<Link
									href={zone.href}
									className="flex items-center gap-1 text-white"
								>
									<ArrowLeft className="size-4" />
									Volver a Zona Iluminada
								</Link>
							</span>
						</div>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
						<QRCodeScannerDialog
							branchId={zone.branch_id}
							onBoardScanSuccess={load}
							triggerClassName="bg-white text-black"
						/>
						<LiveClock className="mx-auto md:ml-auto" />
					</div>
				</header>
			)}

			<main
				className={cn(
					'mx-auto flex w-full max-w-6xl flex-col gap-4 p-4',
					hideHeader ? 'min-h-0 flex-1 overflow-auto' : 'flex-1',
				)}
			>
				{error && (
					<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
						{error}
					</div>
				)}

				{showLoadingShell ? (
					<>
						<section
							className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
							aria-busy
							aria-label="Cargando tablero"
						>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:items-start md:gap-x-6">
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									<div className="h-24 animate-pulse rounded-lg bg-slate-200/80 ring-1 ring-slate-300/50" />
									<div className="h-24 animate-pulse rounded-lg bg-slate-200/80 ring-1 ring-slate-300/50" />
								</div>
								<div className="flex min-h-[200px] flex-col gap-2 md:min-h-[220px]">
									<div className="h-5 w-40 animate-pulse rounded bg-slate-200/80" />
									<div className="min-h-[180px] flex-1 animate-pulse rounded-md bg-slate-200/70 ring-1 ring-slate-300/60" />
								</div>
							</div>
						</section>
						<section
							className="rounded-lg border border-slate-200 bg-white shadow-sm"
							aria-hidden
						>
							<div className="border-b border-slate-200 p-3">
								<div className="flex gap-2">
									<div className="h-12 flex-1 animate-pulse rounded-md bg-slate-200/70" />
									<div className="h-12 flex-1 animate-pulse rounded-md bg-slate-200/70" />
								</div>
							</div>
							<div className="flex flex-col gap-3 p-4">
								<div className="h-28 animate-pulse rounded-lg bg-slate-200/70 ring-1 ring-slate-300/50" />
								<div className="h-28 animate-pulse rounded-lg bg-slate-200/70 ring-1 ring-slate-300/50" />
							</div>
						</section>
					</>
				) : (
					<>
				<section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
					<h2 className="sr-only">Resumen y mapa de destinos</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:items-start md:gap-x-6">
						<div className="flex h-full flex-col justify-center gap-4 text-sm sm:text-base">
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<Card className="shadow-sm">
									<CardHeader className="space-y-1 p-4 pb-4">
										<CardDescription className="text-base font-medium text-slate-600 text-center">
											Reservas
										</CardDescription>
										<CardTitle className="text-2xl font-bold tabular-nums text-slate-900 text-center">
											{data?.total_bookings ?? '—'}
										</CardTitle>
									</CardHeader>
								</Card>
								<Card className="shadow-sm">
									<CardHeader className="space-y-1 p-4 pb-4">
										<CardDescription className="text-base font-medium text-slate-600 text-center">
											Pasajeros
										</CardDescription>
										<CardTitle className="text-2xl font-bold tabular-nums text-slate-900 text-center">
											{data?.total_pax ?? '—'}
										</CardTitle>
									</CardHeader>
								</Card>
							</div>
							<div className="flex min-w-0 flex-col gap-1 border-t border-slate-200 pt-4">
								<div className="flex items-center gap-2 text-base font-semibold text-slate-600">
									<Clock className="size-5 shrink-0 text-slate-500" />
									<span>Más antiguo</span>
								</div>
								<span
									className="min-w-0 pl-7 text-lg font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl"
									title={
										data?.oldest_scanned_at
											? new Date(data.oldest_scanned_at).toLocaleString('es')
											: undefined
									}
								>
									{data?.oldest_scanned_at
										? formatDistanceToNow(new Date(data.oldest_scanned_at), {
												addSuffix: true,
												locale: es,
											})
										: '—'}
								</span>
							</div>
						</div>
						<div className="flex min-h-[240px] flex-col gap-2 md:min-h-[240px] h-full">
							<h3 className="shrink-0 text-base font-semibold text-slate-700">
								Mapa de destinos
							</h3>
							<div className="flex min-h-0 flex-1 flex-col h-full">
								<BoardDestinationsMap
									points={mapPoints}
									previewClassName="flex-1 min-h-[200px] md:min-h-[220px]"
								/>
							</div>
						</div>
					</div>
				</section>

				<section className="rounded-lg border border-slate-200 bg-white shadow-sm">
					<div className="border-b border-slate-200">
						<div
							role="tablist"
							className="flex -mb-px"
							aria-label="Tipo de servicio"
						>
						<button
							type="button"
							role="tab"
							aria-selected={tab === 'shared'}
							className={cn(
								'relative flex flex-1 flex-col items-center gap-1 border-b-2 pt-3 pb-3 text-sm font-medium transition-colors sm:flex-row sm:justify-center sm:gap-2 sm:text-base',
								tab === 'shared'
									? 'border-orange-600 text-orange-600'
									: 'border-transparent text-slate-500 hover:text-slate-800',
							)}
							onClick={() => setTab('shared')}
						>
							<Users
								className={cn(
									'size-5 sm:size-6',
									tab === 'shared' ? 'text-orange-600' : 'text-slate-400',
								)}
							/>
							<span className="flex items-center gap-2">
								Compartidos
								<span
									className={cn(
										'flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white',
										tab === 'shared' ? 'bg-orange-600' : 'bg-slate-400',
									)}
								>
									{data?.shared_pax_waiting ?? 0}
								</span>
							</span>
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={tab === 'exclusive'}
							className={cn(
								'relative flex flex-1 flex-col items-center gap-1 border-b-2 pt-3 pb-3 text-sm font-medium transition-colors sm:flex-row sm:justify-center sm:gap-2 sm:text-base',
								tab === 'exclusive'
									? 'border-orange-600 text-orange-600'
									: 'border-transparent text-slate-500 hover:text-slate-800',
							)}
							onClick={() => setTab('exclusive')}
						>
							<Star
								className={cn(
									'size-5 sm:size-6',
									tab === 'exclusive' ? 'text-orange-600' : 'text-slate-400',
								)}
							/>
							<span className="flex items-center gap-2">
								Exclusivos
								<span
									className={cn(
										'flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white',
										tab === 'exclusive' ? 'bg-orange-600' : 'bg-slate-400',
									)}
								>
									{data?.exclusive_pax_waiting ?? 0}
								</span>
							</span>
						</button>
						</div>
					</div>

					<ul className="p-2 sm:p-4 flex flex-col gap-3">
						{list.length === 0 && (
							<li className="py-10 text-center text-slate-500">
								No hay reservas en esta pestaña.
							</li>
						)}
						{list.map((row) => (
							<BoardRow key={row.booking_id} row={row} />
						))}
					</ul>
				</section>
					</>
				)}
			</main>
		</div>
	);
};

function BoardRow({ row }: { row: BoardListItem }) {
	const waitLabel = formatDistanceToNow(new Date(row.scanned_at), {
		addSuffix: true,
		locale: es,
	});
	const paxShort =
		row.pax_count === 1 ? '1 pasajero' : `${row.pax_count} pasajeros`;

	return (
		<li>
			<div className="flex min-w-0 flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
				<div className="flex min-w-0 items-start justify-between gap-3">
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
						<span className="text-base font-bold tabular-nums text-slate-900">
							#{row.booking_id}
						</span>
						<span className="text-slate-500">·</span>
						{row.shared_service_id ? (
							<>
								<Badge
									variant="outline"
									className="max-w-full shrink-0 border-orange-300 bg-orange-50 font-mono_ text-base font-semibold tabular-nums text-orange-900"
									title="Servicio compartido"
								>
									{row.shared_service_id}
								</Badge>
								<span className="text-slate-500">·</span>
							</>
						) : null}
						<span className="min-w-0 font-semibold leading-snug text-orange-800">
							{row.service_name}
						</span>
						<span className="text-slate-500">·</span>
						<span className="min-w-0 font-normal text-black">
							{paxShort}
						</span>
						{row.stale && (
							<Badge variant="secondary" className="text-amber-900">
								Sin sincronizar
							</Badge>
						)}
					</div>
					<span
						className="shrink-0 text-right text-sm text-slate-500 tabular-nums"
						title="Desde el escaneo"
					>
						{waitLabel}
					</span>
				</div>

				<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
					<p className="font-semibold leading-snug text-orange-800">
						{row.agreement_name}
					</p>
					{hasCategoryBadge(row.customer_category) && (
						<Badge
							variant="outline"
							className={cn(
								'shrink-0 border',
								categoryBadgeClass(row.customer_category),
							)}
						>
							{row.customer_category}
						</Badge>
					)}
				</div>

				<div className="flex flex-col gap-1">
					<span className="font-medium text-base text-slate-900">
						{row.customer_full_name.toUpperCase()}
					</span>
					<span className="text-sm leading-relaxed text-slate-700">
						{row.destination_address ?? '—'}
					</span>
				</div>
			</div>
		</li>
	);
}
