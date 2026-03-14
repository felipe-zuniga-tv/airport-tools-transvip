import { getZonaIluminadaServices } from '@/lib/main/functions'
import { apiError, apiSuccess } from '@/lib/api/response'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const zoneId = request.nextUrl.searchParams.get('zoneId') as string
  
  if (!zoneId) {
    return apiError('Missing zoneId', 400)
  }

  try {
    const data = await getZonaIluminadaServices(parseInt(zoneId))

    if (!data) {
      return apiError('No services found', 404)
    }
    
    return apiSuccess(data)
  } catch (error) {
    console.error('Error refreshing zona iluminada services:', error)
    return apiError('Failed to fetch services', 500)
  }
}