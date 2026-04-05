import { redirect } from 'next/navigation';

export default async function WaitingBoardPage({
	params,
}: {
	params: Promise<{ airport: string }>;
}) {
	const airport = (await params).airport;
	redirect(`/aeropuerto/zi/${airport.toLowerCase()}`);
}
