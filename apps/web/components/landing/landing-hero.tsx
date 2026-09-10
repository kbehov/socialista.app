'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

import { HERO, HERO_PROOF_POINTS } from './content'
import { FadeIn, Stagger, StaggerItem } from './fade-in'
import { HeroVisual } from './hero-visual'
import styles from './landing.module.css'
import { SectionInner } from './section'

export function LandingHero() {
  return (
    <section className={`${styles.heroSection} pt-16 pb-12 sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-20`}>
      <div className={styles.heroGlow} aria-hidden="true" />

      <SectionInner>
        <Stagger className="mx-auto max-w-3xl text-center" delay={0.02} immediate>
          <StaggerItem>
            <p className={styles.eyebrow}>{HERO.eyebrow}</p>
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
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-11 px-6">
                <Link href="/auth/signup">Get started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-6">
                <Link href="/auth/signin">Sign in</Link>
              </Button>
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

        <HeroVisual />
      </SectionInner>
    </section>
  )
}
