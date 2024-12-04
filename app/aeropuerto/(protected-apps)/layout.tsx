import { getSession } from "@/lib/auth";
import { Routes } from "@/utils/routes";
import { redirect } from "next/navigation";

export default async function AirportLayout({ children }: { children: React.ReactNode }) {
	const session = await getSession() as unknown;

	if (!session) {
		return redirect(Routes.LOGIN);
	}

	return <>{children}</>
}