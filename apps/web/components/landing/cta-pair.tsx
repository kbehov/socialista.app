'use client'

import { AUTH_ERROR_MESSAGES, GoogleIcon } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { persistBrowserTimezoneCookie } from '@/utils/timezone'
import { ArrowRight, Loader2 } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { HERO, SIGNUP_HREF } from './content'
import {
  landingCtaGoogle,
  landingCtaGoogleInverted,
  landingCtaPrimaryInverted,
  landingCtaPrimaryLg,
  landingCtaStack,
} from './landing-classes'

type CtaPairProps = {
  primaryHref?: string
  className?: string
  inverted?: boolean
  /** "Free to start · No credit card · …" under the buttons */
  showMicroline?: boolean
}

export function CtaPair({
  primaryHref = SIGNUP_HREF,
  className,
  inverted = false,
  showMicroline = true,
}: CtaPairProps) {
  const { data: session } = useSession()
  const isLoggedIn = Boolean(session?.user)

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className={cn(landingCtaStack, 'w-full sm:w-auto')}>
        <Button
          asChild
          size="lg"
          variant={inverted ? 'secondary' : 'default'}
          className={cn(landingCtaPrimaryLg, 'group w-full sm:w-auto', inverted && landingCtaPrimaryInverted)}
        >
          <Link href={isLoggedIn ? DASHBOARD_ROUTES.ROOT : primaryHref}>
            {isLoggedIn ? 'Go to dashboard' : HERO.primaryCta}
            <ArrowRight
              className="size-4 opacity-80 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Button>
        {isLoggedIn ? null : <HeroGoogleButton inverted={inverted} />}
      </div>
      {showMicroline && !isLoggedIn ? (
        <ul
          className={cn(
            'flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-[var(--landing-muted)]',
            inverted && 'text-white/50',
          )}
        >
          {HERO.microline.map((item, index) => (
            <li key={item} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="opacity-50">
                  ·
                </span>
              ) : null}
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function HeroGoogleButton({ inverted = false }: { inverted?: boolean }) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      persistBrowserTimezoneCookie()
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      toast.error(AUTH_ERROR_MESSAGES.default)
      setIsGoogleLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn(landingCtaGoogle, 'w-full sm:w-auto', inverted && landingCtaGoogleInverted)}
      onClick={handleGoogleSignIn}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
      {HERO.googleCta}
    </Button>
  )
}
