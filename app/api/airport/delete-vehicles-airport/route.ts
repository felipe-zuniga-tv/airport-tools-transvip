import { deleteVehicleZonaIluminada } from '@/lib/chat/functions';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const fleetId = request.nextUrl.searchParams.get('fleetId') as string
    const zoneId = request.nextUrl.searchParams.get('zoneId') as string

  if (!zoneId || !fleetId) {
    return Response.json({ status: 404, message: 'Zone ID and Fleet ID are required' });
  }

  return Response.json({ Conductor: fleetId, Zona: zoneId })

  // try {
  //   const result = await deleteVehicleZonaIluminada(Number(fleetId), Number(zoneId));
  //   if (!result) {
  //     return Response.json({ status: 404, message: 'Vehicle not processed' });
  //   }
  //   return Response.json(result)
  // } catch (error) {
  //   console.error(error);
  //   return Response.json({ status: 500, message: 'Internal server error' });
  // }
}