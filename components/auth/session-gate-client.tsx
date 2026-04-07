'use client';

import { useEffect, useRef } from 'react';
import { Routes } from '@/utils/routes';

const DEFAULT_POLL_MS = 10 * 60 * 1000; // 1 minuto

function getPollIntervalMs() {
	const raw = process.env.NEXT_PUBLIC_SESSION_POLL_MS;
	if (raw === undefined || raw === '') return DEFAULT_POLL_MS;
	const n = Number(raw);
	return Number.isFinite(n) && n > 0 ? n : DEFAULT_POLL_MS;
}

export const SessionGateClient = () => {
	const visibilityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	useEffect(() => {
		const pollMs = getPollIntervalMs();

		const validate = async () => {
			try {
				const res = await fetch('/api/auth/session/validate', {
					credentials: 'include',
					cache: 'no-store',
				});
				if (res.status === 401) {
					window.location.assign(Routes.LOGIN);
				}
			} catch {
				// Network / parse errors: do not force logout
			}
		};

		const intervalId = setInterval(() => {
			void validate();
		}, pollMs);

		const onVisibilityChange = () => {
			if (document.visibilityState !== 'visible') return;
			if (visibilityDebounceRef.current) {
				clearTimeout(visibilityDebounceRef.current);
			}
			visibilityDebounceRef.current = setTimeout(() => {
				visibilityDebounceRef.current = null;
				void validate();
			}, 500);
		};

		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			clearInterval(intervalId);
			document.removeEventListener('visibilitychange', onVisibilityChange);
			if (visibilityDebounceRef.current) {
				clearTimeout(visibilityDebounceRef.current);
			}
		};
	}, []);

	return null;
};
