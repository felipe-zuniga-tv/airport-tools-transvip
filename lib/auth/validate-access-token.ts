/**
 * Validates the upstream admin access_token via get_admin_auth.
 * Conservative: only maps JSON envelope `status === 401` to unauthorized;
 * everything ambiguous stays unknown (no forced logout).
 */

export type AccessTokenValidation = 'ok' | 'unauthorized' | 'unknown';

function buildAdminAuthUrl(accessToken: string): string | null {
	const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
	if (!base || !accessToken) return null;

	const route = (
		process.env.API_ADMIN_AUTH_ROUTE?.trim() || 'get_admin_auth'
	).replace(/^\//, '');
	const access =
		process.env.API_ADMIN_AUTH_ACCESS?.trim() ||
		'Autorizar Anulación de Reserva';

	const params = new URLSearchParams();
	params.set('access', access);
	params.set('access_token', accessToken);

	const root = base.replace(/\/$/, '');
	return `${root}/${route}?${params.toString()}`;
}

export async function checkAccessTokenStillValid(
	accessToken: string,
): Promise<AccessTokenValidation> {
	const url = buildAdminAuthUrl(accessToken);
	if (!url) return 'unknown';

	const controller = new AbortController();
	const timeoutMs = 20_000;
	const t = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Language': 'es',
			},
			signal: controller.signal,
		});

		const text = await response.text();
		if (!text.trim()) return 'unknown';

		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch {
			return 'unknown';
		}

		if (!parsed || typeof parsed !== 'object') return 'unknown';

		const status = (parsed as { status?: unknown }).status;
		if (status === 200) return 'ok';
		if (status === 401) return 'unauthorized';

		return 'unknown';
	} catch {
		return 'unknown';
	} finally {
		clearTimeout(t);
	}
}
