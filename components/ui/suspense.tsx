import { cn } from "@/lib/utils"

const DEFAULT_TEXT = 'Cargando...'

export function SuspenseLoading({ text }: { text?: string }) {
    return (
        <div className='min-h-screen flex justify-center items-center animate-pulse text-xl text-white p-16 rounded-md'>
            {text || DEFAULT_TEXT}
        </div>
    )
}

export function SuspenseSection({ text, className }: { text?: string, className?: string }) {
    return (
        <div className={cn(`bg-white p-4 h-[160px] text-base md:text-2xl lg:text-xl flex flex-row justify-center items-center gap-4 snap-start`, className)}>
            { text || DEFAULT_TEXT }
        </div>
    )
}
