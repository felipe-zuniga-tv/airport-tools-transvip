-- Shared van / pooled service id captured when scanning onto the waiting board.
-- Apply in Supabase SQL editor or via `supabase db push` / migration runner.

ALTER TABLE airport_board.board_entries
	ADD COLUMN IF NOT EXISTS shared_service_id text NULL;

ALTER TABLE airport_board.scan_events
	ADD COLUMN IF NOT EXISTS shared_service_id text NULL;

COMMENT ON COLUMN airport_board.board_entries.shared_service_id IS
	'Booking shared_service_id at scan time (Zarpe / van compartida).';

COMMENT ON COLUMN airport_board.scan_events.shared_service_id IS
	'Booking shared_service_id at scan time (Zarpe / van compartida).';
