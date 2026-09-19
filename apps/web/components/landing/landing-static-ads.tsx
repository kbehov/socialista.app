import { ImagePlus, LayoutTemplate, Sparkles, type LucideIcon } from 'lucide-react'

import { STATIC_ADS, type StaticAdsStepId } from './content'
import { FadeIn } from './fade-in'
import { landingContentGap } from './landing-classes'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'
import { StaticAdsMarquee } from './static-ads-marquee'

const glassCard =
  'border border-white/16 bg-black/36 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_18px_40px_-24px_rgba(0,0,0,0.55)] backdrop-blur-2xl'

const STEP_ICONS: Record<StaticAdsStepId, LucideIcon> = {
  product: ImagePlus,
  template: LayoutTemplate,
  create: Sparkles,
}

export function LandingStaticAds() {
  return (
    <Section id="static-ads" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="static-ads-heading"
          title={STATIC_ADS.title}
          titleAccent={STATIC_ADS.titleAccent}
          description={STATIC_ADS.description}
        />
      </FadeIn>

      <FadeIn delay={0.08} className={landingContentGap}>
        <div className="relative overflow-hidden rounded-[var(--landing-panel-radius)] bg-[#0c0c0c] shadow-[0_28px_64px_-36px_rgba(0,0,0,0.45)] outline outline-1 outline-[oklch(0_0_0/0.1)] sm:rounded-[2.5rem] lg:rounded-[2.75rem]">
          <div className="relative flex min-h-[22rem] flex-col sm:min-h-[28rem] lg:min-h-[32.5rem]">
            <StaticAdsMarquee />

            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_12%,rgba(0,0,0,0.12)_52%,rgba(0,0,0,0.42)_100%)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20"
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

            <div className="relative h-[10.5rem] shrink-0 sm:h-[13.5rem] lg:h-[15.5rem]" aria-hidden="true" />

            <div className="relative z-10 p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0">
              <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
                {STATIC_ADS.items.map(item => (
                  <StepCard
                    key={item.id}
                    step={item.step}
                    title={item.title}
                    description={item.description}
                    icon={STEP_ICONS[item.id]}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
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
    <article className={`flex h-full flex-col rounded-[1.25rem] p-4 sm:p-5 ${glassCard}`}>
      <div className="flex items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-[0.75rem] border border-white/14 bg-white/10 text-white"
          aria-hidden="true"
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <span className="text-[0.6875rem] font-medium tracking-[0.12em] text-white/55">{step}</span>
      </div>
      <h3 className="mt-4 font-serif text-[1.25rem] italic leading-snug tracking-[-0.02em] text-white sm:text-[1.375rem]">
        {title}
      </h3>
      <p className="mt-1.5 text-[0.8125rem] leading-5 text-white/72 sm:text-[0.875rem] sm:leading-6">
        {description}
      </p>
    </article>
  )
}
