import type { ApiEnvelope } from "@/lib/api/response";

export async function readApiEnvelope<T>(response: Response) {
	return (await response.json()) as ApiEnvelope<T>;
}

export async function unwrapApiEnvelope<T>(
	response: Response,
	fallbackMessage: string,
) {
	const payload = await readApiEnvelope<T>(response);

	if (!response.ok || payload.error || payload.data === null) {
		throw new Error(payload.error ?? fallbackMessage);
	}

	return payload.data;
}
