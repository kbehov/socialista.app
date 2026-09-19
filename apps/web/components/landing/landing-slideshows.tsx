import { ShimmerButton } from '@/components/ui/shimmer-button'

import { SLIDESHOWS } from './content'
import { FadeIn } from './fade-in'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'
import { SlideshowShowcase } from './slideshow-floating-cards'

export function LandingSlideshows() {
  return (
    <Section
      id="slideshows"
      landingDivider
      className="!py-14 sm:!py-16 lg:!py-20"
    >
      <FadeIn>
        <LandingSectionIntro
          titleId="slideshows-heading"
          eyebrow={SLIDESHOWS.eyebrow}
          eyebrowTone="accent"
          title={SLIDESHOWS.title}
          titleAccent={SLIDESHOWS.titleAccent}
          description={SLIDESHOWS.description}
        />

        <div className="mt-8 sm:mt-9">
          <SlideshowShowcase />
        </div>

        <div className="mt-6 flex justify-center sm:mt-7">
          <ShimmerButton href="/auth/signup" className="h-11 px-7 text-sm font-medium">
            {SLIDESHOWS.cta}
          </ShimmerButton>
        </div>
      </FadeIn>
    </Section>
  )
}
