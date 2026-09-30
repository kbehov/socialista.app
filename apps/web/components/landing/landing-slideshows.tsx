import { Button } from '@/components/ui/button'
import Link from 'next/link'

import { SLIDESHOWS } from './content'
import { FadeIn } from './fade-in'
import {
  landingCtaPrimaryInverted,
  LANDING_STORY_INDEX,
  landingSectionDark,
} from './landing-classes'
import { cn } from '@/lib/utils'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'
import { SlideshowShowcase } from './slideshow-floating-cards'

export function LandingSlideshows() {
  return (
    <Section
      id="slideshows"
      landingDivider
      className={cn(landingSectionDark, 'overflow-visible py-12 sm:py-14 lg:py-16')}
    >
      <FadeIn className="overflow-visible">
        <LandingSectionIntro
          titleId="slideshows-heading"
          storyIndex={LANDING_STORY_INDEX.slideshows}
          eyebrow={SLIDESHOWS.eyebrow}
          eyebrowTone="accent"
          title={SLIDESHOWS.title}
          titleAccent={SLIDESHOWS.titleAccent}
          description={SLIDESHOWS.description}
          tone="dark"
          className="max-w-2xl"
        />

        <div className="mt-6 overflow-visible sm:mt-7">
          <SlideshowShowcase compact />
        </div>

        <div className="mt-6 flex justify-center sm:mt-7">
          <Button asChild size="lg" className={cn(landingCtaPrimaryInverted, 'h-10 px-6 text-sm sm:h-11 sm:px-7')}>
            <Link href="/auth/signup">{SLIDESHOWS.cta}</Link>
          </Button>
        </div>
      </FadeIn>
    </Section>
  )
}
