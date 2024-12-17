import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { BookingIdSearch } from './booking-search';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

export function BookingSearchDialog() {
    const [bookingId, setBookingId] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [bookingInfo, setBookingInfo] = useState<any>(null); // Adjust type as needed
    const [loading, setLoading] = useState<boolean>(false); // New loading state

    const handleDialogClose = () => {
        setBookingId('');
        setErrorMessage('');
        setBookingInfo(null);
        setLoading(false);
    };

    const searchBooking = async () => {
        setErrorMessage('');
        setLoading(true); // Set loading to true when starting the search

        if (!bookingId) {
            setErrorMessage('Ingresa un ID de reserva');
            setLoading(false); // Reset loading state
            return;
        }

        try {
            const response = await fetch('/api/booking/get-booking-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookingId }), // Adjust isShared as needed
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Reserva no encontrada');
                setLoading(false); // Reset loading state
                return;
            }

            const info = await response.json();
            setBookingInfo(info);
        } catch (error) {
            console.error(error);
            setErrorMessage('Error al buscar la reserva');
        } finally {
            setLoading(false); // Reset loading state after the operation
        }
    };

    return (
        <Dialog onOpenChange={(open) => { if (!open) handleDialogClose(); }}>
            <DialogTrigger asChild>
                <Button variant="default">Buscar Reserva</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl sm:max-h-[90%]">
                <DialogHeader>
                    <DialogTitle>Ingresa el número de Reserva</DialogTitle>
                </DialogHeader>
                <div className='flex flex-col gap-4'>
                    <div className='flex flex-row gap-2 items-center justify-start'>
                        <input
                            type="number"
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                            placeholder="Ingresa el ID de la reserva"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                        <Button variant={"default"} onClick={searchBooking}
                            className="mx-auto px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-300"
                            disabled={loading}>
                            <MagnifyingGlassIcon /> {loading ? 'Cargando...' : 'Buscar'} {/* Show loading text */}
                        </Button>

                    </div>
                    {errorMessage && <div className='text-center text-red-500'>{errorMessage}</div>}
                    {bookingInfo && (
                        <div className='max-h-[80%] overflow-y-auto'>
                            <BookingIdSearch searchResults={bookingInfo} />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
