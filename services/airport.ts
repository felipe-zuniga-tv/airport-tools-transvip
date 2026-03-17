import { unwrapApiEnvelope } from "@/lib/api/client";
import {
	AirportVehicleDetail,
	AirportVehicleType,
	InboundAirportVehicle,
} from "@/lib/types";

export const airportService = {
    async refreshDashboard(zoneId: number) {
        const response = await fetch(`/api/airport/refresh-dashboard?zoneId=${zoneId}`);
        return unwrapApiEnvelope<AirportVehicleType[]>(response, 'Failed to fetch vehicle types');
    },

    async getVehicles(branchId: number, zoneId: number, vehicleId: number[]) {
        const response = await fetch(`/api/airport/get-vehicles-dashboard?branchId=${branchId}&zoneId=${zoneId}&vehicleId=${vehicleId}`);
        return unwrapApiEnvelope<AirportVehicleDetail[]>(response, 'Failed to fetch vehicle list');
    },

    async getInboundVehicles(zoneId: number) {
        const response = await fetch(`/api/airport/inbound-vehicles?zoneId=${zoneId}`);
        return unwrapApiEnvelope<InboundAirportVehicle[]>(response, 'Failed to fetch inbound vehicles');
    },

    async deleteVehicle(zoneId: number, fleetId: number) {
        const response = await fetch(`/api/airport/delete-vehicles-airport`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ zoneId, fleetId }),
        });
        return unwrapApiEnvelope(response, 'Failed to delete vehicle');
    }
}