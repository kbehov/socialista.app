import { SLIDESHOWS } from './content'
import { FadeIn } from './fade-in'
import {
  landingContentGap,
  landingSectionDark,
} from './landing-classes'
import { cn } from '@/lib/utils'
import { Section } from './section'
import { SectionCta } from './section-cta'
import { LandingSectionIntro } from './section-header'
import { SlideshowShowcase } from './slideshow-floating-cards'

export function LandingSlideshows() {
  return (
    <Section
      id="slideshows"
      landingDivider
      className={cn(landingSectionDark, 'overflow-visible')}
    >
      <FadeIn className="overflow-visible">
        <LandingSectionIntro
          titleId="slideshows-heading"
          eyebrow={SLIDESHOWS.eyebrow}
          title={SLIDESHOWS.title}
          titleAccent={SLIDESHOWS.titleAccent}
          description={SLIDESHOWS.description}
          tone="dark"
          className="max-w-2xl"
        />

        <div className={cn(landingContentGap, 'overflow-visible')}>
          <SlideshowShowcase compact />
        </div>

        <p className="mt-5 text-center text-xs text-white/40">{SLIDESHOWS.caption}</p>

        <SectionCta label={SLIDESHOWS.cta} tone="dark" className={landingContentGap} />
      </FadeIn>
    </Section>
  )
}
