import { useState, useCallback, useEffect } from 'react';
import { AirportZone } from '@/lib/config/airport';
import { airportService } from '@/services/airport';
import { AirportVehicleDetail, AirportVehicleType } from '@/lib/types';

export function useAirportStatus(selectedZone: AirportZone, secondsToUpdate: number) {
    const [vehicleTypes, setVehicleTypes] = useState<AirportVehicleType[]>([]);
    const [vehicleList, setVehicleList] = useState<AirportVehicleDetail[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUpdates = useCallback(async () => {
        try {
            setIsLoading(true);
            const typesData = await airportService.refreshDashboard(selectedZone.zone_id);
            setVehicleTypes(typesData);

            const allVehicleLists = await Promise.all(
                typesData.map(async (type: AirportVehicleType) => {
                    const data = await airportService.getVehicles(
                        selectedZone.branch_id,
                        selectedZone.zone_id,
                        type.id
                    );
                    const vehiclesWithType = data.map((vehicle: AirportVehicleDetail) => ({
                        ...vehicle,
                        vehicle_type: type.name
                    }));
                    const latestEntries = Object.values(
                        vehiclesWithType.reduce((acc: Record<string, AirportVehicleDetail>, curr: AirportVehicleDetail) => {
                            if (!acc[curr.unique_car_id] || new Date(curr.entry_time) > new Date(acc[curr.unique_car_id].entry_time)) {
                                acc[curr.unique_car_id] = curr;
                            }
                            return acc;
                        }, {})
                    );
                    return latestEntries;
                })
            );

            const combinedVehicleList = allVehicleLists.flat();
            setVehicleList(combinedVehicleList);
            // Update vehicle types with counts
            const updatedVehicleTypes = typesData.map((type: AirportVehicleType) => {
                const count = combinedVehicleList.filter((vehicle: AirportVehicleDetail) => vehicle.vehicle_type === type.name).length;
                return { ...type, count };
            });
            setVehicleTypes(updatedVehicleTypes);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedZone]);

    useEffect(() => {
        fetchUpdates();
        const interval = setInterval(fetchUpdates, secondsToUpdate * 1000);
        return () => clearInterval(interval);
    }, [fetchUpdates, secondsToUpdate]);

    return { vehicleTypes, vehicleList, isLoading, fetchUpdates };
}