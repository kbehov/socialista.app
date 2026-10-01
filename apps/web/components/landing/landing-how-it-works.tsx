import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'
import Image from 'next/image'

import { HOW_IT_WORKS, LANDING_CHANNELS, type HowItWorksStepId } from './content'
import { FadeIn } from './fade-in'
import {
  landingContentGap,
  landingFeatureCaptionBody,
  landingFeatureCaptionTitle,
  landingGlass,
  landingMediaPanel,
} from './landing-classes'
import { HERO_MARQUEE_POSTERS, INFLUENCER_SWIPE_IMAGES, STATIC_AD_MARQUEE_IMAGES } from './media'
import { Section } from './section'
import { SectionCta } from './section-cta'
import { LandingSectionIntro } from './section-header'

const STEP_MEDIA: Record<HowItWorksStepId, { src: string; objectPosition: string; chip: string }> = {
  creator: { src: INFLUENCER_SWIPE_IMAGES[0], objectPosition: '50% 18%', chip: 'Maya · Wellness UGC' },
  product: { src: STATIC_AD_MARQUEE_IMAGES[1], objectPosition: '50% 45%', chip: 'Product in hand' },
  publish: { src: HERO_MARQUEE_POSTERS[2], objectPosition: '50% 20%', chip: 'Ready to post' },
}

export function LandingHowItWorks() {
  return (
    <Section id="how-it-works" landingDivider alt>
      <FadeIn>
        <LandingSectionIntro
          titleId="how-it-works-heading"
          eyebrow={HOW_IT_WORKS.eyebrow}
          title={HOW_IT_WORKS.title}
          titleAccent={HOW_IT_WORKS.titleAccent}
          description={HOW_IT_WORKS.description}
        />
      </FadeIn>

      <ol className={cn(landingContentGap, 'grid list-none gap-10 p-0 sm:grid-cols-3 sm:gap-5 lg:gap-8')}>
        {HOW_IT_WORKS.steps.map((step, index) => (
          <li key={step.id}>
            <FadeIn delay={0.04 + index * 0.05} className="flex flex-col gap-5">
              <StepMedia id={step.id} step={step.step} />
              <div className="px-0.5">
                <h3 className={landingFeatureCaptionTitle}>{step.title}</h3>
                <p className={landingFeatureCaptionBody}>{step.description}</p>
              </div>
            </FadeIn>
          </li>
        ))}
      </ol>

      <FadeIn className={landingContentGap}>
        <SectionCta label={HOW_IT_WORKS.cta} note="Free to start · No credit card" />
      </FadeIn>
    </Section>
  )
}

function StepMedia({ id, step }: { id: HowItWorksStepId; step: string }) {
  const media = STEP_MEDIA[id]

  return (
    <div className={cn(landingMediaPanel, 'aspect-[4/5] sm:aspect-[3/4]')} aria-hidden="true">
      <Image
        src={media.src}
        alt=""
        fill
        quality={80}
        sizes="(max-width: 640px) 100vw, 33vw"
        className="object-cover"
        style={{ objectPosition: media.objectPosition }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/10" />
      <span
        className={cn(
          landingGlass,
          'absolute left-4 top-4 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tabular-nums tracking-[0.08em] text-white',
        )}
      >
        {step}
      </span>
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
        <span className={cn(landingGlass, 'truncate rounded-xl px-3 py-2 text-[0.8125rem] font-medium text-white')}>
          {media.chip}
        </span>
        {id === 'publish' ? (
          <span className={cn(landingGlass, 'flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-white')}>
            {LANDING_CHANNELS.slice(0, 4).map(channel => (
              <SocialPlatformIcon key={channel.id} provider={channel.id} framed={false} size={13} />
            ))}
          </span>
        ) : null}
      </div>
    </div>
  )
}
