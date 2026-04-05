import type { IBookingInfoOutput } from '@/lib/main/types';
import type { BoardEntryRow, BoardListItem } from '@/lib/board/types';

function parseCoord(value: string | undefined | null): number | null {
	if (value == null || value === '') return null;
	const n = Number.parseFloat(String(value));
	return Number.isFinite(n) ? n : null;
}

export function boardItemFromLive(
	entry: BoardEntryRow,
	detail: IBookingInfoOutput,
): BoardListItem {
	const destLat =
		parseCoord(detail.directions.destination.latitude) ?? entry.dest_lat;
	const destLng =
		parseCoord(detail.directions.destination.longitude) ?? entry.dest_lng;

	return {
		booking_id: entry.booking_id,
		scanned_at: entry.scanned_at,
		service_name: detail.booking.service_name,
		pax_count: Number(detail.booking.pax_count) || entry.pax_count,
		destination_address:
			detail.directions.destination.address || entry.destination_address,
		dest_lat: destLat,
		dest_lng: destLng,
		job_status: detail.booking.status,
		customer_full_name: detail.customer.full_name,
		customer_phone: detail.customer.phone_number,
		customer_email: detail.customer.email,
		customer_category: detail.customer.category_name,
		stale: false,
	};
}

export function boardItemFromSnapshot(entry: BoardEntryRow): BoardListItem {
	return {
		booking_id: entry.booking_id,
		scanned_at: entry.scanned_at,
		service_name: entry.service_name,
		pax_count: entry.pax_count,
		destination_address: entry.destination_address,
		dest_lat: entry.dest_lat,
		dest_lng: entry.dest_lng,
		job_status: -1,
		customer_full_name: '—',
		customer_phone: '—',
		customer_email: '—',
		customer_category: '—',
		stale: true,
	};
}
