import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getBookingInfo } from '@/lib/main/functions';
import { apiError, apiSuccess } from '@/lib/api/response';
import { getBoardScanRejectedMessage } from '@/lib/board/constants';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const bodySchema = z.object({
	bookingId: z.coerce.number().int().positive(),
	branchId: z.coerce.number().int(),
});

function parseCoord(value: string | undefined | null): number | null {
	if (value == null || value === '') return null;
	const n = Number.parseFloat(String(value));
	return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
	const session = await getSession();
	const user = session?.user as { email?: string } | undefined;
	if (!user?.email) {
		return apiError('No autorizado', 401);
	}

	let json: unknown;
	try {
		json = await request.json();
	} catch {
		return apiError('Cuerpo inválido', 400);
	}

	const parsed = bodySchema.safeParse(json);
	if (!parsed.success) {
		return apiError('bookingId y branchId son requeridos', 400);
	}

	const { bookingId, branchId } = parsed.data;
	const supabase = getSupabaseAdmin();
	const board = supabase.schema('airport_board');

	const { data: existing, error: existingError } = await board
		.from('board_entries')
		.select('booking_id')
		.eq('branch_id', branchId)
		.eq('booking_id', bookingId)
		.maybeSingle();

	if (existingError) {
		console.error('board scan existing:', existingError);
		return apiError('Error al consultar tablero', 500);
	}

	if (existing) {
		return apiError('Esta reserva ya está en el tablero de espera.', 409);
	}

	const bookingRows = await getBookingInfo(bookingId);
	const detail = bookingRows?.find((b) => b.booking.id === bookingId) ?? bookingRows?.[0];

	if (!detail) {
		return apiError('Reserva no encontrada', 404);
	}

	if (detail.booking.type_of_trip !== 'Z') {
		return apiError('Reserva no es de tipo Zarpe', 400);
	}

	if (detail.branch?.branch_id !== branchId) {
		return apiError('La reserva no pertenece a esta sucursal.', 403);
	}

	const statusBlock = getBoardScanRejectedMessage(detail.booking.status);
	if (statusBlock) {
		return apiError(statusBlock, 400);
	}

	const destLat = parseCoord(detail.directions.destination.latitude);
	const destLng = parseCoord(detail.directions.destination.longitude);
	const paxCount = Number(detail.booking.pax_count) || 1;
	const serviceName = detail.booking.service_name?.trim() || '—';
	const destinationAddress = detail.directions.destination.address?.trim() || null;

	console.log(detail.booking)
	const sharedServiceId = detail.booking.shared_service_id ? Number(detail.booking.shared_service_id) : null;

	const row = {
		booking_id: bookingId,
		branch_id: branchId,
		scanner_email: user.email,
		service_name: serviceName,
		pax_count: paxCount,
		destination_address: destinationAddress,
		dest_lat: destLat,
		dest_lng: destLng,
		shared_service_id: sharedServiceId,
	};

	// board_entries first: avoids orphan rows in scan_events when the board insert
	// fails (and fixes duplicate races — second request hits 23505 before any event).
	const { error: entryError } = await board.from('board_entries').insert(row);

	if (entryError) {
		console.error('board_entries:', entryError);
		if (entryError.code === '23505') {
			return apiError('Esta reserva ya está en el tablero de espera.', 409);
		}
		return apiError('Error al agregar al tablero', 500);
	}

	const { error: eventError } = await board.from('scan_events').insert(row);

	if (eventError) {
		console.error('board scan_events:', eventError);
		await board
			.from('board_entries')
			.delete()
			.eq('branch_id', branchId)
			.eq('booking_id', bookingId);
		return apiError('Error al registrar escaneo', 500);
	}

	return apiSuccess({ ok: true, bookingId });
}
