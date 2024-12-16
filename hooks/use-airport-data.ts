import { AirportZone } from "@/lib/config/airport";
import { AirportVehicleType } from "@/lib/types";
import { airportService } from "@/services/airport";
import { useCallback, useEffect, useState } from "react";

export function useAirportData(selectedZone: AirportZone, secondsToUpdate: number) {
    const [vehicleTypes, setVehicleTypes] = useState<AirportVehicleType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUpdates = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await airportService.refreshDashboard(selectedZone.zone_id);
            setVehicleTypes(data);
        } catch (error) {
            console.error('Error fetching vehicle types:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedZone.zone_id]);

    useEffect(() => {
        fetchUpdates();
        const interval = setInterval(fetchUpdates, secondsToUpdate * 1000);
        return () => clearInterval(interval);
    }, [fetchUpdates, secondsToUpdate]);

    return { vehicleTypes, isLoading, fetchUpdates };
}