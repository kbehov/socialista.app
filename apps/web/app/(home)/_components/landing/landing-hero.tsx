'use client'

import { HERO, HERO_PROOF_POINTS } from '@/app/(home)/_components/landing/content'
import { FadeIn, Stagger, StaggerItem } from '@/app/(home)/_components/landing/fade-in'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { MockupImages } from '@/app/(home)/_components/landing/showcase-mockups/mockup-images'
import { WaitlistForm, WaitlistFormAnchor } from '@/app/(home)/_components/landing/waitlist-form'
import { Check } from 'lucide-react'
import { Suspense } from 'react'

function WaitlistFormFallback() {
  return <div className="h-11 animate-pulse rounded-lg border border-border bg-muted/40" aria-hidden="true" />
}

export function LandingHero() {
  return (
    <section className={`${styles.heroSection} pt-16 pb-12 sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-20`}>
      <div className={styles.heroGlow} aria-hidden="true" />

      <div className={styles.section}>
        <Stagger className="mx-auto max-w-3xl text-center" delay={0.02} immediate>
          <StaggerItem>
            <p className={styles.eyebrowPill}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              {HERO.eyebrow}
            </p>
          </StaggerItem>

          <StaggerItem>
            <h1 className="mt-6 text-[2.125rem] font-semibold tracking-[-0.03em] text-balance sm:text-5xl sm:leading-[1.06] lg:text-[3.5rem] lg:leading-[1.04]">
              {HERO.title}
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mx-auto mt-5 max-w-xl text-[0.9375rem] leading-7 text-pretty text-muted-foreground sm:text-base sm:leading-8">
              {HERO.description}
            </p>
          </StaggerItem>

          <StaggerItem>
            <WaitlistFormAnchor />
            <div className={`${styles.waitlistCard} mx-auto mt-10 max-w-md`}>
              <Suspense fallback={<WaitlistFormFallback />}>
                <WaitlistForm autoFocus inset />
              </Suspense>
            </div>
          </StaggerItem>

          <StaggerItem>
            <ul className={`${styles.proofList} mt-6`}>
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
        </Stagger>

        <FadeIn delay={0.28} immediate className={`${styles.mockupHeroWrap} mt-14 sm:mt-20`}>
          <div className={styles.mockupHero}>
            <MockupImages />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
