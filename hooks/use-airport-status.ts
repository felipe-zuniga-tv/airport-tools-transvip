import { useState, useCallback, useEffect, useRef } from 'react';
import { AirportZone } from '@/lib/config/airport';
import { airportService } from '@/services/airport';
import { AirportVehicleDetail, AirportVehicleType } from '@/lib/types';
import { buildAirportDashboardState } from '@/lib/airport/dashboard';

export function useAirportStatus(
    selectedZone: AirportZone,
    secondsToUpdate: number,
    initialVehicleTypes: AirportVehicleType[] = [],
    enabled = true,
) {
    const [vehicleTypes, setVehicleTypes] = useState<AirportVehicleType[]>(initialVehicleTypes);
    const [vehicleList, setVehicleList] = useState<AirportVehicleDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const latestRequestIdRef = useRef(0);

    const fetchUpdates = useCallback(async () => {
        if (!enabled) {
            return null;
        }

        const requestId = latestRequestIdRef.current + 1;
        latestRequestIdRef.current = requestId;

        try {
            setIsLoading(true);
            const typesData = await airportService.refreshDashboard(selectedZone.zone_id);

            if (!typesData) {
                if (requestId === latestRequestIdRef.current) {
                    setVehicleTypes([]);
                    setVehicleList([]);
                }
                return null
            }

            const vehicleListsByType = await Promise.all(
                typesData.map(async (type: AirportVehicleType) => {
                    const vehicles = await airportService.getVehicles(
                        selectedZone.branch_id,
                        selectedZone.zone_id,
                        type.id
                    );

                    return {
                        type,
                        vehicles,
                    };
                })
            );

            if (requestId !== latestRequestIdRef.current) {
                return null;
            }

            const nextDashboardState = buildAirportDashboardState(typesData, vehicleListsByType);
            setVehicleList(nextDashboardState.vehicleList);
            setVehicleTypes(nextDashboardState.vehicleTypes);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            if (requestId === latestRequestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, [enabled, selectedZone.branch_id, selectedZone.zone_id]);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            return;
        }

        fetchUpdates();
        const interval = setInterval(fetchUpdates, secondsToUpdate * 1000);
        return () => clearInterval(interval);
    }, [enabled, fetchUpdates, secondsToUpdate]);

    return { vehicleTypes, vehicleList, isLoading, fetchUpdates };
}