import { ImagePlus, LayoutTemplate, Sparkles, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { STATIC_ADS, type StaticAdsStepId } from './content'
import { FadeIn } from './fade-in'
import { landingContentGap, landingMediaPanel } from './landing-classes'
import { Section } from './section'
import { SectionCta } from './section-cta'
import { LandingSectionIntro } from './section-header'
import { StaticAdsMarquee } from './static-ads-marquee'
import { getLandingStaticAdMarqueeImages } from './landing-static-ad-marquee-data'

const glassCard =
  'border border-white/12 bg-black/24 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_10px_24px_-18px_rgba(0,0,0,0.45)] backdrop-blur-lg'

const STEP_ICONS: Record<StaticAdsStepId, LucideIcon> = {
  product: ImagePlus,
  template: LayoutTemplate,
  create: Sparkles,
}

export async function LandingStaticAds() {
  const marqueeImages = await getLandingStaticAdMarqueeImages()

  return (
    <Section id="static-ads" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="static-ads-heading"
          eyebrow={STATIC_ADS.eyebrow}
          title={STATIC_ADS.title}
          titleAccent={STATIC_ADS.titleAccent}
          description={STATIC_ADS.description}
        />
      </FadeIn>

      <FadeIn delay={0.08} className={landingContentGap}>
        <div
          className={cn(
            landingMediaPanel,
            'rounded-[var(--landing-panel-radius)] shadow-[0_28px_64px_-36px_rgba(0,0,0,0.45)]',
          )}
        >
          <div className="relative flex min-h-[21rem] flex-col sm:min-h-[27rem] lg:min-h-[31rem]">
            <StaticAdsMarquee imageUrls={marqueeImages} />

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0c0c0c] to-transparent sm:w-16"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0c0c0c] to-transparent sm:w-16"
              aria-hidden="true"
            />

            <div className="relative h-[9rem] shrink-0 sm:h-[15.5rem] lg:h-[18rem]" aria-hidden="true" />

            <div className="relative z-10 p-3 pt-0 sm:p-4 sm:pt-0 lg:p-5 lg:pt-0">
              <ol className="grid list-none gap-2 p-0 sm:gap-2.5 lg:grid-cols-3">
                {STATIC_ADS.items.map(item => (
                  <li key={item.id}>
                    <StepCard
                      step={item.step}
                      title={item.title}
                      description={item.description}
                      icon={STEP_ICONS[item.id]}
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn className={landingContentGap}>
        <SectionCta label={STATIC_ADS.cta} />
      </FadeIn>
    </Section>
  )
}

function StepCard({
  step,
  title,
  description,
  icon: Icon,
}: {
  step: string
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <article className={cn('flex gap-2.5 rounded-xl p-3 sm:gap-3 sm:p-3.5', glassCard)}>
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/8 text-white sm:size-8"
        aria-hidden="true"
      >
        <Icon className="size-3.5 sm:size-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="text-[0.8125rem] font-semibold leading-snug tracking-[-0.02em] text-white sm:text-sm">
            {title}
          </h3>
          <span className="text-[0.625rem] font-medium tracking-[0.1em] text-white/45">{step}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[0.6875rem] leading-snug text-white/62 sm:text-xs sm:leading-5">
          {description}
        </p>
      </div>
    </article>
  )
}
