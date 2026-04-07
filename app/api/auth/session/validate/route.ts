import { NextResponse } from 'next/server';
import { getSession, logout } from '@/lib/auth';
import { checkAccessTokenStillValid } from '@/lib/auth/validate-access-token';

export const dynamic = 'force-dynamic';

const noStoreHeaders = {
	'Cache-Control': 'private, no-store',
};

export async function GET() {
	const session = await getSession();
	const user = session?.user as { accessToken?: string } | undefined;
	const accessToken = user?.accessToken;

	if (!accessToken) {
		await logout();
		return NextResponse.json(
			{ ok: false, reason: 'no_session' },
			{ status: 401, headers: noStoreHeaders },
		);
	}

	const result = await checkAccessTokenStillValid(accessToken);

	if (result === 'unauthorized') {
		await logout();
		return NextResponse.json(
			{ ok: false, reason: 'unauthorized' },
			{ status: 401, headers: noStoreHeaders },
		);
	}

	if (result === 'unknown') {
		return NextResponse.json(
			{ ok: true, validated: false },
			{ status: 200, headers: noStoreHeaders },
		);
	}

	return NextResponse.json(
		{ ok: true, validated: true },
		{ status: 200, headers: noStoreHeaders },
	);
}
