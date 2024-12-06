export const airportService = {
    async refreshDashboard(zoneId: number) {
        const response = await fetch(`/api/airport/refresh-dashboard?zoneId=${zoneId}`);
        if (!response.ok) throw new Error('Failed to fetch vehicle types');
        return response.json();
    },

    async getVehicles(branchId: number, zoneId: number, vehicleId: number[]) {
        const response = await fetch(`/api/airport/get-vehicles-dashboard?branchId=${branchId}&zoneId=${zoneId}&vehicleId=${vehicleId}`);
        if (!response.ok) throw new Error('Failed to fetch vehicle list');
        return response.json();
    },

    async deleteVehicle(zoneId: number, fleetId: number) {
        const response = await fetch(`/api/airport/delete-vehicles-airport?zoneId=${zoneId}&fleetId=${fleetId}`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Failed to delete vehicle');
        return response.json();
    }
}