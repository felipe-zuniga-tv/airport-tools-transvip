import { useCallback, useEffect, useRef, useState } from 'react';

import { AirportZone } from '@/lib/config/airport';
import { InboundAirportVehicle } from '@/lib/types';
import { airportService } from '@/services/airport';

export function useAirportInbound(
	selectedZone: AirportZone,
	secondsToUpdate: number,
	enabled = true,
) {
	const [vehicleList, setVehicleList] = useState<InboundAirportVehicle[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasLoaded, setHasLoaded] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const latestRequestIdRef = useRef(0);

	const fetchInboundVehicles = useCallback(async () => {
		if (!enabled) {
			return null;
		}

		const requestId = latestRequestIdRef.current + 1;
		latestRequestIdRef.current = requestId;

		try {
			setIsLoading(true);
			setError(null);
			const vehicles = await airportService.getInboundVehicles(selectedZone.zone_id);

			if (requestId !== latestRequestIdRef.current) {
				return null;
			}

			setVehicleList(
				vehicles
					.slice()
					.map((vehicle) => ({
						...vehicle,
						vehicle_type_name: vehicle.vehicle_type_name || vehicle.vehicle_type,
						service_name: vehicle.service_name || 'Sin servicio',
						vehicle_contract_type: vehicle.vehicle_contract_type || '',
					}))
					.sort((left, right) => left.eta_minutes - right.eta_minutes),
			);
			setHasLoaded(true);
		} catch (error) {
			console.error('Error fetching inbound airport vehicles:', error);

			if (requestId === latestRequestIdRef.current) {
				setVehicleList([]);
				setHasLoaded(true);
				setError('No se pudo cargar la vista En Camino');
			}
		} finally {
			if (requestId === latestRequestIdRef.current) {
				setIsLoading(false);
			}
		}
	}, [enabled, selectedZone.zone_id]);

	useEffect(() => {
		if (!enabled) {
			setIsLoading(false);
			return;
		}

		fetchInboundVehicles();
		const interval = setInterval(fetchInboundVehicles, secondsToUpdate * 1000);

		return () => clearInterval(interval);
	}, [enabled, fetchInboundVehicles, secondsToUpdate]);

	return { vehicleList, isLoading, hasLoaded, error, fetchInboundVehicles };
}
