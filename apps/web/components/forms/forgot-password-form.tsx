'use client'

import {
  AuthFormFooter,
  AuthFormHeader,
  AuthFormRootError,
  AuthFormShell,
  AuthSubmitButton,
  AuthTextField,
  authFormLinkClassName,
} from '@/components/forms/auth-form-shared'
import { ApiError } from '@/lib/api-public'
import { forgotPasswordSchema, type ForgotPasswordSchemaType } from '@/lib/zod/auth.schema'
import { forgotPassword } from '@/services/auth.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
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
    <AuthFormShell className={className}>
      {submitted ? (
        <>
          <AuthFormHeader
            title="Check your email"
            description="If an account exists for that address, we sent a link to reset your password."
          />
          <AuthFormFooter>
            <Link href="/auth/signin" className={authFormLinkClassName}>
              Back to sign in
            </Link>
          </AuthFormFooter>
        </>
      ) : (
        <>
          <AuthFormHeader title="Forgot password" description="We’ll email you a link to choose a new one." />

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <AuthTextField
              id="email"
              label="Email"
              icon={Mail}
              error={errors.email?.message}
              disabled={isSubmitting}
              inputProps={{
                type: 'email',
                autoComplete: 'email',
                placeholder: 'you@company.com',
                ...register('email'),
              }}
            />

            <AuthFormRootError message={errors.root?.message} />

            <AuthSubmitButton isLoading={isSubmitting} loadingLabel="Sending...">
              Send reset link
            </AuthSubmitButton>
          </form>

          <AuthFormFooter>
            <Link href="/auth/signin" className={authFormLinkClassName}>
              Back to sign in
            </Link>
          </AuthFormFooter>
        </>
      )}
    </AuthFormShell>
  )
}
