export interface BoardEntryRow {
	branch_id: number;
	booking_id: number;
	scanned_at: string;
	scanner_email: string | null;
	service_name: string;
	pax_count: number;
	destination_address: string | null;
	dest_lat: number | null;
	dest_lng: number | null;
	/** From booking at scan time; nullable for rows created before this column existed. */
	shared_service_id: string | null;
	last_status_check_at: string | null;
}

export interface BoardListItem {
	booking_id: number;
	scanned_at: string;
	service_name: string;
	/** Convenio / contrato (from booking.contract_name when synced). */
	agreement_name: string;
	pax_count: number;
	destination_address: string | null;
	dest_lat: number | null;
	dest_lng: number | null;
	job_status: number;
	customer_full_name: string;
	customer_phone: string;
	customer_email: string;
	customer_category: string;
	/** Present when the booking is tied to a shared service (Zarpe / van compartida). */
	shared_service_id: string | null;
	stale: boolean;
}

export interface BoardActiveResponse {
	shared: BoardListItem[];
	exclusive: BoardListItem[];
	oldest_scanned_at: string | null;
	total_bookings: number;
	total_pax: number;
	shared_pax_waiting: number;
	exclusive_pax_waiting: number;
}
