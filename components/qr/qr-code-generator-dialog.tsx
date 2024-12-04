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

export function QRCodeGeneratorDialog() {
  const [bookingNumber, setBookingNumber] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isQrVisible, setIsQrVisible] = useState<boolean>(false);

  const generateQRCode = () => {
    setErrorMessage('');

    if (!bookingNumber) {
      setErrorMessage('Ingresa un número de reserva');
      return;
    }

    const qrData = encodeURIComponent(`{"booking_id":${bookingNumber},"url":"www.transvip.cl/"}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${qrData}`;
    setQrCodeUrl(qrUrl);
    setIsQrVisible(true);
  };

  const handleStartOver = () => {
    setBookingNumber('');
    setErrorMessage('');
    setQrCodeUrl(null);
    setIsQrVisible(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default"><QrCode /> Generar QR</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generar Código QR</DialogTitle>
          <DialogDescription>
            Ingresa el número de reserva.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <input
            type="number"
            value={bookingNumber}
            onChange={(e) => setBookingNumber(e.target.value)}
            placeholder="Ingresa el número de reserva"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
          <Button variant={"default"} onClick={generateQRCode}
            className="mx-auto px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-300"
          >
            Generar código QR
          </Button>
          {errorMessage && <div className='text-center text-red-500'>{errorMessage}</div>}
          {isQrVisible && qrCodeUrl && (
            <div className="my-6 mx-auto">
              <Image height={400} width={400} src={qrCodeUrl} alt='Código QR Generado' className="mx-auto" />
            </div>
          )}
        </div>
        <DialogFooter className='mt-6'>
          <Button type="button" onClick={handleStartOver} className="px-4 py-2 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition duration-300 min-w-fit">
            Empezar de nuevo
            <RotateCw className='ml-2 h-4 w-4' />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
