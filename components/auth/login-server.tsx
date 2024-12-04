import { getSession } from '@/lib/auth'
import { Routes } from "@/utils/routes"
import { redirect } from 'next/navigation'
import { LoginFormClient } from './login-client'

export default async function LoginFormServer() {
	const session = await getSession()

	if (session) {
		redirect(Routes.START)
	}

	return <LoginFormClient />
}
