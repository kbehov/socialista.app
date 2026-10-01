'use client'

import { Button } from '@/components/ui/button'
import { persistBrowserTimezoneCookie } from '@/utils/timezone'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password. Please try again.',
  invalid_credentials: 'Invalid email or password. Please try again.',
  social_login_failed: 'Social sign-in failed. Please try again.',
  OAuthAccountNotLinked: 'This email is linked to another sign-in method.',
  default: 'Something went wrong. Please try again.',
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

type SocialProvider = 'google' | 'twitter'

export function AuthSocialButtons({
  callbackUrl,
  disabled,
  onBusyChange,
}: {
  callbackUrl: string
  disabled?: boolean
  onBusyChange?: (busy: boolean) => void
}) {
  const [pending, setPending] = useState<SocialProvider | null>(null)

  const handleSocial = async (provider: SocialProvider) => {
    try {
      setPending(provider)
      onBusyChange?.(true)
      persistBrowserTimezoneCookie()
      await signIn(provider, { callbackUrl })
    } catch {
      toast.error(AUTH_ERROR_MESSAGES.default)
      setPending(null)
      onBusyChange?.(false)
    }
  }

  const busy = pending !== null

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full bg-background/60 text-sm font-medium"
        onClick={() => handleSocial('google')}
        disabled={disabled || busy}
      >
        {pending === 'google' ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full bg-background/60 text-sm font-medium"
        onClick={() => handleSocial('twitter')}
        disabled={disabled || busy}
      >
        {pending === 'twitter' ? <Loader2 className="size-4 animate-spin" /> : <XIcon className="size-4" />}
        Continue with X
      </Button>
    </div>
  )
}

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}

export function AuthFormRootError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <div
      className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
      role="alert"
    >
      {message}
    </div>
  )
}

export function AuthFormDivider() {
  return (
    <div className="my-8 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
