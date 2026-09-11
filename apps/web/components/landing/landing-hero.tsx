'use client'

import { AUTH_ERROR_MESSAGES, GoogleIcon } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { persistBrowserTimezoneCookie } from '@/utils/timezone'
import { Loader2, Sparkles } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { HERO } from './content'
import { FadeIn, Stagger, StaggerItem } from './fade-in'
import { HeroAudience } from './hero-audience'
import { HeroCarousel } from './hero-carousel'
import { HeroHeading } from './hero-heading'
import { HeroProofPoints } from './hero-proof-points'
import { SectionInner } from './section'

export function LandingHero() {
  return (
    <section className="relative overflow-x-clip pt-10 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-[-3rem] left-1/2 h-[min(32rem,68vh)] w-full max-w-[52rem] -translate-x-1/2 bg-[radial-gradient(ellipse_72%_60%_at_50%_38%,color-mix(in_oklch,var(--foreground)_6%,transparent),transparent_72%)] blur-[40px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklch,var(--foreground)_6%,transparent)_1px,transparent_0)] bg-size-[28px_28px] mask-[radial-gradient(ellipse_80%_70%_at_50%_0%,black_20%,transparent_75%)] opacity-45"
        aria-hidden="true"
      />

      <SectionInner className="max-w-7xl">
        <div className="relative z-1 grid justify-items-center gap-7 sm:gap-9">
          <Stagger className="mx-auto max-w-[44rem] text-center" delay={0.02} immediate>
            <StaggerItem>
              <HeroHeading />
            </StaggerItem>

            <StaggerItem>
              <p className="mx-auto mt-5 max-w-[36rem] text-pretty text-[0.8125rem] leading-[1.65] text-muted-foreground sm:mt-6 sm:text-[0.9375rem]">
                {HERO.description}
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <HeroGoogleButton />
                <Button
                  asChild
                  size="lg"
                  className="h-11 min-w-[10.5rem] gap-2 rounded-full px-6 text-sm font-semibold shadow-[0_10px_28px_-12px_color-mix(in_oklch,var(--primary)_40%,transparent)] hover:shadow-[0_14px_32px_-10px_color-mix(in_oklch,var(--primary)_50%,transparent)]"
                >
                  <Link href="/auth/signup">
                    <Sparkles className="size-4 shrink-0" strokeWidth={1.5} />
                    {HERO.primaryCta}
                  </Link>
                </Button>
              </div>
            </StaggerItem>

            <StaggerItem>
              <HeroAudience />
            </StaggerItem>
          </Stagger>

          <FadeIn delay={0.16} immediate className="w-full min-w-0">
            <HeroCarousel />
            <HeroProofPoints />
          </FadeIn>
        </div>
      </SectionInner>
    </section>
  )
}

function HeroGoogleButton() {
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
      className="rounded-full px-5 font-semibold"
      onClick={handleGoogleSignIn}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
      {HERO.googleCta}
    </RainbowButton>
  )
}
