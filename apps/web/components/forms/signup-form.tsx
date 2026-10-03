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
} from '@/components/forms/auth-form-shared'
import { ApiError } from '@/lib/api-public'
import { signUpSchema, type SignUpSchemaType } from '@/lib/zod/auth.schema'
import { signUp as signUpService } from '@/services/auth.service'
import { authPageHref, resolveAuthCallbackUrl } from '@/utils/auth.utils'
import { getBrowserTimezone } from '@/utils/timezone'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, User } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type SignUpFormProps = {
  className?: string
}

export function SignUpForm({ className }: SignUpFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = resolveAuthCallbackUrl(searchParams)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSocialBusy, setIsSocialBusy] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
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
    try {
      const response = await signUpService(values.email, values.password, values.name, getBrowserTimezone())

      if (!response.success) {
        setError('root', { message: response.message ?? AUTH_ERROR_MESSAGES.default })
        return
      }

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

      toast.success('Account created successfully!')
      router.push(callbackUrl)
      router.refresh()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : AUTH_ERROR_MESSAGES.default
      setError('root', { message })
    }
  })

  const isLoading = isSubmitting || isSocialBusy

  return (
    <AuthFormShell className={className}>
      <AuthFormHeader
        title="Create your account"
        description="Start managing your social presence with Socialista"
      />

      <AuthSocialButtons callbackUrl={callbackUrl} disabled={isLoading} onBusyChange={setIsSocialBusy} />

      <AuthFormDivider />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthTextField
          id="name"
          label="Full name"
          icon={User}
          error={errors.name?.message}
          disabled={isLoading}
          inputProps={{
            type: 'text',
            autoComplete: 'name',
            placeholder: 'Jane Smith',
            ...register('name'),
          }}
        />

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
            autoComplete: 'new-password',
            placeholder: 'At least 8 characters',
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
          toggleLabelVisible="Hide password confirmation"
          toggleLabelHidden="Show password confirmation"
          inputProps={{
            autoComplete: 'new-password',
            placeholder: 'Re-enter your password',
            ...register('confirmPassword'),
          }}
        />

        <AuthFormRootError message={errors.root?.message} />

        <AuthSubmitButton isLoading={isSubmitting} loadingLabel="Creating account..." disabled={isLoading}>
          Create account
        </AuthSubmitButton>
      </form>

      <AuthFormFooter>
        Already have an account?{' '}
        <Link href={authPageHref('/auth/signin', callbackUrl)} className={authFormLinkClassName}>
          Sign in
        </Link>
      </AuthFormFooter>
    </AuthFormShell>
  )
}
