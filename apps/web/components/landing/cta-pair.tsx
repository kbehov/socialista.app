'use client'

import { AUTH_ERROR_MESSAGES, GoogleIcon } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { persistBrowserTimezoneCookie } from '@/utils/timezone'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { HERO } from './content'
import { landingCtaPrimary } from './landing-classes'

type CtaPairProps = {
  primaryHref?: string
  className?: string
  inverted?: boolean
}

export function CtaPair({ primaryHref = '/auth/signup', className, inverted = false }: CtaPairProps) {
  return (
    <div className={className}>
      <HeroGoogleButton inverted={inverted} />
      <Button
        asChild
        size="lg"
        variant={inverted ? 'secondary' : 'default'}
        className={cn(
          landingCtaPrimary,
          'h-12 w-full px-7 text-[0.9375rem] sm:w-auto',
          inverted &&
            'bg-[color-mix(in_srgb,var(--landing-canvas)_96%,white)] text-[var(--landing-charcoal)] hover:bg-[color-mix(in_srgb,var(--landing-canvas)_88%,white)]',
        )}
      >
        <Link href={primaryHref}>{HERO.primaryCta}</Link>
      </Button>
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
    <RainbowButton
      type="button"
      variant="outline"
      size="lg"
      className={cn(
        'h-12 w-full rounded-full px-7 text-[0.9375rem] transition-[transform,background-color,color,border-color,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] sm:w-auto',
        inverted && 'border-[color-mix(in_srgb,var(--landing-canvas)_35%,transparent)] bg-[color-mix(in_srgb,var(--landing-canvas)_12%,transparent)] text-[color-mix(in_srgb,var(--landing-canvas)_96%,white)] hover:bg-[color-mix(in_srgb,var(--landing-canvas)_18%,transparent)]',
      )}
      onClick={handleGoogleSignIn}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
      {HERO.googleCta}
    </RainbowButton>
  )
}
