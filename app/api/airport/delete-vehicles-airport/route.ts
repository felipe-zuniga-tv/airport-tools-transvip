import { deleteVehicleZonaIluminada } from '@/lib/main/functions';
import { apiError, apiSuccess } from '@/lib/api/response';
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const { fleetId, zoneId } = await request.json();

    if (!zoneId || !fleetId) {
        return apiError('Zone ID and Fleet ID are required', 400);
    }

    try {
        const result = await deleteVehicleZonaIluminada(Number(fleetId), Number(zoneId));

        if (!result) {
            return apiError('Vehicle not processed', 404);
        }

        return apiSuccess(result);
    } catch (error) {
        console.error('Vehicle was not deleted from ZI', error);
        return apiError('Vehicle was not deleted', 500);
    }
}