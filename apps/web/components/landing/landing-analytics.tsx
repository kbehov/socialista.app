import { ANALYTICS } from './content'
import { FadeIn } from './fade-in'
import { landingBodySm, landingContentGap, landingH3 } from './landing-classes'
import { LandingAnalyticsBoard } from './landing-analytics-board'
import { Section } from './section'
import { SectionHeader } from './section-header'

export function LandingAnalytics() {
  return (
    <Section id="analytics" border>
      <FadeIn>
        <SectionHeader
          titleId="analytics-heading"
          title={ANALYTICS.title}
          description={ANALYTICS.description}
          eyebrow={ANALYTICS.eyebrow}
        />
      </FadeIn>

      <ul className={`${landingContentGap} grid list-none gap-8 p-0 sm:grid-cols-3 sm:gap-8`}>
        {ANALYTICS.items.map((item, index) => (
          <li key={item.title}>
            <FadeIn delay={index * 0.04}>
              <article className="flex flex-col gap-2">
                <h3 className={landingH3}>{item.title}</h3>
                <p className={landingBodySm}>{item.description}</p>
              </article>
            </FadeIn>
          </li>
        ))}
      </ul>

      <FadeIn delay={0.08} className="mt-10 sm:mt-12">
        <figure>
          <LandingAnalyticsBoard />
          <figcaption className="sr-only">
            Live workspace analytics with reach, engagement, views, and top creatives tied to the posts that produced
            them.
          </figcaption>
        </figure>
      </FadeIn>
    </Section>
  )
}
