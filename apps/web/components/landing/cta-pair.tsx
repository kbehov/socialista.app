'use client'

import { AUTH_ERROR_MESSAGES, GoogleIcon } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { WordRotate } from '@/components/ui/word-rotate'
import { persistBrowserTimezoneCookie } from '@/utils/timezone'
import { ImageIcon, ImagesIcon, Loader2, Video } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { HERO } from './content'
import { landingCtaPrimary } from './landing-classes'

const PRIMARY_CTA_ICONS = [Video, ImageIcon, ImagesIcon] as const

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
            'bg-background text-foreground hover:bg-background/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90',
        )}
      >
        <Link href={primaryHref} className="min-w-0 justify-center px-7 sm:min-w-54">
          <WordRotate
            words={[...HERO.primaryCtaWords]}
            icons={[...PRIMARY_CTA_ICONS]}
            duration={2800}
            wrapperClassName="flex w-full justify-center py-0.5"
            className="text-[0.9375rem] font-medium"
            motionProps={{
              initial: { opacity: 0, y: 6 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -6 },
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
          />
        </Link>
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
        'h-12 w-full rounded-full px-7 text-[0.9375rem] sm:w-auto',
        inverted && 'border-background/30 bg-background/10 text-background hover:bg-background/15',
      )}
      onClick={handleGoogleSignIn}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
      {HERO.googleCta}
    </RainbowButton>
  )
}
