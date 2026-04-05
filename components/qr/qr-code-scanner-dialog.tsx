'use client'

import { Scanner } from '@yudiel/react-qr-scanner';
import { ScanLine, RotateCw, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import TextValue from '@/components/common/text-value';
import { cn } from '@/lib/utils';
import { readApiEnvelope, unwrapApiEnvelope } from '@/lib/api/client';
import { IBookingInfoOutput } from '@/lib/main/types';

interface QRCodeScannerDialogProps {
	branchId: number;
	/** Called after a Zarpe QR is registered on the board (e.g. refresh tablero). */
	onBoardScanSuccess?: () => void;
	/** Extra classes for the trigger button (e.g. on colored headers). */
	triggerClassName?: string;
}

export function QRCodeScannerDialog({
	branchId,
	onBoardScanSuccess,
	triggerClassName,
}: QRCodeScannerDialogProps) {
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [isScanning, setIsScanning] = useState<boolean>(true);
	const [passengerName, setPassengerName] = useState<string | null>(null);
	const [serviceName, setServiceName] = useState<string | null>(null);
	const [paxCount, setPaxCount] = useState<number | null>(null);
	const [destinationAddress, setDestinationAddress] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [vipLabel, setVipLabel] = useState<string | null>(null);
	const [sharedServiceId, setSharedServiceId] = useState<string | null>(null);
	const [bookingId, setBookingId] = useState<string | null>(null);

	const handleScan = async (result: any) => {
		if (!result || result.length === 0) return;
		
		const rawValue = result[0].rawValue;
		
		try {
			// Stop scanning while processing
			setIsScanning(false);
			setIsLoading(true);
			setErrorMessage('');

			// Parse the QR code data
			// Expected format: {"booking_id":123,"url":"www.transvip.cl/"}
			// The QR generator uses encodeURIComponent, but the scanner might decode it automatically or return raw
			// Usually scanners return the decoded text. If it was encoded with encodeURIComponent, we might need decodeURIComponent.
			// However, the generator code: 
			// const qrData = encodeURIComponent(`{"booking_id":${bookingNumber},"url":"www.transvip.cl/"}`);
			// const qrUrl = `...&data=${qrData}...`
			// The QR code itself contains the *decoded* string if the generator API handles the encoding correctly.
			// Let's assume the QR contains the JSON string directly.
			
			let parsedData;
			try {
				parsedData = JSON.parse(rawValue);
			} catch (e) {
				// If it fails, maybe it is URL encoded?
				try {
					parsedData = JSON.parse(decodeURIComponent(rawValue));
				} catch (e2) {
					throw new Error('Formato de QR inválido');
				}
			}

			if (!parsedData.booking_id) {
				throw new Error('QR no contiene ID de reserva');
			}

			const scannedBookingId = parsedData.booking_id;
			setBookingId(scannedBookingId);

			// Fetch booking info
			const bookingInfoResponse = await fetch('/api/booking/get-booking-detail', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ bookingId: scannedBookingId }),
			});

			const bookingInfo = await unwrapApiEnvelope<IBookingInfoOutput>(
				bookingInfoResponse,
				'Error al obtener información de la reserva',
			);

			const bookingZarpe = bookingInfo.booking.type_of_trip === 'Z';

			if (bookingZarpe) {
				const scanRes = await fetch('/api/board/scan', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						bookingId: scannedBookingId,
						branchId,
					}),
				});
				const scanPayload = await readApiEnvelope<{ ok: boolean }>(scanRes);
				if (!scanRes.ok || scanPayload.error) {
					throw new Error(
						scanPayload.error ?? 'No se pudo registrar en el tablero de espera',
					);
				}

				setPassengerName(bookingInfo.customer.full_name);
				setServiceName(bookingInfo.booking.service_name);
				setPaxCount(Number(bookingInfo.booking.pax_count));
				setDestinationAddress(bookingInfo.directions.destination.address);
				setVipLabel(bookingInfo.customer.vip_label);
				setSharedServiceId(bookingInfo.booking.shared_service_id ?? null);
				onBoardScanSuccess?.();
			} else {
				setErrorMessage('Reserva no es de tipo Zarpe');
			}
		} catch (error: any) {
			console.error(error);
			setErrorMessage(error.message || 'Error al procesar el QR');
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setErrorMessage('');
		setIsScanning(true);
		setPassengerName(null);
		setServiceName(null);
		setPaxCount(null);
		setDestinationAddress(null);
		setVipLabel(null);
		setSharedServiceId(null);
		setBookingId(null);
	};

	return (
		<Dialog onOpenChange={(open) => { if (!open) handleReset(); }}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={cn('text-lg h-full px-6 gap-2', triggerClassName)}
				>
					<ScanLine className='size-6 shrink-0' />
					<span className='font-normal'>Escanear QR</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Escanear Código QR</DialogTitle>
				</DialogHeader>
				
				<div className='flex flex-col gap-4'>
					{isScanning ? (
						<div className="w-full aspect-square relative overflow-hidden rounded-lg border-2 border-slate-200">
							<Scanner 
								onScan={handleScan}
								onError={(error) => console.error(error)}
								components={{
									onOff: false,
									torch: false,
									zoom: false,
									finder: true,
								}}
								constraints={{
									facingMode: 'environment',
								}}
								styles={{
									container: { width: '100%', height: '100%' }
								}}
							/>
							<div className="absolute inset-0 pointer-events-none flex items-center justify-center">
								<div className="w-64 h-64 border-2 border-white/50 rounded-lg"></div>
							</div>
						</div>
					) : (
						<div className="flex flex-col gap-4">
							{errorMessage ? (
								<div className="flex flex-col items-center justify-center p-6 bg-red-50 text-red-600 rounded-lg gap-2">
									<XCircle className="w-12 h-12" />
									<p className="font-medium text-center">{errorMessage}</p>
								</div>
							) : isLoading ? (
								<div className="flex items-center justify-center h-40">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-transvip"></div>
								</div>
							) : (
								<div className='passenger-info w-full h-auto flex flex-col gap-1 items-start justify-center p-3 bg-green-100 rounded-md shadow-md whitespace-normal text-left font-normal text-foreground'>
									{bookingId && (
										<div className="w-full text-center mb-2 pb-2 border-b border-green-200">
											<span className="font-bold text-lg">Reserva #{bookingId}</span>
										</div>
									)}
									{passengerName && (
										<div className="flex flex-row gap-2 w-full items-center justify-between">
											<TextValue text="Pasajero:" value={passengerName} />
											{(vipLabel === 'VIP' || vipLabel === 'SUPERVIP') && (
												<Badge
													variant="default"
													className={`whitespace-nowrap ${vipLabel === 'SUPERVIP' ? 'bg-yellow-200 text-black' : vipLabel === 'VIP' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-800'}`}
												>
													{vipLabel}
												</Badge>
											)}
										</div>
									)}
									{sharedServiceId && (
										<div className='flex flex-row gap-1 items-center'>
											<span className="block text-center font-semibold">
												Paquete:
											</span>
											<span className="block text-center truncate max-w-[370px]">
												{sharedServiceId}
											</span>
										</div>
									)}
									{serviceName && paxCount && (
										<div className='flex flex-row gap-1 items-center'>
											<span className="block text-center font-semibold">Servicio:</span>
											<span className="block text-center truncate max-w-[370px]">{serviceName}</span>
											<span>·</span>
											<span className="block text-center font-semibold">Pasajeros:</span>
											<span className="block text-center truncate max-w-[370px]">{paxCount}</span>
										</div>
									)}
									{destinationAddress && (<TextValue text="Destino:" value={destinationAddress} />)}
								</div>
							)}
						</div>
					)}
				</div>

				<DialogFooter className='mt-4'>
					{!isScanning && (
						<Button type="button" onClick={handleReset} className="px-4 py-2 bg-transvip hover:bg-transvip-dark text-white rounded-md transition duration-300 min-w-fit">
							Escanear otro
							<RotateCw className='size-4 shrink-0 ml-2' />
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
