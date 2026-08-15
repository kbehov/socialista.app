'use client'

import { AuthFormRootError, FieldError, FieldLabel } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-public'
import { cn } from '@/lib/utils'
import { resetPasswordSchema, type ResetPasswordSchemaType } from '@/lib/zod/auth.schema'
import { resetPassword } from '@/services/auth.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type ResetPasswordFormProps = {
  className?: string
}

export function ResetPasswordForm({ className }: ResetPasswordFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async values => {
    if (!token) {
      setError('root', { message: 'This reset link is invalid or has expired.' })
      return
    }

    try {
      await resetPassword(token, values.password)
      toast.success('Password updated. Sign in to continue.')
      router.push('/auth/signin')
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
      setError('root', { message })
    }
  })

  const isLoading = isSubmitting

  if (!token) {
    return (
      <div className={cn('mx-auto w-full max-w-105', className)}>
        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
          <header className="mb-6 space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Link expired</h1>
            <p className="text-sm text-muted-foreground">This reset link is invalid or missing. Request a new one.</p>
          </header>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            >
              Request a new link
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('mx-auto w-full max-w-105', className)}>
      <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
        <header className="mb-8 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Choose a new password</h1>
          <p className="text-sm text-muted-foreground">Use at least 8 characters.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Enter a new password"
                aria-invalid={Boolean(errors.password)}
                className="h-11 pr-10 pl-10"
                disabled={isLoading}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(current => !current)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your password"
                aria-invalid={Boolean(errors.confirmPassword)}
                className="h-11 pr-10 pl-10"
                disabled={isLoading}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(current => !current)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <AuthFormRootError message={errors.root?.message} />

          <Button type="submit" size="lg" className="h-11 w-full text-sm font-medium" disabled={isLoading}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
