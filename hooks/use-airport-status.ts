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

            if (!typesData) return null
            // console.log(typesData);
            
            setVehicleTypes(typesData);

            const allVehicleLists = await Promise.all(
                typesData.map(async (type: AirportVehicleType) => {
                    const data = await airportService.getVehicles(
                        selectedZone.branch_id,
                        selectedZone.zone_id,
                        type.id
                    );
                    
                    return data.map((vehicle: AirportVehicleDetail) => ({
                        ...vehicle,
                        vehicle_type: type.name
                    }));
                })
            ).then(lists => {
                // Flatten the array and reduce to keep only latest entries
                const flatList = lists.flat();
                const vehicleMap = new Map<string, AirportVehicleDetail>();
                
                for (const vehicle of flatList) {
                    const existing = vehicleMap.get(vehicle.unique_car_id);
                    if (!existing || new Date(vehicle.entry_time) > new Date(existing.entry_time)) {
                        vehicleMap.set(vehicle.unique_car_id, vehicle);
                    }
                }
                
                // Convert to array and sort by vehicle_type and entry_time
                return Array.from(vehicleMap.values())
                    .sort((a, b) => {
                        // First sort by vehicle_type
                        if (a.vehicle_type !== b.vehicle_type) {
                            return a.vehicle_type.localeCompare(b.vehicle_type);
                        }
                        // Then sort by entry_time (most recent first)
                        return new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime();
                    });
            });

            setVehicleList(allVehicleLists);

            // Update vehicle types with counts
            const updatedVehicleTypes = typesData.map((type: AirportVehicleType) => {
                const count = allVehicleLists.filter((vehicle: AirportVehicleDetail) => vehicle.vehicle_type === type.name).length;
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