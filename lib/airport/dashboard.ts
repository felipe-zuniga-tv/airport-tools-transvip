import { AirportVehicleDetail, AirportVehicleType } from "@/lib/types";

interface VehicleListByType {
	type: AirportVehicleType;
	vehicles: AirportVehicleDetail[];
}

interface AirportDashboardState {
	vehicleList: AirportVehicleDetail[];
	vehicleTypes: AirportVehicleType[];
}

export function buildAirportDashboardState(
	vehicleTypes: AirportVehicleType[],
	vehicleListsByType: VehicleListByType[],
): AirportDashboardState {
	const latestVehicles = new Map<string, AirportVehicleDetail>();

	for (const { type, vehicles } of vehicleListsByType) {
		for (const vehicle of vehicles) {
			const nextVehicle = {
				...vehicle,
				vehicle_type: type.name,
			};
			const existingVehicle = latestVehicles.get(nextVehicle.unique_car_id);

			if (
				!existingVehicle ||
				new Date(nextVehicle.entry_time).getTime() >
					new Date(existingVehicle.entry_time).getTime()
			) {
				latestVehicles.set(nextVehicle.unique_car_id, nextVehicle);
			}
		}
	}

	const vehicleList = Array.from(latestVehicles.values()).sort((a, b) => {
		if (a.vehicle_type !== b.vehicle_type) {
			return a.vehicle_type.localeCompare(b.vehicle_type);
		}

		return (
			new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
		);
	});

	const countsByType = vehicleList.reduce<Map<string, number>>((counts, vehicle) => {
		counts.set(vehicle.vehicle_type, (counts.get(vehicle.vehicle_type) ?? 0) + 1);
		return counts;
	}, new Map());

	return {
		vehicleList,
		vehicleTypes: vehicleTypes.map((type) => ({
			...type,
			count: countsByType.get(type.name) ?? 0,
		})),
	};
}
