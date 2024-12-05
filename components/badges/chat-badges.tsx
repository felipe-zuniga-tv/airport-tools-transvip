import { IBookingInfoOutput, IBranch, IDriverProfile, IVehicleDetail } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import PaymentAvatar from "../payment/payment-avatar";
import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Badge Configurations
const bookingStatus = [
    { status: 0, label: 'Asignada', color: 'bg-gray-400 hover:bg-gray-300' },
    { status: 1, label: 'Iniciada', color: 'bg-slate-800 hover:bg-slate-900' },
    { status: 2, label: 'Completada', color: 'bg-green-700 hover:bg-green-600' },
    { status: 4, label: 'En Posición', color: 'bg-red-600 hover:bg-red-500' },
    { status: 6, label: 'No asignada', color: 'bg-orange-800 hover:bg-orange-700' },
    { status: 7, label: 'Aceptada', color: 'bg-orange-600 hover:bg-orange-500' },
    { status: 9, label: 'Cancelada', color: 'bg-orange-800 hover:bg-orange-700' },
    { status: 12, label: 'No Show', color: 'bg-yellow-600 hover:bg-yellow-500' },
    { status: 15, label: 'En camino', color: 'bg-blue-400 hover:bg-blue-500' },
]

const paymentStatus = [
    { status: 0, label: 'No Pagada', color: 'bg-red-400 hover:bg-red-300' },
    { status: 1, label: 'Pagada', color: 'bg-green-700 hover:bg-green-600' },
    { status: 2, label: 'Pagada', color: 'bg-green-700 hover:bg-green-600' },
]

const driverStatus = [
    { status: 0, label: 'Offline', color: 'bg-red-400 hover:bg-red-300' },
    { status: 1, label: 'Online', color: 'bg-green-700 hover:bg-green-600' },
]

const vehicleStatus = [
    { status: 0, label: 'Inactivo', color: 'bg-red-400 hover:bg-red-400' },
    { status: 1, label: 'Activo', color: 'bg-green-700 hover:bg-green-700' },
]


// Components
export function CityBadge({ branch, className, isCode = true }: { branch?: IBranch, className?: string, isCode?: boolean }) {
    return (
        <Badge variant={"default"} 
            className={cn("py-1 bg-slate-600 hover:bg-slate-700 text-xs text-white", className as string)}>
            { isCode ? branch?.code : branch?.name}
        </Badge>
    )
}

export function BookingStatusBadge({ result } : { result : IBookingInfoOutput }) {
    const bookingStatusItem = bookingStatus.filter(bs => bs.status === result.booking.status)[0]
    const bookingStatusLabel = bookingStatusItem ? bookingStatusItem.label : result.booking.status
    const bookingStatusColorValue = bookingStatusItem.color

    return (
        <Badge variant={"default"} 
            className={cn("py-1 w-[100px] text-white justify-center cursor-pointer", bookingStatusColorValue)}>
            { bookingStatusLabel }
        </Badge>
    )
}

export function ServiceNameBadge({ result } : { result : IBookingInfoOutput }) {
    return (
        <Badge variant={'default'} className={'ml-2 bg-slate-700 text-white'}>
            {result.booking.service_name}
        </Badge>
    )
}

export function CustomerVipBadge({ result, className = "" } : { 
    result : IBookingInfoOutput, 
    className?: string
}) {
    const vipFlagLabel = result.customer.vip_label
    const vipFlagColor = result.customer.vip_flag ? 'bg-orange-200 text-black hover:bg-orange-200' : 'bg-slate-700 text-white'
    return (
        <Badge variant={'default'} className={cn('', vipFlagColor, className)}>
            { vipFlagLabel }
        </Badge>
    )
}

export function PaymentStatusBadge({ result } : { result : IBookingInfoOutput }) {
    const paymentStatusItem = paymentStatus.filter(ps => ps.status === result.payment.status)[0]
    const paymentStatusLabel = paymentStatusItem ? paymentStatusItem.label : result.payment.status
    const paymentStatusColor = paymentStatusItem.color

    return (
        <Badge variant={"default"} 
            className={cn("py-1 text-white flex flex-row gap-2 items-center cursor-pointer", paymentStatusColor)}>
            <span>{ paymentStatusLabel }</span>
            <PaymentAvatar result={result} />
        </Badge>
    )
}

export function PaymentRouteType({ result, className } : { 
    result : IBookingInfoOutput, 
    className?: string 
}) {
    return (
        <Badge variant={'default'} className={cn('ml-2 bg-slate-700 text-white', className || "")}>
            {result.payment.fare_route_type === 1 ? 'Fija' : 'Variable'}
        </Badge>
    )
}

export function DriverStatusBadge({ result } : { result : IDriverProfile }) {
    const driverStatusItem = driverStatus.filter(ds => ds.status === result.status.current)[0]
    const driverStatusLabel = driverStatusItem ? driverStatusItem.label : result.status.current
    const driverStatusColor = driverStatusItem.color

    return (
        <Badge variant={"default"} 
            className={cn("py-1 md:py-2 text-white cursor-pointer", driverStatusColor)}>
            { driverStatusLabel }
        </Badge>
    )
}

export function VehicleStatusBadge({ result } : { result : IVehicleDetail }) {
    const vehicleStatusItem = vehicleStatus.filter(vs => vs.status === result.status)[0]
    const vehicleStatusLabel = vehicleStatusItem.label
    const vehicleStatusColor = vehicleStatusItem.color

    return (
        <Badge variant={"default"} 
            className={cn("py-1 md:py-2 text-white", vehicleStatusColor)}>
            { vehicleStatusLabel }
        </Badge>
    )
}

export function LicenseExpirationBadge({ result } : { result : IDriverProfile }) {
    let days_to_expiration_license = null
    if (result.driver_documents.license.expiration_date) {
        const _aux_license_expiration_date = result.driver_documents.license.expiration_date?.substring(0, result.driver_documents.license.expiration_date.indexOf("T")) as string
        const license_expiration_date = new Date(_aux_license_expiration_date)
        days_to_expiration_license = differenceInDays(license_expiration_date, new Date())
    }

    if (!result.driver_documents.license.expiration_date) return null

    return (
        <>
            <Badge variant={'default'} 
                className={cn(
                    "bg-gray-200 text-white",
                    `${days_to_expiration_license && days_to_expiration_license < 0 ? 'bg-red-400 hover:bg-red-300' : 'bg-green-700 hover:bg-green-600'}`
                )}
            >
                { result.driver_documents.license.expiration_date?.substring(0, result.driver_documents.license.expiration_date.indexOf("T")) }
            </Badge>
            {/* { days_to_expiration_license && days_to_expiration_license > 0 && <span className='hidden md:block'>(faltan {days_to_expiration_license} días)</span>}
            { days_to_expiration_license && days_to_expiration_license < 0 && <span className='hidden md:block'>(vencido hace {-1*days_to_expiration_license} días)</span>} */}
        </>
    )
}