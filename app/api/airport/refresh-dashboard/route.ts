import { getZonaIluminadaServices } from '@/lib/chat/functions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const zoneId = request.nextUrl.searchParams.get('zoneId') as string
  
  if (!zoneId) {
    return NextResponse.json({ status: 400, error: 'Missing zoneId' })
  }

  try {
    const data = await getZonaIluminadaServices(parseInt(zoneId))
    console.log(data)

    if (data)
      return NextResponse.json(data)
    
    return NextResponse.json({ status: 404, error: 'No services found' })
  } catch (error) {
    console.error('Error fetching zona iluminada services:', error)
    return NextResponse.json({ status: 500, error: 'Failed to fetch services' })
  }
}