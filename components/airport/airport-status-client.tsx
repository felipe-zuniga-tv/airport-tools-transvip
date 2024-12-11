'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Clock, TrashIcon, Users } from 'lucide-react'
import { TransvipLogo } from '../transvip/transvip-logo'
import { calculateDuration, cn } from '@/lib/utils'
import { LiveClock } from '../ui/live-clock'
import { AirportZone, airportZones } from '@/lib/config/airport'
import { Routes } from '@/utils/routes'
import { QRCodeGeneratorDialog } from '../qr/qr-code-generator-dialog'
import { BookingSearchDialog } from '../booking/booking-search-dialog'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { airportService } from '@/services/airport'
import { AIRPORT_CONSTANTS } from '@/lib/config/airport'
import { AirportVehicleDetail, AirportVehicleType } from '@/lib/types'
import { LoadingMessage } from '../ui/loading'
import { useAirportStatus } from '@/hooks/use-airport-status'

export default function AirportStatusClient({ vehicleTypesList, zone: initialZoneId, session }: {
    vehicleTypesList: AirportVehicleType[]
    zone: AirportZone
    session: any
}) {
    const [selectedZone] = useState(initialZoneId || airportZones[0]);
    const [selectedType, setSelectedType] = useState(vehicleTypesList && vehicleTypesList.length ? vehicleTypesList[0].name : '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<AirportVehicleDetail | null>(null);

    const { vehicleTypes, vehicleList, isLoading, fetchUpdates } = useAirportStatus(selectedZone, AIRPORT_CONSTANTS.SECONDS_TO_UPDATE);

    const handleDeleteVehicle = useCallback((vehicle: AirportVehicleDetail) => {
        setVehicleToDelete(vehicle);
        setIsDialogOpen(true);
    }, []);

    const deleteVehicle = useCallback(async (vehicle: AirportVehicleDetail) => {
        try {
            await airportService.deleteVehicle(selectedZone.zone_id, vehicle.fleet_id);
            await fetchUpdates()
        } catch (error) {
            console.error('Error deleting vehicle:', error);
        }
    }, [selectedZone.zone_id, fetchUpdates, fetchUpdates]);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <AirportHeader selectedZone={selectedZone} session={session} />

            {isLoading && (<LoadingMessage message='Cargando...' />) }
            {!isLoading && (
                <>
                    {/* Vehicle Type Buttons */}
                    <VehicleTypes vehicleTypes={vehicleTypes}
                        selectedType={selectedType || ''}
                        handleSelectedType={(type) => setSelectedType(type)} />
        
                    {/* Vehicle List Summary / With - without pax */}
                    <VehicleListSummary vehicleList={vehicleList.filter(x => x.vehicle_type === selectedType)} />
        
                    {/* Vehicle List */}
                    <VehicleListDetail vehicleList={vehicleList.filter(x => x.vehicle_type === selectedType)}
                        handleDeleteVehicle={handleDeleteVehicle}
                        enableDeleteButton={selectedZone.enable_delete}
                    />
        
                    {/* New dialog for confirmation */}
                    <DeleteVehicleDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        vehicleToDelete={vehicleToDelete}
                        onDelete={deleteVehicle}
                    />
                </>
            )}
        </div>
    )
}

// New component for the header
function AirportHeader({ selectedZone, session }: {
    selectedZone: AirportZone
    session: any
}) {
    return (
        <header className="bg-transvip/90 shadow-md p-3 flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-2 sm:gap-4">
            <div className='w-full flex flex-row items-center justify-center sm:justify-start gap-4'>
                <TransvipLogo size={36} colored={false} logoOnly={true} className='' />
                <div className='flex flex-col gap-1 justify-start'>
                    <div className='flex flex-row gap-1 items-center justify-center md:justify-start w-full'>
                        <span className="text-lg lg:text-xl font-bold text-white">Zona Iluminada</span>
                        <span className="text-lg lg:text-xl font-bold text-white">·</span>
                        <span className="text-lg lg:text-xl font-bold text-white">{selectedZone.city_name}</span>
                    </div>
                    <span className='bg-transvip-dark hover:bg-orange-900 p-1 px-4 rounded-full w-fit'>
                        <Link href={Routes.AIRPORT.HOME} className='text-xs text-white font-semibold flex gap-0 items-center'>
                            <ArrowLeft className='w-4 h-4 font-bold mr-1' /> Volver al inicio
                        </Link>
                    </span>
                </div>
            </div>
            <BookingSearchDialog />
            <QRCodeGeneratorDialog session={session} />
            <LiveClock className='mx-auto md:ml-auto' />
        </header>
    )
}

function VehicleTypes({ vehicleTypes, handleSelectedType, selectedType }: {
    vehicleTypes: AirportVehicleType[]
    handleSelectedType: (arg0: string) => void
    selectedType: string
}) {
    if (!vehicleTypes || vehicleTypes.length === 0) return

    return (
        <div className={`bg-white p-4 h-[160px] text-base md:text-2xl lg:text-xl flex flex-row justify-center items-center gap-4 overflow-x-scroll_ snap-start`}>
            {vehicleTypes.map((vType: AirportVehicleType) => (
                <div key={vType.name}
                    onClick={() => handleSelectedType(vType.name)}
                    className={cn('w-[212px] h-[128px] shadow-xl flex flex-col items-center justify-center p-4 rounded-lg transition-colors',
                        selectedType === vType.name ? 'bg-slate-700 hover:bg-slate-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    )}>
                    <div className='flex flex-col items-center gap-2 justify-center'>
                        <span className="text-center text-2xl font-semibold">{vType.name}</span>
                        <span className="text-4xl font-semibold">{vType.count}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

function VehicleListSummary({ vehicleList }: { vehicleList: AirportVehicleDetail[] }) {
    const vehicles_with_passengers = !vehicleList ? 0 : vehicleList.filter(v => v.total_passengers > 0).length
    const vehicles_without_passengers = !vehicleList ? 0 : vehicleList.filter(v => v.total_passengers <= 0 || !v.total_passengers).length

    return (
        <div className='w-full p-3 bg-slate-500 text-white flex justify-center items-center gap-3 text-base md:text-2xl lg:text-xl'>
            <div className='flex flex-row gap-1 justify-center items-center'>
                <span className='font-semibold'>Con Pasajeros:</span>
                <span>{vehicles_with_passengers}</span>
            </div>
            <span>·</span>
            <div className='flex flex-row gap-1 justify-center items-center'>
                <span className='font-semibold'>Sin Pasajeros:</span>
                <span>{vehicles_without_passengers}</span>
            </div>
        </div>
    )
}

function VehicleListDetail({ vehicleList, handleDeleteVehicle, enableDeleteButton }: {
    vehicleList: AirportVehicleDetail[]
    handleDeleteVehicle: (arg0: AirportVehicleDetail) => void
    enableDeleteButton: boolean
}) {
    if (!vehicleList || vehicleList.length === 0) {
        return <div className='w-full p-4 font-bold text-center mt-12 text-3xl'>Sin resultados</div>
    }

    return (
        <div className="flex flex-col flex-grow overflow-auto p-3 w-full text-base gap-4 lg:text-xl xl:text-2xl">
            {vehicleList.map((vehicle, index) => {
                const waitTime = vehicle.passenger_entry_time ? calculateDuration(vehicle.passenger_entry_time) : null

                // Determine background color based on wait time
                let bgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white'; // Default color

                if (waitTime && waitTime >= 10 && waitTime < AIRPORT_CONSTANTS.MAX_WAIT_TIME) {
                    const intensity = Math.min((waitTime - 10) / (AIRPORT_CONSTANTS.MAX_WAIT_TIME - 10), 1); // Calculate intensity from 0 to 1
                    bgColor = `bg-gradient-to-r from-yellow-200 to-red-200`; // opacity-${Math.max(10, Math.round(intensity * 100))}`; // Gradually change to red
                } else if (waitTime && waitTime >= AIRPORT_CONSTANTS.MAX_WAIT_TIME) {
                    bgColor = 'bg-gradient-to-r from-red-200 to-red-400/80'; // Full red if over max wait time
                }

                return (
                    <div key={vehicle.unique_car_id + "_" + index}
                        className={cn('vehicle-detail-card w-full flex flex-col md:flex-row gap-4 items-center justify-between p-4 shadow-md rounded-lg',
                            'text-slate-900',
                            bgColor
                        )}>
                        <div className='vehicle-index-driver flex flex-row gap-2 items-center justify-start z-10'>
                            <div className='vehicle-index font-semibold text-3xl w-[30px] text-center'>{index + 1}</div>
                            <div className='vehicle-driver flex flex-col gap-1 justify-center items-center w-[200px] lg:w-[360px] xl:w-[460px]'>
                                <div className='flex flex-row gap-1 justify-center items-center'>
                                    <span className="font-semibold">{vehicle.unique_car_id}{vehicle.tipo_contrato === 'Leasing' ? 'L' : ''}</span>
                                    {vehicle.name.includes('*') && (
                                        <>
                                            <span>·</span>
                                            <span className="text-blue-600 font-bold">{vehicle.name.includes('*') ? 'D80' : ''}</span>
                                        </>
                                    )}
                                </div>
                                <span className="text-base lg:text-xl xl:text-2xl text-center">{fixName(vehicle.fleet_name)}</span>
                            </div>
                        </div>
                        <div className='vehicle-info flex flex-row items-center gap-4'>
                            <div className='vehicle-in-zone mx-auto flex flex-col gap-1 justify-center items-center'>
                                <span className='text-center font-semibold'>Hora de Entrada</span>
                                <div className='flex flex-row gap-1 items-center justify-center'>
                                    <span className="text-center">{format(new Date(vehicle.entry_time), 'dd-MM HH:mm')}</span>
                                    <span className="hidden">·</span>
                                    <span className="hidden text-center text-slate-600">{calculateDuration(vehicle.entry_time)} min</span>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-row gap-2 items-center'>
                            <div className='vehicle-pax flex flex-col gap-2 items-center justify-center w-[170px] lg:w-[220px]'>
                                <span className='font-semibold hidden'>Pasajeros</span>
                                <div className='flex flex-col gap-2 items-center text-xl'>
                                    <div className='flex flex-row gap-1 justify-start items-center'>
                                        <span className='text-center font-semibold'><Clock className='h-5 w-5' /></span>
                                        <span className="text-center">{vehicle.passenger_entry_time ? `${calculateDuration(vehicle.passenger_entry_time)} min` : '- min'}</span>
                                    </div>
                                    <span className='hidden'>·</span>
                                    <div className='flex flex-row gap-1 justify-start items-center'>
                                        <span className='text-center font-semibold'><Users className='h-5 w-5' /></span>
                                        <span className="text-center">{vehicle.total_passengers ? Math.max(0, vehicle.total_passengers) : 0} pax</span>
                                    </div>
                                </div>
                            </div>
                            { enableDeleteButton && (
                                <Button
                                    variant={"default"}
                                    onClick={() => handleDeleteVehicle(vehicle)}
                                    className="text-red-500 hover:text-red-700 bg-white hover:bg-gray-200 w-12">
                                    <TrashIcon />
                                </Button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// Component for the delete vehicle dialog
function DeleteVehicleDialog({ open, onOpenChange, vehicleToDelete, onDelete }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleToDelete: AirportVehicleDetail | null;
    onDelete: (vehicle: AirportVehicleDetail) => Promise<void>;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmación</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro que quieres borrar el vehículo?
                    </DialogDescription>
                </DialogHeader>
                <div className='flex flex-col gap-2 my-2 items-start p-3 rounded-md bg-gray-200'>
                    <div className='flex flex-col gap-2 items-start'>
                        <div className='flex flex-row gap-1 items-center'>
                            <span className='font-semibold'>Número de Móvil:</span>
                            <span>{vehicleToDelete?.unique_car_id} ({vehicleToDelete?.tipo_contrato}) </span>
                        </div>
                        <div className='flex flex-row gap-1 items-center'>
                            <span className='font-semibold'>Conductor:</span>
                            <span>{vehicleToDelete?.fleet_name} </span>
                        </div>
                    </div>
                </div>
                <DialogFooter className='sm:justify-between'>
                    <Button variant='secondary' onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button variant='destructive' onClick={() => {
                        if (vehicleToDelete !== null) {
                            // Perform the deletion
                            onDelete(vehicleToDelete);
                        }
                        onOpenChange(false);
                    }}>Borrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function fixName(name: string) {
    if (!name) return null

    const fixedName = name
        .trim()
        .replaceAll("  ", " ")
        .toLowerCase()
        .split(" ")
        .filter(p => p !== '')
        .map(n => n[0].toUpperCase() + n.slice(1))
        .join(" ")
        .trim()

    return fixedName
}