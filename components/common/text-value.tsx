import { cn } from "@/lib/utils"

export default function TextValue({ text, value, className }: {
    text: string,
    value: number | string
    className?: string
}) {
    return (
        <div className={cn('flex flex-row gap-1 items-center', className)}>
            <span className="block text-center font-semibold">{ text }</span>
            <span className="block text-center truncate max-w-[370px]">{ value }</span>
        </div>
    )
}