'use client'

import { QrCode, RotateCw } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import TextValue from '@/components/ui/common/text-value';

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

	const generateQRCode = async () => {
		setErrorMessage('');
		setIsLoading(true);

		// Reset passenger name and destination address
		setPassengerName(null);
		setServiceName(null);
		setPaxCount(null);
		setDestinationAddress(null);

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
			const bookingInfo = await bookingInfoResponse.json();

			if (bookingInfo.status === 404 || bookingInfo.length === 0) {
				setErrorMessage('Reserva no fue encontrada');
				return
			}

			const bookingZarpe = bookingInfo[0].booking.type_of_trip === 'Z'

			if (bookingZarpe) {
				setPassengerName(bookingInfo[0].customer.full_name)
				setServiceName(bookingInfo[0].booking.service_name)
				setPaxCount(bookingInfo[0].booking.pax_count)
				setDestinationAddress(bookingInfo[0].directions.destination.address);

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
				<Button variant="default"><QrCode /> Generar QR</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Generar Código QR</DialogTitle>
					<DialogDescription>Ingresa el número de reserva.</DialogDescription>
				</DialogHeader>
				<div className='flex flex-col gap-3'>
					<div className='flex flex-row gap-2 items-center'>
						<input
							type="number"
							value={bookingNumber}
							onChange={(e) => setBookingNumber(e.target.value)}
							placeholder="Número de reserva"
							className="w-full p-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
						/>
						<button onClick={generateQRCode}
							className="mx-auto min-w-fit px-4 py-2 text-lg bg-transvip hover:bg-transvip-dark text-white rounded-md"
						>
							Generar QR
						</button>
					</div>
					{errorMessage && <div className='text-center bg-red-400 text-white w-full p-2 rounded-md'>{errorMessage}</div>}
					{isLoading && <div className='text-center bg-yellow-300 text-black w-full p-2 rounded-md'>Cargando...</div>}
					{isQrVisible && qrCodeUrl && (
						<div className="flex flex-col gap-3 items-center justify-center">
							<div className='passenger-info w-full flex flex-col gap-1 items-start justify-center p-3 bg-green-100 rounded-md shadow-md'>
								{passengerName && (<TextValue text="Pasajero:" value={passengerName} />)}
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
							<img src={qrCodeUrl} alt='Código QR Generado' className="mt-3 h-[400px] w-[400px]" />
						</div>
					)}
				</div>
				<DialogFooter className='mt-2'>
					<Button type="button" onClick={handleStartOver} className="px-4 py-2 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition duration-300 min-w-fit">
						Empezar de nuevo
						<RotateCw className='ml-2 h-4 w-4' />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
