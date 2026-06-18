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
import { signInSchema, type SignInSchemaType } from '@/lib/zod/auth.schema'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
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
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue to Socialista</p>
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
                autoComplete="current-password"
                placeholder="Enter your password"
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

          <AuthFormRootError message={errors.root?.message} />

          <Button type="submit" size="lg" className="h-11 w-full text-sm font-medium" disabled={isLoading}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
