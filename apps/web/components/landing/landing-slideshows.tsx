import { Button } from '@/components/ui/button'
import Link from 'next/link'

import { SLIDESHOWS } from './content'
import { FadeIn } from './fade-in'
import { landingContentGap, landingCtaPrimary } from './landing-classes'
import { cn } from '@/lib/utils'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'
import { SlideshowShowcase } from './slideshow-floating-cards'

export function LandingSlideshows() {
  return (
    <Section id="slideshows" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="slideshows-heading"
          eyebrow={SLIDESHOWS.eyebrow}
          eyebrowTone="accent"
          title={SLIDESHOWS.title}
          titleAccent={SLIDESHOWS.titleAccent}
          description={SLIDESHOWS.description}
        />

        <div className={cn(landingContentGap)}>
          <SlideshowShowcase />
        </div>

        <div className={cn(landingContentGap, 'flex justify-center')}>
          <Button asChild size="lg" className={cn(landingCtaPrimary, 'h-11 px-7')}>
            <Link href="/auth/signup">{SLIDESHOWS.cta}</Link>
          </Button>
        </div>
      </FadeIn>
    </Section>
  )
}
