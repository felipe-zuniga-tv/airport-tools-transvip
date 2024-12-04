import { getZonaIluminadaServices } from '@/lib/chat/functions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const zoneId = request.nextUrl.searchParams.get('zoneId') as string
  
  if (!zoneId) {
    return NextResponse.json({ error: 'Missing zoneId' }, { status: 400 })
  }

  const data = await getZonaIluminadaServices(parseInt(zoneId, 10))
  return NextResponse.json(data)
}