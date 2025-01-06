'use client'

import Link from 'next/link';
import { addMinutes, differenceInDays, differenceInMinutes } from 'date-fns';
import { IBookingInfoOutput } from '@/lib/chat/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckIcon, Clock, GoalIcon, MailIcon, MapIcon, MapPin, Pencil, PhoneIcon, SearchIcon, UserCircleIcon, X } from 'lucide-react';
// import { WhatsappIcon } from '@/components/ui/icons';
import { buildWhatsappLink } from '@/lib/chat/functions';
import { BookingStatusBadge, CityBadge, CustomerVipBadge, PaymentRouteType, PaymentStatusBadge, ServiceNameBadge } from '@/components/badges/chat-badges'
import { BookingIdBadge } from '../badges/booking-badge';
import DriverAvatar from '../driver/driver-avatar';
import Zoom from 'react-medium-image-zoom'
import Image from 'next/image';
import EmailLink from '@/components/ui/email-link';

let chileanPeso = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
});

// Vehicle States to Show
const STATES_TO_SHOW = [2, 4, 12, 0, 1, 15]

export function BookingIdSearch({ searchResults }: {
    searchResults: IBookingInfoOutput[],
}) {
    return (
        <div className="booking-search-results flex flex-col gap-2 mt-2">
            <SharedServiceSummary result={searchResults} />

            <div className={'search-results-cards relative w-full flex flex-col gap-4 items-start'}>
                {searchResults.length > 1 && <span className='-mb-3 mt-2 font-bold'>Detalle de Reservas</span>}
                {searchResults.map((result: IBookingInfoOutput) => (
                    <BookingCard key={result.booking.id} result={result} />
                ))}
            </div>
        </div>
    )
}

function BookingCard({ result }: {
    result: IBookingInfoOutput
}) {
    return (
        <div className='booking-detail main-card'>
            <BookingBadges result={result} />
            <BookingMainDetails result={result} />
            <BookingDates result={result} />
            <BookingCustomer result={result} />
            <BookingPayment result={result} />
            <BookingDirections result={result} />
            <BookingVehicle result={result} />
        </div>
    )
}

function SharedServiceSummary({ result }: {
    result: IBookingInfoOutput[]
}) {

    if (result.length < 2) return null

    return (
        <div className='shared-service-summary bg-white p-2 rounded-md text-slate-900 flex flex-col gap-1.5'>
            <SharedServiceTotals result={result} />
            {result.map(r => (
                <div key={r.booking.id.toString()} className='shared-service-booking flex flex-row gap-2 items-center text-sm'>
                    <BookingIdBadge result={r} />
                    <BookingStatusBadge result={r} />
                    <PaymentStatusBadge result={r} />
                    <span>Fecha: {r.dates.temp_pickup_time ? new Date(r.dates.temp_pickup_time).toLocaleString() : new Date(r.dates.job_time_utc).toLocaleString()}</span>
                    <CityBadge branch={r.branch} isCode={false} className='ml-auto' />
                </div>
            ))
            }
        </div>
    )
}

function SharedServiceTotals({ result }: {
    result: IBookingInfoOutput[]
}) {
    const totalPayment = result.reduce((acc, curr) => acc + curr.payment.actual_payment, 0)
    const totalEstimatedDistance = result.reduce((acc, curr) => acc + curr.directions.estimated_travel_kms, 0)
    const totalActualDistance = result.reduce((acc, curr) => acc + curr.directions.total_travel_kms, 0)

    return (
        <div className='shared-service-totals card-info-detail flex flex-row gap-2 justify-start'>
            <div className='shared-service-total-payment flex flex-row gap-1'>
                <span className='font-semibold'>Pago Total:</span>
                <span>{chileanPeso.format(totalPayment)}</span>
            </div>
            {/* <span>·</span>
            <div className='shared-service-total-estimated-distance flex flex-row gap-1'>
                <span className='font-semibold'>Distancia Estimada:</span>
                <span>{totalEstimatedDistance.toFixed(2)} kms</span>
            </div>
            <span>·</span>
            <div className='shared-service-total-actual-distance flex flex-row gap-1'>
                <span className='font-semibold'>Distancia Real:</span>
                <span>{totalActualDistance.toFixed(2)} kms</span>
            </div> */}
        </div>
    )
}

function BookingMainDetails({ result }: {
    result: IBookingInfoOutput
}) {
    if (!result.booking) return null

    return (
        <div className='booking-detail main-details'>
            <div className='info-section'>
                <div className='flex flex-row gap-2 w-full'>
                    <div className='flex flex-col gap-1 w-full'>
                        <div className='flex flex-row gap-1 items-center justify-start'>
                            {result.booking.shared_service_id && (
                                <>
                                    <div className='card-info-detail gap-1'>
                                        <span className='font-semibold'>Paquete:</span>
                                        <Badge variant="outline"
                                            className='cursor-pointer bg-gray-400/50 hover:bg-secondary/80'>
                                            {result.booking.shared_service_id}
                                        </Badge>
                                    </div>
                                    <span>·</span>
                                </>
                            )}
                            <div className='card-info-detail gap-1'>
                                <span className='font-semibold'>Convenio:</span>
                                <span>{result.booking.contract_name}</span>
                                <ServiceNameBadge result={result} />
                            </div>
                        </div>
                        <div className='card-info-detail gap-1'>
                            <span className='font-semibold'>Pax:</span>
                            <span>{result.booking.pax_count}</span>
                            <span>·</span>
                            <span className='font-semibold'>Sentido:</span>
                            <span>{result.booking.type_of_trip}</span>
                            <span>·</span>
                            <span className='font-semibold'>RT:</span>
                            <span>{result.booking.is_round_trip ? 'Sí' : 'No'}</span>
                        </div>
                        <BookingRating result={result} />
                        <BookingObservations result={result} />
                    </div>
                    <div className='card-info-detail'>
                        <CityBadge branch={result.branch} isCode={false} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function BookingRating({ result }: {
    result: IBookingInfoOutput
}) {
    if (result.rating.number === 0) return

    return (
        <div className='card-info-detail gap-1'>
            <span className='font-semibold'>Calificación:</span>
            <span>{result.rating.number.toFixed(1)}</span>
            <span>·</span>
            <span className='font-semibold'>Comentario:</span>
            <span>{result.rating.comment}</span>
        </div>
    )
}

function BookingObservations({ result }: {
    result: IBookingInfoOutput
}) {
    if (!result.booking.observations) return

    return (
        <div className='card-info-detail mt-2 p-2 bg-yellow-300 rounded-md'>
            <Pencil className='size-4' />
            <span>{result.booking.observations}</span>
        </div>
    )
}

function BookingDates({ result }: {
    result: IBookingInfoOutput
}) {
    if (!result.dates) return null

    const booking_datetime_local = result.dates.temp_pickup_time ? new Date(result.dates.temp_pickup_time) : new Date(result.dates.job_time_utc)
    const days_to_trip = differenceInDays(booking_datetime_local, new Date())
    const minutes_to_trip = differenceInMinutes(booking_datetime_local, new Date())

    return (
        <div className='booking-detail info-customer'>
            {/* <span className='font-bold titles-font hidden'>Fechas</span> */}
            <div className='info-section'>
                <div className='flex flex-col gap-1 w-full'>
                    <div className='card-info-detail gap-2'>
                        <span className='font-semibold date-tag'>Fecha de Recogida:</span>
                        <span>{booking_datetime_local.toLocaleString()}</span>
                        {days_to_trip > 0 && (
                            <>
                                <span>·</span>
                                <span className='font-semibold'>Faltan: {days_to_trip} días</span>
                            </>
                        )}
                        {minutes_to_trip >= 0 && minutes_to_trip <= 180 && (
                            <>
                                <span>·</span>
                                <span className='font-semibold'>Faltan: {minutes_to_trip} minutos</span>
                            </>
                        )}
                        {days_to_trip < 0 && (
                            <>
                                <span>·</span>
                                <span className='font-semibold'>Hace: {-1 * days_to_trip} día{Math.abs(days_to_trip) > 1 ? 's' : ''}</span>
                            </>
                        )}
                        {minutes_to_trip < 0 && Math.abs(minutes_to_trip) <= 180 && (
                            <>
                                <span className='hidden md:block'>·</span>
                                <span className='hidden md:block font-semibold text-red-500'>Hace: {-1 * minutes_to_trip} minutos</span>
                            </>
                        )}
                    </div>
                    {/* <div className='card-info-detail gap-1'>
                        <span className='font-semibold date-tag'>Creación:</span>
                        <span>{new Date(result.dates.creation_datetime).toLocaleString()}</span>
                        {result.booking.creation_identity &&
                            <>
                                <span className='hidden xs:block'>·</span>
                                <span className='hidden xs:block font-semibold'>Usuario:</span>
                                <span className='hidden xs:block'>{result.booking.creation_identity}</span>
                            </>
                        }
                    </div>
                    {result.dates.assignment_datetime && result.dates.assignment_datetime &&
                        <div className='card-info-detail gap-1'>
                            <div className='flex flex-row gap-1 items-center w-full'>
                                <span className='font-semibold date-tag'>Asignación:</span>
                                <span>{new Date(result.dates.assignment_datetime).toLocaleString()}</span>
                                {result.booking.assignment_identity &&
                                    <>
                                        <span className='hidden xs:block'>·</span>
                                        <span className='hidden xs:block font-semibold'>Usuario:</span>
                                        <span className='hidden xs:block'>{result.booking.assignment_identity}</span>
                                    </>
                                }
                            </div>
                        </div>
                    }
                    {result.dates.on_road_datetime &&
                        <div className='card-info-detail gap-1'>
                            <span className='font-semibold date-tag'>En Camino:</span>
                            <span>{new Date(result.dates.on_road_datetime).toLocaleString()}</span>
                            {result.booking.on_road_identity &&
                                <>
                                    <span className='hidden xs:block'>·</span>
                                    <span className='hidden xs:block font-semibold'>Usuario:</span>
                                    <span className='hidden xs:block'>{result.booking.on_road_identity}</span>
                                </>
                            }
                        </div>
                    }
                    {result.dates.arrived_datetime &&
                        <div className='card-info-detail gap-1'>
                            <span className='font-semibold date-tag'>En Posición:</span>
                            <span>{new Date(result.dates.arrived_datetime).toLocaleString()}</span>
                            {result.booking.arrived_identity &&
                                <>
                                    <span className='hidden xs:block'>·</span>
                                    <span className='hidden xs:block font-semibold'>Usuario:</span>
                                    <span className='hidden xs:block'>{result.booking.arrived_identity}</span>
                                    <span className='hidden xs:block'>·</span>
                                    <BookingOnTimeArrival result={result} booking_datetime_local={booking_datetime_local} />
                                </>
                            }
                        </div>
                    }
                    {result.dates.started_datetime &&
                        <div className='card-info-detail gap-1'>
                            <span className='font-semibold date-tag'>Inicio de Viaje:</span>
                            <span>{new Date(result.dates.started_datetime).toLocaleString()}</span>
                            {result.booking.started_identity &&
                                <>
                                    <span className='hidden xs:block'>·</span>
                                    <span className='hidden xs:block font-semibold'>Usuario:</span>
                                    <span className='hidden xs:block'>{result.booking.started_identity}</span>
                                </>
                            }
                        </div>
                    }
                    {result.dates.completed_datetime &&
                        <div className='card-info-detail gap-1'>
                            <span className='font-semibold date-tag'>Fin de Viaje:</span>
                            <span>{new Date(result.dates.completed_datetime).toLocaleString()}</span>
                            {result.booking.ended_identity &&
                                <>
                                    <span className='hidden xs:block'>·</span>
                                    <span className='hidden xs:block font-semibold'>Usuario:</span>
                                    <span className='hidden xs:block'>{result.booking.ended_identity}</span>
                                </>
                            }
                        </div>
                    }
                    {result.dates.no_show_datetime &&
                        <div className='card-info-detail gap-1'>
                            <span className='font-semibold date-tag'>Fecha No Show:</span>
                            <span>{new Date(result.dates.no_show_datetime).toLocaleString()}</span>
                            <span>·</span>
                            <span className='font-semibold'>Usuario:</span>
                            <span>{result.booking.no_show_identity}</span>
                            <span>·</span>
                            <span className='font-semibold'>Comentario:</span>
                            <span>{result.booking.no_show_reason}</span>
                        </div>
                    } */}
                    {result.dates.cancellation_datetime &&
                        <div className='card-info-detail gap-1'>
                            <span className='font-semibold date-tag'>Cancelación:</span>
                            <span>{new Date(result.dates.cancellation_datetime).toLocaleString()}</span>
                            <span>·</span>
                            <span className='font-semibold'>Usuario:</span>
                            <span>{result.booking.cancellation_identity}</span>
                            <span>·</span>
                            <span className='truncate max-w-[80px] md:max-w-[140px]'>{result.booking.cancellation_reason}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

function BookingPayment({ result }: {
    result: IBookingInfoOutput
}) {
    if (!result.payment) return null

    return (
        <div className='booking-detail info-payment'>
            {/* <span className='font-bold titles-font'>Pago</span> */}
            <div className='info-section'>
                <div className='flex flex-col gap-1 w-full'>
                    <div className='flex flex-row gap-2 w-full'>
                        <div className='card-info-detail flex-row gap-1'>
                            <span className='font-semibold'>Monto Estimado:</span>
                            <span className=''>{chileanPeso.format(result.payment.estimated_payment)}</span>
                        </div>
                        <span>·</span>
                        <div className='card-info-detail flex-row gap-1'>
                            <span className='font-semibold'>Monto Real:</span>
                            <span className=''>{chileanPeso.format(result.payment.actual_payment)}</span>
                        </div>
                        <PaymentRouteType result={result} className='ml-auto' />
                    </div>
                    <div className='card-info-detail flex-row gap-1'>
                        <span className='font-semibold'>Forma de Pago:</span>
                        <span className=''>{result.payment.method_name}</span>
                    </div>
                    {result.payment.fare_route_name &&
                        <div className='card-info-detail gap-1'>
                            <span className='font-semibold'>Tramo / Tarifa:</span>
                            <span className=''>{result.payment.fare_route_name}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

function BookingCustomer({ result }: {
    result: IBookingInfoOutput
}) {
    if (!result.customer) return null

    return (
        <div className='booking-detail info-customer'>
            {/* <span className='font-bold titles-font'>Pasajeros</span> */}
            <div className='info-section flex flex-col lg:flex-row gap-1 lg:gap-4 items-start lg:items-center justify-start w-full'>
                <div className="flex flex-row justify-between gap-2 w-full">
                    <div className='flex flex-row gap-2'>
                        <div className='card-info-detail gap-1'>
                            <UserCircleIcon className='size-4' />
                            <span>{result.customer.full_name}</span>
                        </div>
                        <span>·</span>
                        <div className='hidden card-info-detail gap-1'>
                            <MailIcon className='size-4' />
                            <EmailLink address={result.customer.email} />
                        </div>
                        <div className='card-info-detail gap-1'>
                            <PhoneIcon className='size-4' />
                            <Link href={`tel:${result.customer.phone_number}`} className='hover:underline'>
                                <span>{result.customer.phone_number}</span>
                            </Link>
                        </div>
                    </div>
                    <div className='card-info-detail'>
                        <CustomerVipBadge result={result} />
                    </div>
                </div>
                { /*
                // {result.booking.qr_link && false &&
                //     <div className='qr-link hidden ml-auto min-w-fit lg:flex flex-col items-center justify-center'>
                //         <span className='font-bold text-sm'>Código QR</span>
                //         <Zoom>
                //             <Image src={result.booking.qr_link}
                //                 width={70} height={70}
                //                 alt={result.booking.id.toString()}
                //             />
                //         </Zoom>
                //     </div>
                // }
                */}
            </div>
        </div>
    )
}

function BookingDirections({ result }: {
    result: IBookingInfoOutput
}) {
    if (!result.directions) return null

    const originAddress = result.directions.origin.address
    const destinationAddress = result.directions.destination.address
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originAddress)}&destination=${encodeURIComponent(destinationAddress)}&travelmode=driving`

    return (
        <div className='booking-detail info-directions w-full'>
            {/* <span className='font-bold titles-font'>Direcciones</span> */}
            <div className='info-section gap-4 md:gap-0.5 flex flex-col md:flex-row items-center'>
                <div className='w-full md:w-3/4 flex flex-col gap-1'>
                    <div className='card-info-detail'>
                        <MapPin className='size-4' />
                        <div className="flex flex-row gap-1 items-center justify-start">
                            <span className='font-semibold'>Origen:</span>
                            <span className='line-clamp-1'>{result.directions.origin.address}</span>
                        </div>
                    </div>
                    <div className='card-info-detail'>
                        <GoalIcon className='size-4' />
                        <div className="flex flex-row gap-1 items-center justify-start">
                            <span className='font-semibold'>Destino:</span>
                            <span className='line-clamp-1'>{result.directions.destination.address}</span>
                        </div>
                    </div>
                    <div className='card-info-detail'>
                        <Clock className='size-4' />
                        <div className="flex flex-row gap-1 items-center justify-start">
                            <span className='font-semibold'>Tiempo Estimado:</span>
                            <span>{result.directions.estimated_travel_minutes} minutos ({(result.directions.estimated_travel_minutes / 60).toFixed(2)} horas)</span>
                        </div>
                    </div>
                </div>
                <div className="w-fit md:w-1/4 flex items-center justify-end text-sm">
                    <Button variant="default" className="px-6 py-0.5 bg-green-600 hover:bg-green-800"
                        onClick={() => window.open(googleMapsUrl, '_blank')}>
                        Ver ruta
                        <MapIcon className='h-4 w-4 ml-2' />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function BookingBadges({ result }: {
    result: IBookingInfoOutput
}) {
    return (
        <>
            <div className='hidden md:block booking-detail booking-badges'>
                <BookingIdBadge result={result} />
                <BookingStatusBadge result={result} />
                <PaymentStatusBadge result={result} />
                <CityBadge branch={result.branch} isCode={false} className='hidden ml-auto' />
            </div>
        </>
    )
}

function BookingVehicle({ result }: {
    result: IBookingInfoOutput,
}) {
    if (!STATES_TO_SHOW.includes(result.booking.status)) return null

    const WHATSAPP_TEXT = `Hola ${result.fleet.first_name ? result.fleet.first_name : ''}, te escribimos de Transvip, ¿cómo estás?`
    const whatsappLink = buildWhatsappLink(result.fleet.phone_number, WHATSAPP_TEXT)

    return (
        <div className='booking-detail info-vehicle'>
            {/* <span className='font-bold titles-font'>Vehículo / Conductor</span> */}
            <div className='info-section flex flex-row items-center justify-start gap-4 w-full'>
                <div className='card-info-detail'>
                    <DriverAvatar url={result.fleet.image} alt={result.fleet.full_name} />
                </div>
                <div className='flex flex-col gap-2'>
                    <div className='card-info-detail'>
                        <Badge variant={'default'} className='flex flex-row gap-2 bg-gray-200 hover:bg-gray-300 text-black items-center justify-start md:text-sm'>
                            <span className='cursor-pointer'>{result.fleet.full_name}</span>
                        </Badge>
                    </div>
                    <div className='card-info-detail items-center gap-2'>
                        <Badge variant={'default'} className='flex flex-row gap-2 bg-slate-500 hover:bg-slate-600 text-white items-center justify-start md:text-sm'>
                            <span className='hidden md:block hover:underline cursor-pointer'>PPU: {result.vehicle.license_plate}</span>
                            <span className='block md:hidden hover:underline cursor-pointer'>{result.vehicle.license_plate}</span>
                        </Badge>
                        <Badge variant={'default'} className='flex flex-row gap-2 bg-slate-500 hover:bg-slate-600 text-white items-center justify-start md:text-sm'>
                            <span className='hidden md:block hover:underline cursor-pointer'>Móvil: {result.vehicle.vehicle_number}</span>
                            <span className='block md:hidden hover:underline cursor-pointer'>{result.vehicle.vehicle_number}</span>
                        </Badge>
                    </div>
                </div>
                <Button variant={'outline'} className='hidden ml-auto px-4 rounded-full bg-green-600 hover:bg-green-800 text-white hover:text-white'>
                    <Link href={whatsappLink}
                        target='_blank'
                        className='flex flex-row items-center gap-0 sm:gap-2'>
                        <span className='hidden sm:block'>Contactar</span>
                    </Link>
                </Button>
            </div>
        </div>
    )
}

function BookingOnTimeArrival({ result, booking_datetime_local }: {
    result: IBookingInfoOutput,
    booking_datetime_local: Date
}) {
    const minutes_arrived_trip = differenceInMinutes(new Date(result.dates.arrived_datetime), booking_datetime_local)

    return (
        <>
            <span className='hidden xs:block'>{
                new Date(result.dates.arrived_datetime) <= addMinutes(booking_datetime_local, 10) ?
                    <CheckIcon className='size-4 bg-green-500 text-white rounded-full py-0.5' /> :
                    <X className='size-4 bg-red-400 text-white rounded-full py-0.5' />
            }</span>
            {Math.abs(minutes_arrived_trip) > 0 &&
                (<span className='hidden xs:block'>
                    ({minutes_arrived_trip > 0 ?
                        minutes_arrived_trip > 1 ?
                            <>{minutes_arrived_trip} minutos después</> :
                            <>{minutes_arrived_trip} minuto después</>
                        :
                        minutes_arrived_trip < 0 ?
                            minutes_arrived_trip < -1 ?
                                <>{Math.abs(minutes_arrived_trip)} minutos antes</> :
                                <>{Math.abs(minutes_arrived_trip)} minuto antes</>
                            : null
                    })
                </span>)
            }
        </>
    )
}