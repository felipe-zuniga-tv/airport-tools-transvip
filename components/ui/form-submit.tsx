'use client'
import { useFormStatus } from 'react-dom'
import { Spinner } from './loading'
import { cn } from '@/lib/utils'

export function FormSubmit({ children, pendingState, className, ...props }: {
    children: React.ReactNode,
    pendingState: string,
    className?: string
}) {
    const { pending } = useFormStatus()

    return (
        <button type='submit' disabled={pending} {...props} 
            className={cn(`${pending ? 'bg-gray-400' : 'bg-transvip'}`, className)}>
            { pending ? pendingStateSpan({ pendingState }) : children }
        </button>
    )
}

export function pendingStateSpan({ pendingState }: {
    pendingState: string
}) {
    return (
        <span className="flex flex-row h-auto items-center gap-2">
            { pendingState } <Spinner />
        </span>
    )
}

export function SubmitButton({ children, isLoading, pendingState, className, ...props }: {
    children: React.ReactNode
    isLoading: boolean
    pendingState: string
    className?: string
}) {
    return (
        <button type='submit' disabled={isLoading} aria-disabled={isLoading}
            className={cn(`${isLoading ? 'bg-gray-400' : 'bg-transvip'}`, 'auth-btn')}>
            { isLoading ? pendingStateSpan({ pendingState }) : 'Ingresar' }
        </button>
    )
}