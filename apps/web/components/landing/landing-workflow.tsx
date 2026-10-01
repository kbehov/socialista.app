import { SHIP_IT_SECTION } from './content'
import { FadeIn } from './fade-in'
import { landingContentGap } from './landing-classes'
import { ShipItTabs } from './landing-ship-it-tabs'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'

/** Publish → schedule → analyze, merged into one tabbed story. */
export function LandingShipIt() {
  return (
    <Section id="publish" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="publish-heading"
          eyebrow={SHIP_IT_SECTION.eyebrow}
          title={SHIP_IT_SECTION.title}
          titleAccent={SHIP_IT_SECTION.titleAccent}
          description={SHIP_IT_SECTION.description}
        />
      </FadeIn>

      <FadeIn delay={0.06} className={landingContentGap}>
        <ShipItTabs />
      </FadeIn>
    </Section>
  )
}
