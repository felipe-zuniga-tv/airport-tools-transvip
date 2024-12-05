'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Clock, Users } from 'lucide-react'
import { TransvipLogo } from '../transvip/transvip-logo'
import { calculateDuration, cn } from '@/lib/utils'
import { LiveClock } from '../ui/live-clock'
import { AirportZone, airportZones } from '@/lib/config/airport'
import { Routes } from '@/utils/routes'
import { QRCodeGeneratorDialog } from '../qr/qr-code-generator-dialog'

interface AirportVehicleType {
    id: number[]
    count: number
    vehicle_image: string
    name: string
}

interface AirportVehicleDetail {
    unique_car_id: string
    tipo_contrato: string
    name: string
    action: number
    fleet_id: number
    fleet_name: string
    entry_time: string
    total_passengers: number
    passenger_entry_time: string
}

const secondsToUpdate = 60 // Refresh data
const maxWaitTime = 15 // Minutes

export default function AirportStatusClient({ vehicleTypesList, zone: initialZoneId }: {
    vehicleTypesList: AirportVehicleType[]
    zone: AirportZone
}) {
    const [selectedZone, _] = useState(initialZoneId || airportZones[0])
    const [vehicleTypes, setVehicleTypes] = useState(vehicleTypesList)
    const [selectedType, setSelectedType] = useState<string>(vehicleTypesList[0]?.name || ''); // Initialize with first vehicle type
    const [vehicleList, setVehicleList] = useState<AirportVehicleDetail[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const response = await fetch(`/api/airport/refresh-dashboard?zoneId=${selectedZone.zone_id}`)
                if (response.ok) {
                    const data = await response.json()
                    setVehicleTypes(data)
                } else {
                    console.error('Failed to fetch vehicle types');
                }
            } catch (error) {
                console.error('Error fetching vehicle types:', error);
            }
        }

        fetchUpdates()
        const interval = setInterval(fetchUpdates, secondsToUpdate * 1000)

        return () => clearInterval(interval)
    }, [selectedZone])

    useEffect(() => {
        const fetchVehicles = async () => {
            if (!selectedType) {
                setVehicleList([])
                return
            }

            setIsLoading(true)

            try {
                const response = await fetch(`/api/airport/get-vehicles-dashboard?branchId=${selectedZone.branch_id}&zoneId=${selectedZone.zone_id}&vehicleId=${vehicleTypes.find(v => v.name === selectedType)?.id}`)
                if (response.ok) {
                    const data = await response.json()
                    // console.log("DATA")
                    // console.log(data)
                    // // const uniqueVehicles: AirportVehicleDetail[] = Array.from(new Set(data.map(v => JSON.stringify(v)))).map(v => JSON.parse(v));
                    // console.log("UNIQUE VEHICLES")
                    // console.log(uniqueVehicles)
                    
                    setVehicleList(data)
                } else {
                    console.error('Failed to fetch vehicle list');
                }
            } catch (error) {
                console.error('Error fetching vehicle list:', error);
            } finally {
                setIsLoading(false)
            }
        }

        fetchVehicles()
    }, [selectedType, vehicleTypes]) // Dependency on selectedType and vehicleTypes

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <AirportHeader selectedZone={selectedZone} />

            {/* Vehicle Type Buttons */}
            <VehicleTypes vehicleTypes={vehicleTypes}
                selectedType={selectedType || ''}
                handleSelectedType={(type) => setSelectedType(type)} />

            {/* Vehicle List Summary / With - without pax */}
            <VehicleListSummary vehicleList={vehicleList} />

            {/* Vehicle List */}
            {/* Loading Indicator */}
            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <span className="text-xl font-bold">Cargando...</span>
                </div>
            ) : (
                <VehicleListDetail vehicleList={vehicleList} />
            )}
        </div>
    )
}

// New component for the header
function AirportHeader({ selectedZone }: {
    selectedZone: AirportZone
}) {
    return (
        <header className="bg-transvip/90 shadow-md p-3 flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-2 sm:gap-4">
            <div className='w-full flex flex-row items-center justify-center sm:justify-start gap-4'>
                <TransvipLogo size={36} colored={false} logoOnly={true} className='hidden lg:block' />
                <div className='flex flex-col gap-1 justify-start'>
                    <div className='flex flex-row gap-1 items-center justify-center md:justify-start w-full'>
                        <span className="text-xl lg:text-2xl font-bold text-white">Zona Iluminada</span>
                        <span className="text-xl lg:text-2xl font-bold text-white">·</span>
                        <span className="text-xl lg:text-2xl font-bold text-white">{selectedZone.city_name}</span>
                    </div>
                    <span className='bg-transvip-dark hover:bg-orange-900 p-1 px-4 rounded-full w-fit'>
                        <Link href={Routes.AIRPORT.HOME} className='text-xs text-white font-semibold flex gap-0 items-center'>
                            <ArrowLeft className='w-4 h-4 font-bold mr-1' /> Volver al inicio
                        </Link>
                    </span>
                </div>
            </div>
            <QRCodeGeneratorDialog />
            <LiveClock className='mx-auto md:ml-auto' />
        </header>
    )
}

function VehicleTypes({ vehicleTypes, handleSelectedType, selectedType }: {
    vehicleTypes: AirportVehicleType[]
    handleSelectedType: (arg0: string) => void
    selectedType: string
}) {
    return (
        <div className={`bg-white p-4 min-h-fit text-base md:text-2xl lg:text-xl flex flex-row justify-center items-center gap-4 overflow-x-auto snap-start`}>
            {vehicleTypes.map((vType: AirportVehicleType) => (
                <div key={vType.name}
                    onClick={() => handleSelectedType(vType.name)}
                    className={cn('w-[212px] h-[128px] shadow-md flex flex-col items-center justify-center p-4 rounded-lg transition-colors',
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

function VehicleListDetail({ vehicleList }: { vehicleList: AirportVehicleDetail[] }) {
    if (!vehicleList || vehicleList.length === 0) {
        return <div className='w-full p-4 font-bold text-center text-3xl'>Sin resultados</div>
    }

    return (
        <div className="flex flex-col flex-grow overflow-auto p-3 w-full text-base gap-4 lg:text-xl xl:text-2xl">
            {vehicleList.map((vehicle, index) => {
                const waitTime = vehicle.passenger_entry_time ? calculateDuration(vehicle.passenger_entry_time) : null

                // Determine background color based on wait time
                let bgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white'; // Default color

                if (waitTime && waitTime >= 10 && waitTime < maxWaitTime) {
                    const intensity = Math.min((waitTime - 10) / (maxWaitTime - 10), 1); // Calculate intensity from 0 to 1
                    bgColor = `bg-gradient-to-r from-yellow-200 to-red-200`; // opacity-${Math.max(10, Math.round(intensity * 100))}`; // Gradually change to red
                } else if (waitTime && waitTime >= maxWaitTime) {
                    bgColor = 'bg-gradient-to-r from-red-200 to-red-400/80'; // Full red if over max wait time
                }

                return (
                    <div key={vehicle.unique_car_id + "_" + index}
                        className={cn('vehicle-detail-card w-full flex flex-col md:flex-row gap-4 items-center justify-between p-4 shadow-md rounded-lg',
                            'text-slate-900',
                            bgColor
                        )}>
                        <div className='vehicle-index-driver flex flex-row gap-1 items-center justify-start z-10'>
                            <div className='vehicle-index font-semibold text-3xl w-[30px] text-center'>{index + 1}</div>
                            <div className='vehicle-driver flex flex-col gap-1 justify-center items-center w-[320px] lg:w-[400px]'>
                                <div className='flex flex-row gap-1 justify-center items-center'>
                                    <span className="font-semibold">{vehicle.unique_car_id}{vehicle.tipo_contrato === 'Leasing' ? 'L' : ''}</span>
                                    {vehicle.name.includes('*') && (
                                        <>
                                            <span>·</span>
                                            <span className="text-blue-600 font-bold">{vehicle.name.includes('*') ? 'D80' : ''}</span>
                                        </>
                                    )}
                                </div>
                                <span className="text-base lg:text-xl xl:text-2xl text-center">{vehicle.fleet_name.trim()}</span>
                            </div>
                        </div>
                        <div className='vehicle-info flex flex-row items-center gap-4'>
                            <div className='vehicle-in-zone mx-auto flex flex-col gap-1 justify-center items-center'>
                                <span className='text-center font-semibold'>Tiempo en ZI</span>
                                <div className='flex flex-row gap-1 items-center justify-center'>
                                    <span className="text-center">{format(new Date(vehicle.entry_time), 'dd-MM HH:mm')}</span>
                                    <span className="">·</span>
                                    <span className="text-center text-slate-600">{calculateDuration(vehicle.entry_time)} min</span>
                                </div>
                            </div>
                        </div>
                        <div className='vehicle-pax flex flex-col gap-2 items-center justify-center w-[170px] lg:w-[220px]'>
                            <span className='font-semibold'>Pasajeros</span>
                            <div className='flex flex-row gap-4 items-center'>
                                <div className='flex flex-row gap-1 justify-start items-center'>
                                    <span className='text-center font-semibold'><Clock className='h-5 w-5' /></span>
                                    <span className="text-center">{vehicle.passenger_entry_time ? `${calculateDuration(vehicle.passenger_entry_time)} min` : '- min'}</span>
                                </div>
                                <span>·</span>
                                <div className='flex flex-row gap-1 justify-start items-center'>
                                    <span className='text-center font-semibold'><Users className='h-5 w-5' /></span>
                                    <span className="text-center">{vehicle.total_passengers ? Math.max(0, vehicle.total_passengers) : 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}