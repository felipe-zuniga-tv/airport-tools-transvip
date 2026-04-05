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
			<div className="h-44 w-full animate-pulse rounded-lg bg-slate-100" />
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
}: {
	zone: AirportZone;
	hideHeader?: boolean;
	/** When set (e.g. from workspace shell), registers `load` for header QR refresh. */
	boardReloadRef?: MutableRefObject<(() => void) | null>;
}) => {
	const [data, setData] = useState<BoardActiveResponse | null>(null);
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

	const mapPoints: BoardMapPoint[] = useMemo(() => {
		if (!data) return [];
		const all = [...data.shared, ...data.exclusive];
		const out: BoardMapPoint[] = [];
		for (const row of all) {
			if (
				row.dest_lat == null ||
				row.dest_lng == null ||
				!Number.isFinite(row.dest_lat) ||
				!Number.isFinite(row.dest_lng)
			) {
				continue;
			}
			if (row.dest_lat === 0 && row.dest_lng === 0) continue;
			out.push({
				booking_id: row.booking_id,
				lat: row.dest_lat,
				lng: row.dest_lng,
				title: row.destination_address || row.service_name,
			});
		}
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
					'mx-auto flex w-full max-w-4xl flex-col gap-4 p-4',
					hideHeader ? 'min-h-0 flex-1 overflow-auto' : 'flex-1',
				)}
			>
				{error && (
					<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
						{error}
					</div>
				)}

				<section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<h2 className="sr-only">Resumen</h2>
					<div className="flex flex-wrap gap-4 text-sm sm:text-base">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-slate-600">Reservas:</span>
							<span className="text-lg font-bold tabular-nums">
								{data?.total_bookings ?? '—'}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-semibold text-slate-600">Pasajeros:</span>
							<span className="text-lg font-bold tabular-nums">
								{data?.total_pax ?? '—'}
							</span>
						</div>
						<div className="ml-auto flex min-w-0 flex-1 items-center gap-2">
							<Clock className="size-4 shrink-0 text-slate-500" />
							<span className="font-semibold text-slate-600">
								Más antiguo:
							</span>
							<span className="truncate text-slate-900">
								{data?.oldest_scanned_at
									? formatDistanceToNow(new Date(data.oldest_scanned_at), {
											addSuffix: true,
											locale: es,
										})
									: '—'}
							</span>
						</div>
					</div>
				</section>

				<section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<h2 className="mb-2 text-sm font-semibold text-slate-700">
						Mapa de destinos
					</h2>
					<BoardDestinationsMap points={mapPoints} />
				</section>

				<section className="rounded-xl border border-slate-200 bg-white shadow-sm">
					<div
						role="tablist"
						className="flex border-b border-slate-200"
						aria-label="Tipo de servicio"
					>
						<button
							type="button"
							role="tab"
							aria-selected={tab === 'shared'}
							className={cn(
								'relative flex flex-1 flex-col items-center gap-1 py-3 text-sm font-medium transition-colors sm:flex-row sm:justify-center sm:gap-2 sm:text-base',
								tab === 'shared'
									? 'text-orange-600'
									: 'text-slate-500 hover:text-slate-800',
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
								'relative flex flex-1 flex-col items-center gap-1 py-3 text-sm font-medium transition-colors sm:flex-row sm:justify-center sm:gap-2 sm:text-base',
								tab === 'exclusive'
									? 'text-orange-600'
									: 'text-slate-500 hover:text-slate-800',
							)}
							onClick={() => setTab('exclusive')}
						>
							<Star
								className={cn(
									'size-5 sm:size-6',
									tab === 'exclusive' ? 'text-orange-600' : 'text-slate-400',
								)}
							/>
							<span>Exclusivos</span>
						</button>
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
			</main>
		</div>
	);
};

function BoardRow({ row }: { row: BoardListItem }) {
	const waitLabel = formatDistanceToNow(new Date(row.scanned_at), {
		addSuffix: true,
		locale: es,
	});
	const paxLabel =
		row.pax_count === 1 ? '1 pasajero' : `${row.pax_count} pasajeros`;

	return (
		<li>
			<div className="flex min-w-0 flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
				<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
					<span className="text-base font-bold tabular-nums text-slate-900">
						#{row.booking_id}
					</span>
					<span className="text-slate-300" aria-hidden>
						·
					</span>
					<span title="Desde el escaneo">{waitLabel}</span>
					{row.stale && (
						<>
							<span className="text-slate-300" aria-hidden>
								·
							</span>
							<Badge variant="secondary" className="text-amber-900">
								Sin sincronizar
							</Badge>
						</>
					)}
					{hasCategoryBadge(row.customer_category) && (
						<>
							<span className="text-slate-300" aria-hidden>
								·
							</span>
							<Badge
								variant="outline"
								className={cn(
									'border',
									categoryBadgeClass(row.customer_category),
								)}
							>
								{row.customer_category}
							</Badge>
						</>
					)}
				</div>

				<div className="border-l-2 border-orange-400 pl-3">
					<p className="font-semibold leading-snug text-orange-800">
						{row.service_name}
					</p>
					<p className="mt-1 text-sm text-slate-600">{paxLabel}</p>
				</div>

				<div>
					<p className="mt-0.5 font-medium text-slate-900">
						{row.customer_full_name.toUpperCase()}
					</p>
					<p className="mt-0.5 text-sm leading-relaxed text-slate-700">
						{row.destination_address ?? '—'}
					</p>
				</div>
			</div>
		</li>
	);
}
