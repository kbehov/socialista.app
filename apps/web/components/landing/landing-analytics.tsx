import { LayoutDashboard, Share2, Sparkles, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { ANALYTICS, type AnalyticsFeatureId } from './content'
import { FadeIn } from './fade-in'
import {
  landingBodySm,
  landingCard,
  landingCardHover,
  landingAnalyticsGlow,
  landingContentGap,
  landingH3,
} from './landing-classes'
import { LandingAnalyticsBoard } from './landing-analytics-board'
import { Section } from './section'
import { SectionHeader } from './section-header'

const FEATURE_ICONS: Record<AnalyticsFeatureId, LucideIcon> = {
  workspace: LayoutDashboard,
  channels: Share2,
  iteration: Sparkles,
}

function AnalyticsFeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-[calc(var(--radius)+2px)] border border-border bg-surface-0 text-foreground"
      aria-hidden="true"
    >
      <Icon className="size-[1.125rem]" strokeWidth={1.75} />
    </span>
  )
}

export function LandingAnalytics() {
  return (
    <Section id="analytics" border>
      <FadeIn>
        <SectionHeader
          titleId="analytics-heading"
          title={ANALYTICS.title}
          description={ANALYTICS.description}
          align="center"
        />
      </FadeIn>

      <FadeIn delay={0.06} className={landingContentGap}>
        <div className="relative">
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute -inset-x-4 top-[8%] bottom-[6%] rounded-[2rem] sm:-inset-x-8',
              landingAnalyticsGlow,
            )}
          />
          <figure className="relative">
            <LandingAnalyticsBoard />
            <figcaption className="sr-only">
              Live workspace analytics with reach, engagement, views, and top creatives tied to the posts that produced
              them.
            </figcaption>
          </figure>
        </div>
      </FadeIn>

      <ul className={`${landingContentGap} grid list-none gap-3 p-0 sm:grid-cols-3 sm:gap-4`}>
        {ANALYTICS.items.map((item, index) => {
          const Icon = FEATURE_ICONS[item.id]

          return (
            <li key={item.id}>
              <FadeIn delay={0.1 + index * 0.04}>
                <article
                  className={`${landingCard} ${landingCardHover} flex h-full flex-col gap-4 p-5 sm:p-6`}
                >
                  <AnalyticsFeatureIcon icon={Icon} />
                  <div className="flex flex-col gap-2.5">
                    <h3 className={landingH3}>{item.title}</h3>
                    <p className={landingBodySm}>{item.description}</p>
                  </div>
                </article>
              </FadeIn>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
