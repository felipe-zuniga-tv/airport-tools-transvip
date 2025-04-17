'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Routes } from '@/utils/routes'
import { login } from '@/lib/auth/functions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginFormClient() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            setIsLoading(true)
            setError(null)

            const formData = new FormData(event.currentTarget)
            const email = formData.get("email")?.toString()
            const password = formData.get("password")?.toString()

            if (!email || !password) {
                setError('Ingresa tus credenciales')
                return null
            }

            const loginResponse = await login(email, password)

            if (loginResponse && loginResponse.status === 200) {
                // router.refresh()
                router.push(Routes.START)
            } else {
                setError(loginResponse?.message || 'Ocurrió un error.')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Error de conexión. Por favor intente nuevamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col w-full sm:max-w-md justify-center gap-4">
            <form onSubmit={handleSubmit} method='POST' className="flex flex-col gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="usuario@email.com"
                        autoComplete="email"
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        disabled={isLoading}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Verificando..." : "Continuar"}
                </Button>

                {error && <div className="text-red-500 text-sm mt-2 p-2 text-center bg-white rounded-md">{error}</div>}
            </form>
        </div>
    )
}