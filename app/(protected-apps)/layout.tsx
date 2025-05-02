import { getSession } from "@/lib/auth";
import { Routes } from "@/utils/routes";
import { redirect } from "next/navigation";

export default async function ProtectedAppsLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession() as unknown;

	if (!session) {
		redirect(Routes.LOGIN);
	}

	return <>{children}</>
}