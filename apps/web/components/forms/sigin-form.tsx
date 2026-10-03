'use client'

import {
  AUTH_ERROR_MESSAGES,
  AuthFormDivider,
  AuthFormFooter,
  AuthFormHeader,
  AuthFormRootError,
  AuthFormShell,
  AuthPasswordField,
  AuthSocialButtons,
  AuthSubmitButton,
  AuthTextField,
  authFormLinkClassName,
  authFormMutedLinkClassName,
} from '@/components/forms/auth-form-shared'
import { signInSchema, type SignInSchemaType } from '@/lib/zod/auth.schema'
import { authPageHref, resolveAuthCallbackUrl } from '@/utils/auth.utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type SignInFormProps = {
  className?: string
}

export function SignInForm({ className }: SignInFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = resolveAuthCallbackUrl(searchParams)
  const [showPassword, setShowPassword] = useState(false)
  const [isSocialBusy, setIsSocialBusy] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  })

  useEffect(() => {
    const error = searchParams.get('error')
    if (!error) return

    const message = AUTH_ERROR_MESSAGES[error] ?? AUTH_ERROR_MESSAGES.default
    toast.error(message)
  }, [searchParams])

  const onSubmit = handleSubmit(async values => {
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    })

    if (result?.error) {
      const message = AUTH_ERROR_MESSAGES[result.error] ?? AUTH_ERROR_MESSAGES.default
      setError('root', { message })
      return
    }

    toast.success('Welcome back!')
    router.push(callbackUrl)
    router.refresh()
  })

  const isLoading = isSubmitting || isSocialBusy

  return (
    <AuthFormShell className={className}>
      <AuthFormHeader title="Welcome back" description="Sign in to continue to Socialista" />

      <AuthSocialButtons callbackUrl={callbackUrl} disabled={isLoading} onBusyChange={setIsSocialBusy} />

      <AuthFormDivider />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthTextField
          id="email"
          label="Email"
          icon={Mail}
          error={errors.email?.message}
          disabled={isLoading}
          inputProps={{
            type: 'email',
            autoComplete: 'email',
            placeholder: 'you@company.com',
            ...register('email'),
          }}
        />

        <div className="space-y-1.5">
          <AuthPasswordField
            id="password"
            label="Password"
            error={errors.password?.message}
            disabled={isLoading}
            visible={showPassword}
            onToggleVisible={() => setShowPassword(current => !current)}
            toggleLabelVisible="Hide password"
            toggleLabelHidden="Show password"
            inputProps={{
              autoComplete: 'current-password',
              placeholder: 'Enter your password',
              ...register('password'),
            }}
          />
          <div className="flex justify-end pt-0.5">
            <Link href="/auth/forgot-password" className={authFormMutedLinkClassName}>
              Forgot password?
            </Link>
          </div>
        </div>

        <AuthFormRootError message={errors.root?.message} />

        <AuthSubmitButton isLoading={isSubmitting} loadingLabel="Signing in..." disabled={isLoading}>
          Sign in
        </AuthSubmitButton>
      </form>

      <AuthFormFooter>
        Don&apos;t have an account?{' '}
        <Link href={authPageHref('/auth/signup', callbackUrl)} className={authFormLinkClassName}>
          Create one
        </Link>
      </AuthFormFooter>
    </AuthFormShell>
  )
}
