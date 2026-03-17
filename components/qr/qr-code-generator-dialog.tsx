'use client'

import Image from "next/image";
import { QrCode, RotateCw } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	// DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import TextValue from '@/components/common/text-value';
import { readApiEnvelope } from '@/lib/api/client';
import { IBookingInfoOutput } from '@/lib/main/types';

export function QRCodeGeneratorDialog({ session }: {
	session: any
}) {
	const [bookingNumber, setBookingNumber] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [isQrVisible, setIsQrVisible] = useState<boolean>(false);
	const [passengerName, setPassengerName] = useState<string | null>(null);
	const [serviceName, setServiceName] = useState<string | null>(null);
	const [paxCount, setPaxCount] = useState<number | null>(null);
	const [destinationAddress, setDestinationAddress] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [vipLabel, setVipLabel] = useState<string | null>(null);
	const [sharedServiceId, setSharedServiceId] = useState<string | null>(null);

	const generateQRCode = async () => {
		setErrorMessage('');
		setIsLoading(true);
		setQrCodeUrl(null);
		setIsQrVisible(false);

		// Reset passenger name and destination address
		setPassengerName(null);
		setServiceName(null);
		setPaxCount(null);
		setDestinationAddress(null);
		setVipLabel(null);
		setSharedServiceId(null);

		if (!bookingNumber) {
			setErrorMessage('Ingresa un número de reserva');
			setIsLoading(false);
			return;
		}

		// Fetch booking info before generating the QR code
		const bookingInfoResponse = await fetch('/api/booking/get-booking-info', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ bookingId: bookingNumber }), // Adjust isShared as needed
		});

		setIsLoading(false);

		if (bookingInfoResponse.ok) {
			const { data: bookingInfo } = await readApiEnvelope<IBookingInfoOutput[]>(bookingInfoResponse);

			if (!bookingInfo?.length) {
				setErrorMessage('Reserva no fue encontrada');
				return
			}

			const bookingZarpe = bookingInfo[0].booking.type_of_trip === 'Z' || bookingInfo[0].booking.type_of_trip === 'P'

			if (bookingZarpe) {
				setPassengerName(bookingInfo[0].customer.full_name)
				setServiceName(bookingInfo[0].booking.service_name)
				setPaxCount(Number(bookingInfo[0].booking.pax_count))
				setDestinationAddress(bookingInfo[0].directions.destination.address);
				setVipLabel(bookingInfo[0].customer.vip_label);
				setSharedServiceId(bookingInfo[0].booking.shared_service_id ?? null);

				// Generate QR code only if booking is found
				const qrData = encodeURIComponent(`{"booking_id":${bookingNumber},"url":"www.transvip.cl/"}`);
				const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${qrData}&margin=0`;
				setQrCodeUrl(qrUrl);
				setIsQrVisible(true);

				// Log the QR code generation
				await fetch('/api/logs/qr-code', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						booking_id: bookingNumber,
						user: session.user.email,
						timestamp: new Date().toISOString(),
					}),
				});
			} else if (!bookingZarpe) {
				setErrorMessage('Reserva no es de tipo Zarpe');
			} else {
				setErrorMessage('Reserva no encontrada');
			}
		} else {
			setErrorMessage('Error fetching booking information');
		}
	};

	const handleStartOver = () => {
		setBookingNumber('');
		setErrorMessage('');
		setQrCodeUrl(null);
		setIsQrVisible(false);
	};

	return (
		<Dialog onOpenChange={(open) => { if (!open) handleStartOver(); }}>
			<DialogTrigger asChild>
				<Button variant="default" className="text-lg h-full px-6">
					<QrCode className='size-6 shrink-0' />
					<span className='font-normal'>Generar QR</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Generar Código QR</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-3'>
					<div className='flex flex-row gap-2 items-center'>
						<input
							type="number"
							value={bookingNumber}
							onChange={(e) => setBookingNumber(e.target.value)}
							placeholder="Número de reserva"
							className="text-center w-full p-2 text-xl border border-gray-300 rounded-md focus:outline-none ring-0"
						/>
						<Button onClick={generateQRCode}
							className="mx-auto min-w-fit px-8 h-full text-lg bg-transvip hover:bg-transvip-dark text-white rounded-md"
						>
							Generar QR
						</Button>
					</div>
					{errorMessage && <div className='text-center bg-red-400 text-white w-full p-2 rounded-md'>{errorMessage}</div>}
					{isLoading && <div className='text-center bg-yellow-300 text-black w-full p-2 rounded-md'>Cargando...</div>}
					{isQrVisible && qrCodeUrl && (
						<div className="flex flex-col gap-4 items-center justify-center">
							<div className='passenger-info w-full h-auto flex flex-col gap-1 items-start justify-center p-3 bg-green-100 rounded-md shadow-md whitespace-normal text-left font-normal text-foreground'>
								{passengerName && (
									<div className="flex flex-row gap-2 w-full items-center justify-between">
										<TextValue text="Pasajero:" value={passengerName} />
										{(vipLabel === 'VIP' || vipLabel === 'SUPERVIP') && (
											<Badge
												variant="default"
												className={`whitespace-nowrap ${vipLabel === 'SUPERVIP' ? 'bg-yellow-200 hover:bg-yellow-300 text-black' : vipLabel === 'VIP' ? 'bg-teal-500 hover:bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
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
							{ /* <Image height={400} width={400} src={qrCodeUrl} alt='Código QR Generado' className="mt-3" /> */}
							<Image src={qrCodeUrl} alt='Código QR Generado' width={400} height={400} className="h-[400px] w-[400px]" />
						</div>
					)}
				</div>
				<DialogFooter className='mt-4'>
					<Button type="button" onClick={handleStartOver} className="px-4 py-2 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition duration-300 min-w-fit">
						Empezar de nuevo
						<RotateCw className='size-4 shrink-0' />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
