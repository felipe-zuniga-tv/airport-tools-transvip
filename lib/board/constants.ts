/**
 * Transvip job_status values that remove a booking from the waiting board:
 * 1 started, 2 completed, 9 cancelled, 12 no-show.
 */
export const BOARD_EXIT_JOB_STATUSES = [1, 2, 9, 12] as const;

const BOARD_EXIT_STATUS_LABEL: Partial<Record<number, string>> = {
	1: 'Iniciada',
	2: 'Completada',
	9: 'Cancelada',
	12: 'No show',
};

export function shouldRemoveFromBoard(jobStatus: number): boolean {
	return (BOARD_EXIT_JOB_STATUSES as readonly number[]).includes(jobStatus);
}

/** True when the job may be added to the waiting board (inverse of terminal board states). */
export function isJobStatusAllowedOnBoard(jobStatus: number): boolean {
	return !shouldRemoveFromBoard(jobStatus);
}

/**
 * If the job status must not be scanned onto the board, returns a Spanish message for the UI/API.
 * Otherwise null.
 */
export function getBoardScanRejectedMessage(jobStatus: number): string | null {
	if (!shouldRemoveFromBoard(jobStatus)) return null;
	const label =
		BOARD_EXIT_STATUS_LABEL[jobStatus] ?? `estado ${jobStatus}`;
	return `No se puede registrar en el tablero: la reserva está «${label}». Solo se aceptan reservas que aún no han iniciado, finalizado, sido canceladas o registradas como no show.`;
}

export const VAN_COMPARTIDA_SERVICE_NAME = 'Van Compartida';

export const isVanCompartida = (serviceName: string) =>
	serviceName.trim() === VAN_COMPARTIDA_SERVICE_NAME;
