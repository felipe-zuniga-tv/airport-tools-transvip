import { logout } from "@/lib/auth"
import { Routes } from "@/utils/routes"
import { redirect } from "next/navigation"
import { Button } from "../ui/button"
import { LogOutIcon } from "lucide-react"

// Define props interface for better type safety
interface LogoutButtonProps {
    // Add any specific props if needed
    className?: string
}

export default function LogoutButton({ className, ...props }: LogoutButtonProps) {
    const handleLogout = async () => {
        'use server'
        try {
            await logout()
            return redirect(Routes.HOME)
        } catch (error) {
            // Handle error (e.g., show a notification)
        }
    }

    return (
        <form action={handleLogout} {...props}>
            <Button aria-label="Logout">
                <LogOutIcon className="h-4 w-4 shrink-0" /> Salir
            </Button>
        </form>
    )
}
