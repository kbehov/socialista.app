'use client'

import { AuthFormRootError, FieldError, FieldLabel } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-public'
import { cn } from '@/lib/utils'
import { forgotPasswordSchema, type ForgotPasswordSchemaType } from '@/lib/zod/auth.schema'
import { forgotPassword } from '@/services/auth.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

type ForgotPasswordFormProps = {
  className?: string
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async values => {
    try {
      await forgotPassword(values.email)
      setSubmitted(true)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
      setError('root', { message })
    }
  })

  return (
    <div className={cn('mx-auto w-full max-w-105', className)}>
      <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
        {submitted ? (
          <>
            <header className="mb-6 space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                If an account exists for that address, we sent a link to reset your password.
              </p>
            </header>
            <p className="text-center text-sm text-muted-foreground">
              <Link
                href="/auth/signin"
                className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <header className="mb-8 space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Forgot password</h1>
              <p className="text-sm text-muted-foreground">We’ll email you a link to choose a new one.</p>
            </header>

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    aria-invalid={Boolean(errors.email)}
                    className="h-11 pl-10"
                    disabled={isSubmitting}
                    {...register('email')}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              <AuthFormRootError message={errors.root?.message} />

              <Button type="submit" size="lg" className="h-11 w-full text-sm font-medium" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Remembered it?{' '}
              <Link
                href="/auth/signin"
                className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
