'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

import { HERO, HERO_PROOF_POINTS } from './content'
import { FadeIn, Stagger, StaggerItem } from './fade-in'
import styles from './landing.module.css'
import { IMG, VIDEO } from './media'
import { MediaFrame } from './media-frame'
import { SectionInner } from './section'

const HERO_CARDS = [
  { key: 'a', src: IMG.p1, video: VIDEO.tea, className: `${styles.heroCardTall} ${styles.heroCardA}`, priority: true },
  { key: 'b', src: IMG.p5, className: `${styles.heroCardWide} ${styles.heroCardB}`, priority: true },
  { key: 'c', src: IMG.p3, video: VIDEO.beach, className: `${styles.heroCardTall} ${styles.heroCardC}`, priority: true },
  { key: 'd', src: IMG.fashion1, className: `${styles.heroCardSquare} ${styles.heroCardD}` },
  { key: 'e', src: IMG.p7, className: `${styles.heroCardTall} ${styles.heroCardE}` },
  { key: 'f', src: IMG.p8, video: VIDEO.hoop, className: `${styles.heroCardWide} ${styles.heroCardF}` },
] as const

export function LandingHero() {
  return (
    <section className={`${styles.heroStage} pt-14 pb-10 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16`}>
      <div className={styles.heroGlow} aria-hidden="true" />

      <SectionInner>
        <Stagger className="relative z-10 mx-auto max-w-3xl text-center" delay={0.02} immediate>
          <StaggerItem>
            <p className={styles.eyebrowPill}>
              <span className={styles.eyebrowDot} />
              {HERO.eyebrow}
            </p>
          </StaggerItem>

          <StaggerItem>
            <h1 className={`${styles.heroTitle} mt-6`}>
              {HERO.titleBefore} <span className={styles.heroAccent}>{HERO.titleAccent}</span>
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mx-auto mt-5 max-w-xl text-[0.9375rem] leading-7 text-pretty text-muted-foreground sm:text-base sm:leading-8">
              {HERO.description}
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
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

        <FadeIn delay={0.22} immediate>
          <div className={styles.heroCollage} aria-hidden="true">
            {HERO_CARDS.map(card => (
              <MediaFrame
                key={card.key}
                src={card.src}
                video={'video' in card ? card.video : undefined}
                className={`${styles.mediaCard} ${card.className}`}
                sizes="(max-width: 768px) 50vw, 240px"
                priority={'priority' in card && card.priority}
              />
            ))}
          </div>
        </FadeIn>
      </SectionInner>
    </section>
  )
}
