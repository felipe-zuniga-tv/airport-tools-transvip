import type { ApiEnvelope } from "@/lib/api/response";

export async function readApiEnvelope<T>(response: Response) {
	const text = await response.text();
	if (!text.trim()) {
		throw new Error(
			`Respuesta vacía del servidor (${response.status} ${response.statusText || ""}).`,
		);
	}
	try {
		return JSON.parse(text) as ApiEnvelope<T>;
	} catch {
		throw new Error(
			`Respuesta no es JSON válido (${response.status}): ${text.slice(0, 200)}`,
		);
	}
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
