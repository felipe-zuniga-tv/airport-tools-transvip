import { getAirportStatus } from '@/lib/chat/functions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const branchId = request.nextUrl.searchParams.get('branchId') as string
    const zoneId = request.nextUrl.searchParams.get('zoneId') as string
    const vehicleIdList = request.nextUrl.searchParams.get('vehicleId') as string

    if (!zoneId || !branchId || !vehicleIdList) {
        return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 })
    }

    try {
        const data = await getAirportStatus(parseInt(branchId), parseInt(zoneId), vehicleIdList)   
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching zona iluminada vehicles info:', error)
        return NextResponse.json({ status: 500, error: 'Failed to fetch services data', data: null })
    }
}