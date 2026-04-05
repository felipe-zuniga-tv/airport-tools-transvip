/**
 * Transvip job_status values that remove a booking from the waiting board:
 * 1 started, 2 completed, 9 cancelled, 12 no-show.
 */
export const BOARD_EXIT_JOB_STATUSES = [1, 2, 9, 12] as const;

export function shouldRemoveFromBoard(jobStatus: number): boolean {
	return (BOARD_EXIT_JOB_STATUSES as readonly number[]).includes(jobStatus);
}

export const VAN_COMPARTIDA_SERVICE_NAME = 'Van Compartida';

export const isVanCompartida = (serviceName: string) =>
	serviceName.trim() === VAN_COMPARTIDA_SERVICE_NAME;
