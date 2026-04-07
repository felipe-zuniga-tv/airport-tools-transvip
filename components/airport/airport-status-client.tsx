'use client'

import { useState, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { Clock, TrashIcon, Users } from 'lucide-react'
import { calculateDuration, cn } from '@/lib/utils'
import { AirportZone, airportZones } from '@/lib/config/airport'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { airportService } from '@/services/airport'
import { AIRPORT_CONSTANTS } from '@/lib/config/airport'
import {
    AirportVehicleDetail,
    AirportVehicleType,
    InboundAirportVehicle,
} from '@/lib/types'
import { LoadingMessage } from '../ui/loading'
import { useAirportStatus } from '@/hooks/use-airport-status'
import { useAirportInbound } from '@/hooks/use-airport-inbound'
import { fixName } from '@/lib/utils'
import { AirportZiShellHeader } from '@/components/airport/airport-zi-shell-header'

type AirportDashboardView = 'in_zone' | 'inbound'
type DashboardToggleOrientation = 'horizontal' | 'vertical'
type VehicleTypeToggle = {
    name: string
    count: number | null
}

export type SharedZoneStatus = {
    vehicleTypes: AirportVehicleType[]
    vehicleList: AirportVehicleDetail[]
    isLoading: boolean
    fetchUpdates: () => Promise<unknown>
}

export default function AirportStatusClient({
    vehicleTypesList,
    zone: initialZoneId,
    session,
    hideHeader = false,
    sharedZoneStatus,
    fixedDashboardView,
}: {
    vehicleTypesList: AirportVehicleType[]
    zone: AirportZone
    session: unknown
    hideHeader?: boolean
    /** When set (e.g. workspace shell), zone polling runs once in the parent. */
    sharedZoneStatus?: SharedZoneStatus
    /** Locks En Aeropuerto vs En camino; hides the internal toggle (use top-level tabs instead). */
    fixedDashboardView?: AirportDashboardView
}) {
    const [selectedZone] = useState(initialZoneId || airportZones[0]);
    const [selectedView, setSelectedView] = useState<AirportDashboardView>('in_zone');
    const effectiveView = fixedDashboardView ?? selectedView;
    const isZoneView = effectiveView === 'in_zone';
    const showViewToggle = Boolean(
        selectedZone.enable_inbound && fixedDashboardView == null,
    );
    const [selectedType, setSelectedType] = useState(vehicleTypesList?.length ? vehicleTypesList[0].name : '');
    const [selectedInboundType, setSelectedInboundType] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<AirportVehicleDetail | null>(null);
    const inboundEnabled = selectedZone.enable_inbound;

    const internalZoneStatus = useAirportStatus(
        selectedZone,
        AIRPORT_CONSTANTS.SECONDS_TO_UPDATE,
        vehicleTypesList,
        !sharedZoneStatus && isZoneView,
    );
    const { vehicleTypes, vehicleList, isLoading, fetchUpdates } =
        sharedZoneStatus ?? internalZoneStatus;
    const {
        vehicleList: inboundVehicles,
        isLoading: isInboundLoading,
        hasLoaded: hasInboundLoaded,
        error: inboundError,
    } = useAirportInbound(
        selectedZone,
        AIRPORT_CONSTANTS.SECONDS_TO_UPDATE_INBOUND,
        inboundEnabled && !isZoneView,
    );

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
    }, [selectedZone.zone_id, fetchUpdates]);

    const activeSelectedType = useMemo(() => {
        if (!vehicleTypes.length) {
            return '';
        }

        return vehicleTypes.some((vehicleType) => vehicleType.name === selectedType)
            ? selectedType
            : vehicleTypes[0].name;
    }, [selectedType, vehicleTypes]);

    const filteredVehicleList = useMemo(
        () => vehicleList.filter((vehicle) => vehicle.vehicle_type === activeSelectedType),
        [activeSelectedType, vehicleList],
    );
    const vehicleNumbersInZone = useMemo(() => {
        return new Set(vehicleList.map(getZoneVehicleNumberKey))
    }, [vehicleList])
    const inboundVehiclesNotInZone = useMemo(() => {
        return dedupeInboundVehicles(
            inboundVehicles.filter(
                (vehicle) => !vehicleNumbersInZone.has(getInboundVehicleNumberKey(vehicle)),
            ),
        )
    }, [inboundVehicles, vehicleNumbersInZone])
    const inboundVehicleTypes = useMemo<VehicleTypeToggle[]>(() => {
        const countsByType = new Map<string, number>()

        for (const vehicle of inboundVehiclesNotInZone) {
            const typeName = getInboundVehicleTypeName(vehicle)
            countsByType.set(typeName, (countsByType.get(typeName) ?? 0) + 1)
        }

        const orderedTypeNames = vehicleTypesList.map((vehicleType) => vehicleType.name)
        const knownTypeNames = orderedTypeNames.filter((typeName) => countsByType.has(typeName))
        const knownTypeNameSet = new Set(knownTypeNames)
        const remainingTypeNames = Array.from(countsByType.keys())
            .filter((typeName) => !knownTypeNameSet.has(typeName))
            .sort((left, right) => left.localeCompare(right))

        return [...knownTypeNames, ...remainingTypeNames].map((typeName) => ({
            name: typeName,
            count: countsByType.get(typeName) ?? 0,
        }))
    }, [inboundVehiclesNotInZone, vehicleTypesList]);
    const activeSelectedInboundType = useMemo(() => {
        if (!selectedInboundType) {
            return ''
        }

        return inboundVehicleTypes.some((vehicleType) => vehicleType.name === selectedInboundType)
            ? selectedInboundType
            : ''
    }, [selectedInboundType, inboundVehicleTypes]);
    const filteredInboundVehicles = useMemo(() => {
        if (!activeSelectedInboundType) {
            return inboundVehiclesNotInZone
        }

        return inboundVehiclesNotInZone.filter(
            (vehicle) => getInboundVehicleTypeName(vehicle) === activeSelectedInboundType,
        )
    }, [activeSelectedInboundType, inboundVehiclesNotInZone]);
    const isActiveViewLoading = isZoneView
        ? isLoading
        : inboundEnabled
            ? isInboundLoading || !hasInboundLoaded
            : false;

    return (
        <div
            className={cn(
                'flex flex-col bg-gray-100',
                hideHeader ? 'h-full min-h-0 flex-1' : 'h-screen',
            )}
        >
            {!hideHeader && (
                <AirportZiShellHeader zone={selectedZone} session={session} />
            )}

            <div className="flex min-h-0 flex-1 flex-col">
                {(isZoneView || inboundEnabled) && (
                    <DashboardControls
                        inboundEnabled={inboundEnabled}
                        isZoneView={isZoneView}
                        showViewToggle={showViewToggle}
                        vehicleTypes={vehicleTypes}
                        selectedType={activeSelectedType}
                        onSelectedTypeChange={setSelectedType}
                        inboundVehicleTypes={inboundVehicleTypes}
                        selectedInboundType={activeSelectedInboundType}
                        onSelectedInboundTypeChange={setSelectedInboundType}
                        selectedView={effectiveView}
                        onViewChange={setSelectedView}
                    />
                )}

                {isActiveViewLoading && (
                    <div className='flex flex-1 items-center justify-center'>
                        <LoadingMessage message='Cargando...' />
                    </div>
                ) }
                {!isActiveViewLoading && (
                    <>
                        {isZoneView ? (
                            <>
                                {/* Vehicle List Summary / With - without pax */}
                                <VehicleListSummary vehicleList={filteredVehicleList} />
            
                                {/* Vehicle List */}
                                <VehicleListDetail vehicleList={filteredVehicleList}
                                    handleDeleteVehicle={handleDeleteVehicle}
                                    enableDeleteButton={selectedZone.enable_delete}
                                />
                            </>
                        ) : !inboundEnabled ? (
                            <div className='flex flex-1 items-center justify-center p-8 text-center text-lg font-medium text-slate-600'>
                                En camino no está habilitado para este aeropuerto.
                            </div>
                        ) : (
                            <>
                                {inboundError && (
                                    <div className='w-full p-4 font-bold text-center mt-6 text-2xl text-red-700'>
                                        {inboundError}
                                    </div>
                                )}
                                <InboundVehicleSummary vehicleList={filteredInboundVehicles} />
                                <InboundVehicleListDetail vehicleList={filteredInboundVehicles} />
                            </>
                        )}
        
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
        </div>
    )
}

function DashboardControls({
    inboundEnabled,
    isZoneView,
    showViewToggle,
    vehicleTypes,
    selectedType,
    onSelectedTypeChange,
    inboundVehicleTypes,
    selectedInboundType,
    onSelectedInboundTypeChange,
    selectedView,
    onViewChange,
}: {
    inboundEnabled: boolean
    isZoneView: boolean
    showViewToggle: boolean
    vehicleTypes: AirportVehicleType[]
    selectedType: string
    onSelectedTypeChange: (type: string) => void
    inboundVehicleTypes: VehicleTypeToggle[]
    selectedInboundType: string
    onSelectedInboundTypeChange: (type: string) => void
    selectedView: AirportDashboardView
    onViewChange: (view: AirportDashboardView) => void
}) {
    return (
        <div className='bg-white p-4'>
            <div className='flex flex-col gap-4 lg:flex-row-reverse lg:items-stretch'>
                {inboundEnabled && showViewToggle && (
                    <div className='w-full lg:w-56 lg:shrink-0 rounded-2xl lg:bg-slate-50 p-0 items-center justify-center flex shadow-sm'>
                        <div className='lg:hidden'>
                            <DashboardViewToggle
                                inboundEnabled={inboundEnabled}
                                selectedView={selectedView}
                                onViewChange={onViewChange}
                                orientation="horizontal"
                            />
                        </div>
                        <div className='hidden lg:block'>
                            <DashboardViewToggle
                                inboundEnabled={inboundEnabled}
                                selectedView={selectedView}
                                onViewChange={onViewChange}
                                orientation="vertical"
                            />
                        </div>
                    </div>
                )}

                {/* Vehicle Types */}
                <div className='min-w-0 flex-1 rounded-2xl bg-transparent p-0'>
                    {isZoneView ? (
                        <VehicleTypes
                            vehicleTypes={vehicleTypes}
                            selectedType={selectedType}
                            handleSelectedType={onSelectedTypeChange}
                        />
                    ) : (
                        <div className='flex h-full min-h-[140px] flex-col gap-4 rounded-xl bg-white'>
                            {inboundVehicleTypes.length > 0 ? (
                                <VehicleTypes
                                    vehicleTypes={inboundVehicleTypes}
                                    selectedType={selectedInboundType}
                                    handleSelectedType={onSelectedInboundTypeChange}
                                />
                            ) : (
                                <div className='flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-4 text-sm text-slate-500'>
                                    No hay vehiculos en camino para este aeropuerto.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function DashboardViewToggle({
    inboundEnabled,
    selectedView,
    onViewChange,
    orientation,
}: {
    inboundEnabled: boolean
    selectedView: AirportDashboardView
    onViewChange: (view: AirportDashboardView) => void
    orientation: DashboardToggleOrientation
}) {
    return (
        <div className={cn(
            orientation === 'horizontal'
                ? 'flex justify-center items-center gap-3'
                : 'flex flex-col gap-3'
        )}>
            <button
                type='button'
                onClick={() => onViewChange('in_zone')}
                className={cn(
                    'rounded-full px-6 py-3 text-lg font-semibold transition-colors',
                    orientation === 'horizontal' ? 'min-w-[180px]' : 'w-full',
                    selectedView === 'in_zone'
                        ? 'bg-transvip text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                )}
            >
                En Aeropuerto
            </button>
            {inboundEnabled && (
                <button
                    type='button'
                    onClick={() => onViewChange('inbound')}
                    className={cn(
                        'rounded-full px-6 py-3 text-lg font-semibold transition-colors',
                        orientation === 'horizontal' ? 'min-w-[180px]' : 'w-full',
                        selectedView === 'inbound'
                            ? 'bg-transvip text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    )}
                >
                    En Camino
                </button>
            )}
        </div>
    )
}

function VehicleTypes({ vehicleTypes, handleSelectedType, selectedType }: {
    vehicleTypes: VehicleTypeToggle[]
    handleSelectedType: (arg0: string) => void
    selectedType: string
}) {
    if (!vehicleTypes || vehicleTypes.length === 0) return null

    return (
        <div className='flex flex-row gap-4 overflow-x-auto text-2xl justify-center'>
            {vehicleTypes.map((vType) => (
                <div key={vType.name}
                    onClick={() => handleSelectedType(vType.name)}
                    className={cn('w-[212px] h-[140px] shrink-0 shadow-sm flex flex-col items-center justify-center p-4 rounded-lg transition-colors',
                        selectedType === vType.name ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    )}>
                    <div className='flex flex-col items-center gap-2 justify-center'>
                        <span className="text-center text-3xl font-semibold">{vType.name}</span>
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

function InboundVehicleSummary({ vehicleList }: { vehicleList: InboundAirportVehicle[] }) {
    const arriving10Minutes = vehicleList.filter((vehicle) => vehicle.eta_minutes < 10).length
    const arriving20Minutes = vehicleList.filter((vehicle) => vehicle.eta_minutes < 20 && vehicle.eta_minutes >= 10).length
    const arriving30Minutes = vehicleList.filter((vehicle) => vehicle.eta_minutes < 30 && vehicle.eta_minutes >= 20).length

    return (
        <div className='bg-white p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4'>
            <SummaryCard label='Hasta 10 min' value={arriving10Minutes} tone='success' />
            <SummaryCard label='Entre 10 y 20 min' value={arriving20Minutes} tone='warning' />
            <SummaryCard label='Entre 20 y 30 min' value={arriving30Minutes} tone='danger' />
        </div>
    )
}

function SummaryCard({
    label,
    value,
    tone = 'default',
}: {
    label: string
    value: number
    tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
    return (
        <div className={cn(
            'rounded-xl shadow-md p-5 flex flex-col gap-2 items-center justify-center text-slate-900',
            getSummaryCardTone(tone),
        )}>
            <span className={cn('text-base font-bold uppercase tracking-wide', getSummaryCardLabelTone(tone))}>{label}</span>
            <span className='text-4xl font-semibold'>{value}</span>
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
        <div className="flex flex-col flex-grow overflow-auto p-3 w-full gap-4 text-xl lg:text-2xl">
            {vehicleList.map((vehicle, index) => {
                const waitTime = vehicle.passenger_entry_time ? calculateDuration(vehicle.passenger_entry_time) : null

                // Determine background color based on wait time
                let bgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white'; // Default color

                if (waitTime && waitTime >= 10 && waitTime < AIRPORT_CONSTANTS.MAX_WAIT_TIME) {
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
                                    <span className="">·</span>
                                    <span className="text-center text-slate-600">{calculateDuration(vehicle.entry_time)} min</span>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-row gap-2 items-center'>
                            <div className='vehicle-pax flex flex-col gap-2 items-center justify-center w-[170px] lg:w-[220px]'>
                                <span className='font-semibold hidden'>Pasajeros</span>
                                <div className='flex flex-col gap-2 items-center'>
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

function InboundVehicleListDetail({ vehicleList }: { vehicleList: InboundAirportVehicle[] }) {
    if (!vehicleList || vehicleList.length === 0) {
        return <div className='w-full p-4 font-bold text-center mt-12 text-3xl'>Sin vehículos en camino</div>
    }

    return (
        <div className="flex flex-col flex-grow overflow-auto p-3 w-full gap-4 text-xl lg:text-2xl">
            {vehicleList.map((vehicle, index) => (
                <div
                    key={`${vehicle.unique_car_id}_${vehicle.eta_updated_at}`}
                    className={cn(
                        'w-full overflow-x-auto p-4 shadow-md rounded-lg text-slate-900 min-h-fit flex items-center justify-between',
                        getInboundEtaColor(vehicle.eta_minutes)
                    )}
                >
                    <div className='grid min-w-[980px] grid-cols-[48px_minmax(320px,1.7fr)_minmax(240px,1.4fr)_110px_110px] items-center gap-4 w-full'>
                        <div className='font-semibold text-3xl text-center'>{index + 1}</div>
                        <div className='flex flex-col gap-1 min-w-0'>
                            <span className='font-semibold'>{getInboundVehicleNumber(vehicle)} · {getInboundVehicleTypeName(vehicle)}</span>
                            <span className='truncate text-base lg:text-xl xl:text-2xl'>{fixName(vehicle.fleet_name)}</span>
                        </div>
                        <div className='flex flex-col gap-1 min-w-0'>
                            <span className='text-sm font-semibold uppercase tracking-wide text-slate-600'>Servicio</span>
                            <span className='truncate'>{vehicle.service_name || 'Sin servicio'} · {vehicle.passenger_count} pax</span>
                        </div>
                        <div className='flex flex-col gap-1 text-center'>
                            <span className='text-sm font-semibold uppercase tracking-wide text-slate-600'>ETA</span>
                                <span>{vehicle.eta_minutes} min</span>
                        </div>
                        <div className='flex flex-col gap-1 text-center'>
                            <span className='text-sm font-semibold uppercase tracking-wide text-slate-600'>Actualizado</span>
                            <span>{getInboundUpdatedTime(vehicle.eta_updated_at)}</span>
                        </div>
                    </div>
                </div>
            ))}
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

function getInboundEtaColor(etaMinutes: number) {
    if (etaMinutes < 10) {
        return 'bg-gradient-to-r from-green-100 to-green-200'
    }

    if (etaMinutes <= 20) {
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200'
    }

    return 'bg-gradient-to-r from-red-100 to-red-200'
}

function getSummaryCardTone(tone: 'default' | 'success' | 'warning' | 'danger') {
    switch (tone) {
        case 'success':
            return 'bg-gradient-to-r from-green-100 to-green-200'
        case 'warning':
            return 'bg-gradient-to-r from-yellow-100 to-yellow-200'
        case 'danger':
            return 'bg-gradient-to-r from-red-100 to-red-200'
        default:
            return 'bg-slate-500 text-white'
    }
}

function getSummaryCardLabelTone(tone: 'default' | 'success' | 'warning' | 'danger') {
    switch (tone) {
        case 'success':
            return 'text-green-800'
        case 'warning':
            return 'text-yellow-800'
        case 'danger':
            return 'text-red-800'
        default:
            return 'text-white'
    }
}

function getInboundVehicleTypeName(vehicle: InboundAirportVehicle) {
    return vehicle.vehicle_type_name || vehicle.vehicle_type
}

function dedupeInboundVehicles(vehicleList: InboundAirportVehicle[]) {
    const seenVehicleIds = new Set<string>()

    return vehicleList.filter((vehicle) => {
        const vehicleId = normalizeVehicleNumberKey(vehicle.unique_car_id)

        if (seenVehicleIds.has(vehicleId)) {
            return false
        }

        seenVehicleIds.add(vehicleId)
        return true
    })
}

function getZoneVehicleNumberKey(vehicle: AirportVehicleDetail) {
    const contractSuffix = vehicle.tipo_contrato === 'Leasing' ? 'L' : ''

    return normalizeVehicleNumberKey(`${vehicle.unique_car_id}${contractSuffix}`)
}

function getInboundVehicleNumberKey(vehicle: InboundAirportVehicle) {
    return normalizeVehicleNumberKey(getInboundVehicleNumber(vehicle))
}

function getInboundVehicleNumber(vehicle: InboundAirportVehicle) {
    const contractSuffix = vehicle.vehicle_contract_type === 'Leasing' ? 'L' : ''

    return `${vehicle.unique_car_id}${contractSuffix}`
}

function normalizeVehicleNumberKey(value: string) {
    return value.trim().toUpperCase()
}

function getInboundUpdatedTime(value: string) {
    if (!value) {
        return '--:--'
    }

    const normalizedValue = value.trim().replace('T', ' ')

    if (normalizedValue.length >= 16) {
        return normalizedValue.slice(11, 16)
    }

    return value
}