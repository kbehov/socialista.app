'use client'

import { AUTH_ERROR_MESSAGES, GoogleIcon } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { persistBrowserTimezoneCookie } from '@/utils/timezone'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { HERO } from './content'
import {
  landingCtaGoogle,
  landingCtaGoogleInverted,
  landingCtaPrimaryInverted,
  landingCtaPrimaryLg,
} from './landing-classes'

type CtaPairProps = {
  primaryHref?: string
  className?: string
  inverted?: boolean
}

export function CtaPair({ primaryHref = '/auth/signup', className, inverted = false }: CtaPairProps) {
  return (
    <div className={className}>
      <Button
        asChild
        size="lg"
        variant={inverted ? 'secondary' : 'default'}
        className={cn(
          landingCtaPrimaryLg,
          'w-full sm:w-auto',
          inverted && landingCtaPrimaryInverted,
        )}
      >
        <Link href={primaryHref}>{HERO.primaryCta}</Link>
      </Button>
      <HeroGoogleButton inverted={inverted} />
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
      className={cn(
        landingCtaGoogle,
        'w-full sm:w-auto',
        inverted && landingCtaGoogleInverted,
      )}
      onClick={handleGoogleSignIn}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
      {HERO.googleCta}
    </Button>
  )
}
