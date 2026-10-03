'use client'

import {
  AuthFormHeader,
  AuthFormRootError,
  AuthFormShell,
  AuthPasswordField,
  AuthSubmitButton,
  authFormLinkClassName,
} from '@/components/forms/auth-form-shared'
import { ApiError } from '@/lib/api-public'
import { resetPasswordSchema, type ResetPasswordSchemaType } from '@/lib/zod/auth.schema'
import { resetPassword } from '@/services/auth.service'
import { zodResolver } from '@hookform/resolvers/zod'
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
      <AuthFormShell className={className}>
        <AuthFormHeader
          title="Link expired"
          description="This reset link is invalid or missing. Request a new one."
        />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/forgot-password" className={authFormLinkClassName}>
            Request a new link
          </Link>
        </p>
      </AuthFormShell>
    )
  }

  return (
    <AuthFormShell className={className}>
      <AuthFormHeader title="Choose a new password" description="Use at least 8 characters." />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthPasswordField
          id="password"
          label="New password"
          error={errors.password?.message}
          disabled={isLoading}
          visible={showPassword}
          onToggleVisible={() => setShowPassword(current => !current)}
          toggleLabelVisible="Hide password"
          toggleLabelHidden="Show password"
          inputProps={{
            autoComplete: 'new-password',
            placeholder: 'Enter a new password',
            ...register('password'),
          }}
        />

        <AuthPasswordField
          id="confirmPassword"
          label="Confirm password"
          error={errors.confirmPassword?.message}
          disabled={isLoading}
          visible={showConfirmPassword}
          onToggleVisible={() => setShowConfirmPassword(current => !current)}
          toggleLabelVisible="Hide password"
          toggleLabelHidden="Show password"
          inputProps={{
            autoComplete: 'new-password',
            placeholder: 'Confirm your password',
            ...register('confirmPassword'),
          }}
        />

        <AuthFormRootError message={errors.root?.message} />

        <AuthSubmitButton isLoading={isSubmitting} loadingLabel="Updating...">
          Update password
        </AuthSubmitButton>
      </form>
    </AuthFormShell>
  )
}
