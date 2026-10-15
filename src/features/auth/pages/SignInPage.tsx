import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { ApiError } from '../../../types/api'
import { useAuth } from '../useAuth'

const signInSchema = z.object({
  email: z.email({ error: 'Enter a valid email address' }),
  password: z.string().min(1, { error: 'Enter your password' }),
})

type SignInValues = z.infer<typeof signInSchema>

export function SignInPage() {
  const { status, sessionExpired, signIn } = useAuth()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) })

  if (status === 'signedIn') {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? '/'} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      await signIn(values.email, values.password)
    } catch (error) {
      const apiError = error as ApiError
      // One message for every 401 cause — never reveal which part was wrong.
      setServerError(
        apiError.status === 401 ? 'Email or password is incorrect' : apiError.message,
      )
    }
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-1 p-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-surface-0 p-6">
        <img src="/logo.png" alt="Sanad" className="mx-auto mb-2 w-[140px]" />
        <h1 className="mb-4 text-center text-lg font-semibold text-text">Admin sign in</h1>

        {sessionExpired && (
          <p role="status" className="mb-4 rounded-md bg-surface-2 px-3 py-2 text-sm text-text">
            Your session has expired. Please sign in again.
          </p>
        )}

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-text">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              invalid={errors.email !== undefined}
              disabled={isSubmitting}
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-text">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              invalid={errors.password !== undefined}
              disabled={isSubmitting}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="text-sm text-danger">
              {serverError}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} className="mt-1">
            Sign in
          </Button>
        </form>
      </div>
    </main>
  )
}
