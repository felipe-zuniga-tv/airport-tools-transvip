'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BusFront, CarTaxiFront, Truck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { readApiEnvelope } from '@/lib/api/client'
import type { AirportZone } from '@/lib/config/airport'
import { AIRPORT_CONSTANTS } from '@/lib/config/airport'
import type { BoardActiveResponse } from '@/lib/board/types'
import type { AirportVehicleType } from '@/lib/types'
import { useAirportStatus } from '@/hooks/use-airport-status'
import { AirportZiShellHeader } from '@/components/airport/airport-zi-shell-header'
import AirportStatusClient from '@/components/airport/airport-status-client'
import { WaitingBoardClient } from '@/components/board/waiting-board-client'

const BOARD_SUMMARY_POLL_MS = 22_000

function countForFirstMatchingType(
	types: AirportVehicleType[],
	candidates: string[],
) {
	for (const name of candidates) {
		const key = name.trim().toLowerCase()
		const t = types.find((v) => v.name.trim().toLowerCase() === key)
		if (t) return t.count
	}
	return undefined
}

function formatTypeCount(value: number | null | undefined) {
	if (value === null || value === undefined) return '—'
	return value
}

type WorkspaceTab = 'zi' | 'inbound' | 'pasajeros'

interface AirportZiWorkspaceProps {
	zone: AirportZone
	session: unknown
	vehicleTypesList: AirportVehicleType[]
}

export const AirportZiWorkspace = ({
	zone,
	session,
	vehicleTypesList,
}: AirportZiWorkspaceProps) => {
	const [tab, setTab] = useState<WorkspaceTab>('zi')
	/** Latest board payload from polling — shared with Pasajeros tab so counts match before child fetch completes. */
	const [boardSnapshot, setBoardSnapshot] = useState<BoardActiveResponse | null>(
		null,
	)
	const boardReloadRef = useRef<(() => void) | null>(null)

	const loadBoardSummary = useCallback(async () => {
		try {
			const res = await fetch(
				`/api/board/active?branchId=${encodeURIComponent(String(zone.branch_id))}`,
				{ cache: 'no-store' },
			)
			const payload = await readApiEnvelope<BoardActiveResponse>(res)
			if (!res.ok || payload.error || payload.data === null) {
				return
			}
			setBoardSnapshot(payload.data)
		} catch {
			// keep last value
		}
	}, [zone.branch_id])

	useEffect(() => {
		const t = window.setTimeout(() => void loadBoardSummary(), 0)
		const id = window.setInterval(() => void loadBoardSummary(), BOARD_SUMMARY_POLL_MS)
		return () => {
			window.clearTimeout(t)
			window.clearInterval(id)
		}
	}, [loadBoardSummary])

	const sharedZoneStatus = useAirportStatus(
		zone,
		AIRPORT_CONSTANTS.SECONDS_TO_UPDATE,
		vehicleTypesList,
		true,
	)

	const minibusCount = useMemo(
		() =>
			countForFirstMatchingType(sharedZoneStatus.vehicleTypes, [
				'minibus',
				'van',
			]),
		[sharedZoneStatus.vehicleTypes],
	)
	const sedanCount = useMemo(
		() =>
			countForFirstMatchingType(sharedZoneStatus.vehicleTypes, ['taxi']),
		[sharedZoneStatus.vehicleTypes],
	)

	const ziTabLabel = useMemo(() => {
		const m = formatTypeCount(minibusCount)
		const s = formatTypeCount(sedanCount)
		return `Zona Iluminada, Minibus ${m}, Taxi ${s}`
	}, [minibusCount, sedanCount])

	return (
		<div className="flex h-screen flex-col bg-gray-100">
			<AirportZiShellHeader
				zone={zone}
				session={session}
				onBoardScanSuccess={() => {
					boardReloadRef.current?.()
					void loadBoardSummary()
				}}
			/>

			<div
				role="tablist"
				aria-label="Vista de aeropuerto"
				className="hidden flex border-b border-slate-200 bg-white shadow-sm"
			>
				<button
					type="button"
					role="tab"
					aria-selected={tab === 'zi'}
					aria-label={ziTabLabel}
					className={cn(
						'flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 px-2 py-2.5 text-sm font-semibold transition-colors sm:flex-row sm:gap-2 sm:py-3 sm:text-base',
						tab === 'zi'
							? 'border-b-2 border-orange-600 text-orange-700'
							: 'text-slate-500 hover:text-slate-800',
					)}
					onClick={() => setTab('zi')}
				>
					<span className="flex items-center gap-1.5">
						<span>Zona Iluminada</span>
					</span>
					<span className="flex flex-wrap items-center justify-center gap-1.5">
						<span
							className={cn(
								'inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs font-bold tabular-nums',
								tab === 'zi'
									? 'border-orange-200 bg-orange-50 text-orange-900'
									: 'border-slate-200 bg-slate-100 text-slate-700',
							)}
							title="Minibus en zona"
						>
							<BusFront className="size-3.5 shrink-0 mr-1" aria-hidden />
							<span className="sr-only">Minibus:</span>
							{formatTypeCount(minibusCount)}
						</span>
						<span
							className={cn(
								'inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs font-bold tabular-nums',
								tab === 'zi'
									? 'border-orange-200 bg-orange-50 text-orange-900'
									: 'border-slate-200 bg-slate-100 text-slate-700',
							)}
							title="Sedan en zona"
						>
							<CarTaxiFront className="size-3.5 shrink-0 mr-1" aria-hidden />
							<span className="sr-only">Sedan:</span>
							{formatTypeCount(sedanCount)}
						</span>
					</span>
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={tab === 'inbound'}
					aria-label="En camino, vehículos inbound"
					className={cn(
						'flex flex-1 items-center justify-center gap-2 px-2 py-3 text-sm font-semibold transition-colors sm:text-base',
						tab === 'inbound'
							? 'border-b-2 border-orange-600 text-orange-700'
							: 'text-slate-500 hover:text-slate-800',
						!zone.enable_inbound && 'hidden opacity-50',
					)}
					onClick={() => setTab('inbound')}
				>
					<Truck
						className={cn(
							'size-5 shrink-0 sm:size-6',
							tab === 'inbound' ? 'text-orange-600' : 'text-slate-400',
						)}
						aria-hidden
					/>
					<span>En camino</span>
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={tab === 'pasajeros'}
					aria-label={
						boardSnapshot != null
							? `Pasajeros, tablero de espera, ${boardSnapshot.total_pax} pasajeros en total`
							: 'Pasajeros, tablero de espera'
					}
					className={cn(
						'flex flex-1 items-center justify-center gap-2 px-2 py-3 text-sm font-semibold transition-colors sm:text-base',
						tab === 'pasajeros'
							? 'border-b-2 border-orange-600 text-orange-700'
							: 'text-slate-500 hover:text-slate-800',
					)}
					onClick={() => setTab('pasajeros')}
				>
					<Users
						className={cn(
							'size-5 shrink-0 sm:size-6',
							tab === 'pasajeros' ? 'text-orange-600' : 'text-slate-400',
						)}
						aria-hidden
					/>
					<span className="flex items-center gap-2">
						Pasajeros
						<span
							className={cn(
								'flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white tabular-nums',
								tab === 'pasajeros' ? 'bg-orange-600' : 'bg-slate-400',
							)}
						>
							{boardSnapshot?.total_pax ?? '—'}
						</span>
					</span>
				</button>
			</div>

			<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
				{tab === 'zi' && (
					<AirportStatusClient
						vehicleTypesList={vehicleTypesList}
						zone={zone}
						session={session}
						hideHeader
						sharedZoneStatus={sharedZoneStatus}
						fixedDashboardView="in_zone"
					/>
				)}
				{tab === 'inbound' && (
					<AirportStatusClient
						vehicleTypesList={vehicleTypesList}
						zone={zone}
						session={session}
						hideHeader
						sharedZoneStatus={sharedZoneStatus}
						fixedDashboardView="inbound"
					/>
				)}
				{tab === 'pasajeros' && (
					<WaitingBoardClient
						zone={zone}
						hideHeader
						boardReloadRef={boardReloadRef}
						initialSnapshot={boardSnapshot}
					/>
				)}
			</div>
		</div>
	)
}
