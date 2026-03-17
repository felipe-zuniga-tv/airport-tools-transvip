import { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/lib/api/response';
import {
	getInboundAirportVehicles,
	isAirportZoneId,
} from '@/lib/airport/inbound';
import { isInboundEnabledForZone } from '@/lib/config/airport';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
	const zoneIdParam = request.nextUrl.searchParams.get('zoneId');

	if (!zoneIdParam) {
		return apiError('Missing zoneId', 400);
	}

	const zoneId = Number.parseInt(zoneIdParam, 10);

	if (Number.isNaN(zoneId) || !isAirportZoneId(zoneId)) {
		return apiError('Invalid zoneId', 400);
	}

	if (!isInboundEnabledForZone(zoneId)) {
		return apiSuccess([]);
	}

	try {
		const data = await getInboundAirportVehicles(zoneId);
		return apiSuccess(data);
	} catch (error) {
		console.error('Error fetching inbound airport vehicles:', error);
		return apiError('Failed to fetch inbound airport vehicles', 500);
	}
}
