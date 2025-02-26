import { useState, useCallback, useEffect } from 'react';
import { AirportZone } from '@/lib/config/airport';
import { airportService } from '@/services/airport';
import { AirportVehicleDetail, AirportVehicleType } from '@/lib/types';

export function useVehicleList(
    selectedZone: AirportZone,
    selectedType: string,
    vehicleTypes: AirportVehicleType[]
) {
    const [vehicleList, setVehicleList] = useState<AirportVehicleDetail[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchVehicles = useCallback(async () => {
        if (!selectedType) {
            setVehicleList([]);
            return;
        }

        setIsLoading(true);
        try {
            const selectedVehicleType = vehicleTypes.find(v => v.name === selectedType);
            if (!selectedVehicleType) {
                setVehicleList([]);
                return;
            }

            const data = await airportService.getVehicles(
                selectedZone.branch_id,
                selectedZone.zone_id,
                selectedVehicleType.id
            );

            // Initialize an array to store removed vehicles
            let removedVehicles: any[] = [];

            // Process data to keep only the latest entry_time per unique_car_id
            let latestVehicles = data.reduce((acc: { [x: string]: any; }, vehicle: { unique_car_id: string | number; entry_time: string | number | Date; }) => {
                const existingVehicle = acc[vehicle.unique_car_id];
                if (!existingVehicle || new Date(vehicle.entry_time) < new Date(existingVehicle.entry_time)) {
                    if (existingVehicle) {
                        removedVehicles.push(existingVehicle);
                    }
                    acc[vehicle.unique_car_id] = {
                        ...vehicle,
                        vehicle_type: selectedVehicleType.name
                    };
                } else {
                    removedVehicles.push(vehicle);
                }
                return acc;
            }, {});

            latestVehicles = Object.values(latestVehicles)

            setVehicleList(latestVehicles);
            // setVehicleList(data);
        } catch (error) {
            console.error('Error fetching vehicle list:', error);
            setVehicleList([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedZone.branch_id, selectedZone.zone_id, selectedType, vehicleTypes]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    return {
        vehicleList,
        isLoading,
        fetchVehicles,
    };
}