'use client'

import {
  AUTH_ERROR_MESSAGES,
  AuthFormDivider,
  AuthFormRootError,
  FieldError,
  FieldLabel,
  GoogleIcon,
} from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-public'
import { signUpSchema, type SignUpSchemaType } from '@/lib/zod/auth.schema'
import { cn } from '@/lib/utils'
import { signUp as signUpService } from '@/services/auth.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type SignUpFormProps = {
  className?: string
}

export function SignUpForm({ className }: SignUpFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

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
      const response = await signUpService(values.email, values.password, values.name)

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

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      await signIn('google', { callbackUrl })
    } catch {
      toast.error(AUTH_ERROR_MESSAGES.default)
      setIsGoogleLoading(false)
    }
  }

  const isLoading = isSubmitting || isGoogleLoading

  return (
    <div className={cn('mx-auto w-full max-w-[420px]', className)}>
      <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
        <header className="mb-8 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start managing your social presence with Socialista</p>
        </header>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 w-full bg-background/60 text-sm font-medium"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon className="size-4" />
            )}
            Continue with Google
          </Button>
        </div>

        <AuthFormDivider />

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                aria-invalid={Boolean(errors.name)}
                className="h-11 pl-10"
                disabled={isLoading}
                {...register('name')}
              />
            </div>
            <FieldError message={errors.name?.message} />
          </div>

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
                disabled={isLoading}
                {...register('email')}
              />
            </div>
            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
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
                placeholder="Re-enter your password"
                aria-invalid={Boolean(errors.confirmPassword)}
                className="h-11 pr-10 pl-10"
                disabled={isLoading}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(current => !current)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
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
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
