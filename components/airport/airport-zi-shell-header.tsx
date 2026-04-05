'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TransvipLogo } from '@/components/transvip/transvip-logo'
import { LiveClock } from '@/components/ui/live-clock'
import { QRCodeGeneratorDialog } from '@/components/qr/qr-code-generator-dialog'
import { QRCodeScannerDialog } from '@/components/qr/qr-code-scanner-dialog'
import type { AirportZone } from '@/lib/config/airport'
import { Routes } from '@/utils/routes'

interface AirportZiShellHeaderProps {
	zone: AirportZone
	session: unknown
	onBoardScanSuccess?: () => void
}

export const AirportZiShellHeader = ({
	zone,
	session,
	onBoardScanSuccess,
}: AirportZiShellHeaderProps) => {
	return (
		<header className="flex flex-col items-center gap-2 bg-transvip/90 p-4 shadow-md sm:flex-row sm:justify-start sm:gap-4">
			<div className="flex w-full flex-row items-center justify-center gap-4 sm:justify-start">
				<TransvipLogo size={36} colored={false} logoOnly className="" />
				<div className="flex flex-col justify-start gap-1">
					<div className="flex w-full flex-row items-center justify-center gap-1 md:justify-start">
						<span className="text-lg font-bold text-white lg:text-xl">
							Aeropuerto
						</span>
						<span className="text-lg font-bold text-white lg:text-xl">·</span>
						<span className="text-lg font-bold text-white lg:text-xl">
							{zone.city_name}
						</span>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<span className="w-fit rounded-full bg-transvip-dark p-1 px-4 hover:bg-orange-900">
							<Link
								href={Routes.AIRPORT.HOME}
								className="flex items-center gap-0 text-xs font-semibold text-white"
							>
								<ArrowLeft className="mr-1 h-4 w-4 font-bold" /> Volver al inicio
							</Link>
						</span>
					</div>
				</div>
			</div>
			<QRCodeScannerDialog
				branchId={zone.branch_id}
				onBoardScanSuccess={onBoardScanSuccess}
			/>
			<QRCodeGeneratorDialog session={session} />
			<LiveClock className="mx-auto md:ml-auto" />
		</header>
	)
}
