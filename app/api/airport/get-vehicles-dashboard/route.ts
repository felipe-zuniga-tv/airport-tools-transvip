import { getAirportStatus } from '@/lib/main/functions'
import { apiError, apiSuccess } from '@/lib/api/response'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const branchId = request.nextUrl.searchParams.get('branchId') as string
    const zoneId = request.nextUrl.searchParams.get('zoneId') as string
    const vehicleIdList = request.nextUrl.searchParams.get('vehicleId') as string

    if (!zoneId || !branchId || !vehicleIdList) {
        return apiError('Missing query parameters', 400)
    }

    try {
        const data = await getAirportStatus(parseInt(branchId), parseInt(zoneId), vehicleIdList)

        if (!data) {
            return apiError('Failed to fetch services data', 502)
        }

        return apiSuccess(data)
    } catch (error) {
        console.error('Error fetching zona iluminada vehicles info:', error)
        return apiError('Failed to fetch services data', 500)
    }
}