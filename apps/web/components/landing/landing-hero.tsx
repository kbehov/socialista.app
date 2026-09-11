'use client'

import { AUTH_ERROR_MESSAGES, GoogleIcon } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { persistBrowserTimezoneCookie } from '@/utils/timezone'
import { Check, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { HERO, HERO_PROOF_POINTS } from './content'
import { FadeIn, Stagger, StaggerItem } from './fade-in'
import { HeroAudience } from './hero-audience'
import { HeroCarousel } from './hero-carousel'
import styles from './landing.module.css'
import { SectionInner } from './section'

export function LandingHero() {
  return (
    <section className={`${styles.heroStage} pt-10 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-20`}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroGridBg} aria-hidden="true" />

      <SectionInner className={styles.heroInner}>
        <div className={styles.heroLayout}>
          <Stagger className={styles.heroCopy} delay={0.02} immediate>
            <StaggerItem>
              <h1 className={styles.heroTitle}>
                {HERO.titleLine1}
                <br />
                {HERO.titleLine2}
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className={styles.heroDescription}>{HERO.description}</p>
            </StaggerItem>

            <StaggerItem>
              <div className={styles.heroCtas}>
                <HeroGoogleButton />
                <Button asChild size="lg" className={`${styles.heroPrimaryCta} h-11 rounded-full px-6`}>
                  <Link href="/auth/signup">{HERO.primaryCta}</Link>
                </Button>
              </div>
            </StaggerItem>

            <StaggerItem>
              <ul className={styles.proofList}>
                {HERO_PROOF_POINTS.map(point => (
                  <li key={point} className={styles.proofItem}>
                    <span className={styles.proofCheck} aria-hidden="true">
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </StaggerItem>

            <StaggerItem>
              <HeroAudience />
            </StaggerItem>
          </Stagger>

          <FadeIn delay={0.16} immediate className={styles.heroVisual}>
            <HeroCarousel />
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
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={`h-11 rounded-full px-5 ${styles.heroGoogleCta}`}
      onClick={handleGoogleSignIn}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
      {HERO.googleCta}
    </Button>
  )
}
