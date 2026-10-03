import { cn } from '@/lib/utils'
import Image from 'next/image'

import { CtaPair } from './cta-pair'
import { FINAL_CTA } from './content'
import { FadeIn } from './fade-in'
import { landingFinalCtaGlow, landingSectionDark } from './landing-classes'
import { HERO_MARQUEE_POSTERS } from './media'
import { SectionInner } from './section'
import { LandingSectionIntro } from './section-header'

const FINAL_CTA_POSTERS = [
  { src: HERO_MARQUEE_POSTERS[0], rotate: '-6deg' },
  { src: HERO_MARQUEE_POSTERS[3], rotate: '0deg' },
  { src: HERO_MARQUEE_POSTERS[5], rotate: '6deg' },
] as const

export function LandingFinalCta() {
  return (
    <section
      id="get-started"
      aria-labelledby="get-started-heading"
      className={cn('relative overflow-hidden', landingSectionDark, 'landing-section-divider')}
    >
      <div className={cn('pointer-events-none absolute inset-0', landingFinalCtaGlow)} aria-hidden="true" />
      <SectionInner className="relative py-24 sm:py-28 lg:py-32">
        <FadeIn className="mx-auto max-w-xl text-center">
          <div className="mb-10 flex items-end justify-center -space-x-4" aria-hidden="true">
            {FINAL_CTA_POSTERS.map((poster, index) => (
              <div
                key={poster.src}
                className={cn(
                  'relative aspect-9/16 w-[4.5rem] overflow-hidden rounded-[var(--landing-inset-radius)] bg-[var(--landing-media-raised)] shadow-[0_18px_40px_-18px_rgb(0_0_0/0.8),0_0_0_1px_oklch(1_0_0/0.1)] sm:w-[5.25rem]',
                  index === 1 && 'z-10 w-[5.25rem] sm:w-[6.25rem]',
                )}
                style={{ rotate: poster.rotate }}
              >
                <Image src={poster.src} alt="" fill quality={75} sizes="100px" className="object-cover" />
              </div>
            ))}
          </div>
          <LandingSectionIntro
            titleId="get-started-heading"
            title={FINAL_CTA.title}
            titleAccent={FINAL_CTA.titleAccent}
            description={FINAL_CTA.description}
            tone="dark"
          />
          <CtaPair inverted className="mt-8 sm:mt-10" />
        </FadeIn>
      </SectionInner>
    </section>
  )
}
