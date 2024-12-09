import { getZonaIluminadaServices } from '@/lib/chat/functions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const zoneId = request.nextUrl.searchParams.get('zoneId') as string
  
  if (!zoneId) {
    return NextResponse.json({ error: 'Missing zoneId' }, { status: 400 })
  }

  try {
    const data = await getZonaIluminadaServices(parseInt(zoneId, 10))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching zona iluminada services:', error)
    return NextResponse.json({ status: 500, error: 'Failed to fetch services' })
  }
}