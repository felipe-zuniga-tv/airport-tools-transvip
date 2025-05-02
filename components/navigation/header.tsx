import LogoutButton from "@/components/auth/logout";
import { cn } from "@/lib/utils";

export default async function Header({ className = "", children }: { className?: string, children? : React.ReactNode }) {
    return (
        <header className={cn("sticky top-0 z-10 flex h-[56px] items-center justify-between gap-1 bg-background px-4 pl-1", className)}>
            { children }
            <div className="ml-auto flex gap-4 items-center">
                <LogoutButton className="ml-auto" />
            </div>
        </header>
    )
}