'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { persistBrowserTimezoneCookie } from '@/utils/timezone'
import { AlertCircle, Eye, EyeOff, Loader2, Lock, type LucideIcon } from 'lucide-react'
import { signIn } from 'next-auth/react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password. Please try again.',
  invalid_credentials: 'Invalid email or password. Please try again.',
  social_login_failed: 'Social sign-in failed. Please try again.',
  OAuthAccountNotLinked: 'This email is linked to another sign-in method.',
  default: 'Something went wrong. Please try again.',
}

const authEase = 'ease-[cubic-bezier(0.2,0,0,1)]'

export const authFormLinkClassName =
  'font-medium text-foreground underline-offset-4 transition-colors duration-150 hover:underline'

export const authFormMutedLinkClassName =
  'text-xs font-medium text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline'

export const authInputClassName = cn(
  'h-11 rounded-lg border-border/70 bg-background/60 pl-10 shadow-xs',
  'transition-[color,background-color,box-shadow,border-color] duration-150',
  authEase,
  'focus-visible:border-ring focus-visible:bg-background',
)

export const authPasswordInputClassName = cn(authInputClassName, 'pr-10')

const authSocialButtonClassName = cn(
  'h-11 w-full justify-start gap-3 rounded-lg border-border/70 bg-background/60 px-4 text-sm font-medium shadow-xs',
  'transition-[color,background-color,box-shadow,border-color] duration-150',
  authEase,
  'hover:border-border hover:bg-muted/50 hover:shadow-sm',
)

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

function SocialButtonIcon({
  isPending,
  icon: Icon,
  brandIcon,
}: {
  isPending: boolean
  icon: typeof Loader2
  brandIcon: ReactNode
}) {
  return (
    <span className="relative size-4 shrink-0" aria-hidden="true">
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-150',
          authEase,
          isPending ? 'opacity-0' : 'opacity-100',
        )}
      >
        {brandIcon}
      </span>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-150',
          authEase,
          isPending ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Icon className="size-4 animate-spin" />
      </span>
    </span>
  )
}

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
    <div className="grid gap-2.5">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={authSocialButtonClassName}
        onClick={() => handleSocial('google')}
        disabled={disabled || busy}
      >
        <SocialButtonIcon
          isPending={pending === 'google'}
          icon={Loader2}
          brandIcon={<GoogleIcon className="size-4" />}
        />
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={authSocialButtonClassName}
        onClick={() => handleSocial('twitter')}
        disabled={disabled || busy}
      >
        <SocialButtonIcon isPending={pending === 'twitter'} icon={Loader2} brandIcon={<XIcon className="size-4" />} />
        Continue with X
      </Button>
    </div>
  )
}

export function AuthFormShell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('mx-auto w-full max-w-105', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border/50 bg-card/85 p-8',
          'shadow-[0_1px_0_oklch(1_0_0/0.04)_inset,0_1px_2px_oklch(0_0_0/0.04),0_12px_40px_oklch(0_0_0/0.06)]',
          'ring-1 ring-foreground/[0.03] backdrop-blur-md',
          'dark:border-border/40 dark:shadow-[0_1px_0_oklch(1_0_0/0.06)_inset,0_8px_32px_oklch(0_0_0/0.35)]',
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function AuthFormHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-7 space-y-1.5 text-center">
      <h1 className="text-[1.625rem] font-semibold tracking-tight text-balance text-foreground">{title}</h1>
      <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{description}</p>
    </header>
  )
}

export function AuthFormFooter({ children }: { children: ReactNode }) {
  return (
    <p className="mt-7 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">{children}</p>
  )
}

export function AuthSubmitButton({
  children,
  disabled,
  isLoading,
  loadingLabel,
}: {
  children: ReactNode
  disabled?: boolean
  isLoading?: boolean
  loadingLabel: string
}) {
  return (
    <Button
      type="submit"
      size="lg"
      className="h-11 w-full gap-2 text-sm font-semibold shadow-sm"
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[13px] font-medium leading-none text-foreground/85 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="flex items-start gap-1.5 text-[13px] leading-snug text-destructive" role="alert">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0 opacity-80" aria-hidden="true" />
      <span>{message}</span>
    </p>
  )
}

export function AuthFormRootError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <div
      className="flex gap-2.5 rounded-lg border border-destructive/15 bg-destructive/[0.06] px-3.5 py-2.5 text-sm text-destructive"
      role="alert"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 opacity-90" aria-hidden="true" />
      <p className="leading-snug">{message}</p>
    </div>
  )
}

export function AuthFormDivider() {
  return (
    <div className="relative my-7">
      <div aria-hidden="true" className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/60" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-card/85 px-3 text-muted-foreground">or continue with email</span>
      </div>
    </div>
  )
}

function AuthFieldIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/80"
      aria-hidden="true"
    />
  )
}

export function AuthPasswordToggle({
  visible,
  onToggle,
  disabled,
  labelVisible,
  labelHidden,
}: {
  visible: boolean
  onToggle: () => void
  disabled?: boolean
  labelVisible: string
  labelHidden: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground',
        'transition-colors duration-150 hover:bg-muted/60 hover:text-foreground',
        authEase,
      )}
      aria-label={visible ? labelVisible : labelHidden}
      disabled={disabled}
    >
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  )
}

type AuthTextFieldProps = {
  id: string
  label: string
  icon: LucideIcon
  error?: string
  disabled?: boolean
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

export function AuthTextField({ id, label, icon, error, disabled, inputProps }: AuthTextFieldProps) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <AuthFieldIcon icon={icon} />
        <Input
          id={id}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={authInputClassName}
          {...inputProps}
        />
      </div>
      <FieldError message={error} />
    </div>
  )
}

type AuthPasswordFieldProps = {
  id: string
  label: string
  error?: string
  disabled?: boolean
  visible: boolean
  onToggleVisible: () => void
  toggleLabelVisible: string
  toggleLabelHidden: string
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

export function AuthPasswordField({
  id,
  label,
  error,
  disabled,
  visible,
  onToggleVisible,
  toggleLabelVisible,
  toggleLabelHidden,
  inputProps,
}: AuthPasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <AuthFieldIcon icon={Lock} />
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={authPasswordInputClassName}
          {...inputProps}
        />
        <AuthPasswordToggle
          visible={visible}
          onToggle={onToggleVisible}
          disabled={disabled}
          labelVisible={toggleLabelVisible}
          labelHidden={toggleLabelHidden}
        />
      </div>
      <FieldError message={error} />
    </div>
  )
}
