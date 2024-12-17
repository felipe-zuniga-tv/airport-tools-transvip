import { deleteVehicleZonaIluminada } from '@/lib/chat/functions';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const fleetId = request.nextUrl.searchParams.get('fleetId') as string
    const zoneId = request.nextUrl.searchParams.get('zoneId') as string

  if (!zoneId || !fleetId) {
    return Response.json({ status: 404, message: 'Zone ID and Fleet ID are required' });
  }

  try {
    const result = await deleteVehicleZonaIluminada(Number(fleetId), Number(zoneId));
    console.log(result)
    if (!result) {
      return Response.json({ status: 404, message: 'Vehicle not processed' });
    }
    return Response.json(result)
  } catch (error) {
    console.error('Vehicle was not deleted from ZI', error);
    return Response.json({ status: 500, message: 'Vehicle was not deleted', error: error });
  }
}