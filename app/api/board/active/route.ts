import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getBookingInfo } from '@/lib/main/functions';
import { apiError, apiSuccess } from '@/lib/api/response';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isVanCompartida, shouldRemoveFromBoard } from '@/lib/board/constants';
import {
	boardItemFromLive,
	boardItemFromSnapshot,
} from '@/lib/board/map-booking';
import type {
	BoardActiveResponse,
	BoardEntryRow,
	BoardListItem,
} from '@/lib/board/types';

export async function GET(request: Request) {
	const session = await getSession();
	if (!session?.user) {
		return apiError('No autorizado', 401);
	}

	const { searchParams } = new URL(request.url);
	const branchParsed = z.coerce.number().int().safeParse(searchParams.get('branchId'));
	if (!branchParsed.success) {
		return apiError('branchId es requerido', 400);
	}

	const branchId = branchParsed.data;
	const supabase = getSupabaseAdmin();

	const { data: entries, error: listError } = await supabase
		.schema('airport_board')
		.from('board_entries')
		.select('*')
		.eq('branch_id', branchId)
		.order('scanned_at', { ascending: true });

	if (listError) {
		console.error('board active list:', listError);
		return apiError('Error al cargar tablero', 500);
	}

	const rows = (entries ?? []) as BoardEntryRow[];

	const results = await Promise.all(
		rows.map(async (entry) => {
			const info = await getBookingInfo(entry.booking_id);
			const detail =
				info?.find((b) => b.booking.id === entry.booking_id) ?? info?.[0];
			return { entry, detail: detail ?? null };
		}),
	);

	const board = supabase.schema('airport_board');
	const items: BoardListItem[] = [];

	for (const { entry, detail } of results) {
		if (detail && shouldRemoveFromBoard(detail.booking.status)) {
			const { error: delError } = await board
				.from('board_entries')
				.delete()
				.eq('branch_id', branchId)
				.eq('booking_id', entry.booking_id);
			if (delError) {
				console.error('board delete terminal status:', delError);
			}
			continue;
		}

		if (detail) {
			items.push(boardItemFromLive(entry, detail));
		} else {
			items.push(boardItemFromSnapshot(entry));
		}
	}

	const shared = items.filter((i) => isVanCompartida(i.service_name));
	const exclusive = items.filter((i) => !isVanCompartida(i.service_name));

	const oldest =
		items.length === 0
			? null
			: items.reduce((a, b) => (a.scanned_at < b.scanned_at ? a : b)).scanned_at;

	const totalPax = items.reduce((s, i) => s + i.pax_count, 0);
	const sharedPaxWaiting = shared.reduce((s, i) => s + i.pax_count, 0);

	const payload: BoardActiveResponse = {
		shared,
		exclusive,
		oldest_scanned_at: oldest,
		total_bookings: items.length,
		total_pax: totalPax,
		shared_pax_waiting: sharedPaxWaiting,
	};

	return apiSuccess(payload);
}
