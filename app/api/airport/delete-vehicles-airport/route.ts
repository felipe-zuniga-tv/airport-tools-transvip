import { deleteVehicleZonaIluminada } from '@/lib/chat/functions';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const { fleetId, zoneId } = await request.json();

    if (!zoneId || !fleetId) {
        return NextResponse.json({ status: 404, message: 'Zone ID and Fleet ID are required' });
    }

    try {
        const result = await deleteVehicleZonaIluminada(Number(fleetId), Number(zoneId));
        console.log(result);
        if (!result) {
            return NextResponse.json({ status: 404, message: 'Vehicle not processed' });
        }
        return NextResponse.json(result);
    } catch (error) {
        console.error('Vehicle was not deleted from ZI', error);
        return NextResponse.json({ status: 500, message: 'Vehicle was not deleted', error: error });
    }
}