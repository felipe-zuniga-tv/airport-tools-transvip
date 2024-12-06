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
            setVehicleList(data);
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