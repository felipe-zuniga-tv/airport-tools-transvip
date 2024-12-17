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
import { IBookingInfoOutput } from '@/lib/chat/types';

export function QRCodeGeneratorDialog({ session } : {
	session: any 
}) {
	const [bookingNumber, setBookingNumber] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [isQrVisible, setIsQrVisible] = useState<boolean>(false);
	const [passengerName, setPassengerName] = useState<string | null>(null);
	const [destinationAddress, setDestinationAddress] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const generateQRCode = async () => {
		setErrorMessage('');
		setIsLoading(true);

		// Reset passenger name and destination address
		setPassengerName(null);
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

			if (bookingInfo[0].booking.type_of_trip !== 'A') {
				setPassengerName(bookingInfo[0].customer.full_name)
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
			} else if (bookingInfo[0].booking.type_of_trip !== 'Z') {
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
				<div className='flex flex-col gap-4'>
					<div className='flex flex-row gap-2 items-center'>
						<input
							type="number"
							value={bookingNumber}
							onChange={(e) => setBookingNumber(e.target.value)}
							placeholder="Número de reserva"
							className="w-full p-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
						/>
						<button onClick={generateQRCode}
							className="mx-auto min-w-fit px-4 py-2 text-lg bg-transvip text-white rounded-md hover:bg-transvip-dark"
						>
							Generar QR
						</button>
					</div>
					{errorMessage && <div className='text-center bg-red-400 text-white w-full p-2 rounded-md'>{errorMessage}</div>}
					{isLoading && <div className='text-center bg-yellow-500 text-black w-full p-2 rounded-md'>Cargando...</div>}
					{isQrVisible && qrCodeUrl && (
						<div className="mx-auto flex flex-col gap-2 items-start justify-center">
							{passengerName && (
								<div className='flex flex-row gap-1 items-center'>
									<span className="block text-center font-semibold">Pasajero:</span>
									<span className="block text-center truncate max-w-[370px]">{passengerName}</span>
								</div>
							)}
							{destinationAddress && (
								<div className='flex flex-row gap-1 items-center'>
									<span className="block text-center font-semibold">Destino:</span>
									<span className="block text-center truncate max-w-[370px]">{destinationAddress}</span>
								</div>
							)}
							<Image height={450} width={450} src={qrCodeUrl} alt='Código QR Generado' className="mx-auto" />
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
