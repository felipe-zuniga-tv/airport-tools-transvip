'use client'

import { useMemo, useRef, useState } from 'react'
import { BusFront, CarTaxiFront, Sun, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AirportZone } from '@/lib/config/airport'
import { AIRPORT_CONSTANTS } from '@/lib/config/airport'
import type { AirportVehicleType } from '@/lib/types'
import { useAirportStatus } from '@/hooks/use-airport-status'
import { AirportZiShellHeader } from '@/components/airport/airport-zi-shell-header'
import AirportStatusClient from '@/components/airport/airport-status-client'
import { WaitingBoardClient } from '@/components/board/waiting-board-client'

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

type WorkspaceTab = 'zi' | 'pasajeros'

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
	const boardReloadRef = useRef<(() => void) | null>(null)

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
		return `Zona Iluminada, Minibus ${m}, Sedan ${s}`
	}, [minibusCount, sedanCount])

	return (
		<div className="flex h-screen flex-col bg-gray-100">
			<AirportZiShellHeader
				zone={zone}
				session={session}
				onBoardScanSuccess={() => boardReloadRef.current?.()}
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
					aria-selected={tab === 'pasajeros'}
					aria-label="Pasajeros, tablero de espera"
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
					<span>Pasajeros</span>
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
					/>
				)}
				{tab === 'pasajeros' && (
					<WaitingBoardClient
						zone={zone}
						hideHeader
						boardReloadRef={boardReloadRef}
					/>
				)}
			</div>
		</div>
	)
}
