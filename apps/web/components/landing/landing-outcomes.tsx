import { OUTCOMES } from './content'
import { FadeIn } from './fade-in'
import { Section } from './section'
import { SectionHeader } from './section-header'

export function LandingOutcomes() {
  return (
    <Section id="outcomes" border alt>
      <FadeIn>
        <SectionHeader
          eyebrow={OUTCOMES.eyebrow}
          title={OUTCOMES.title}
          description={OUTCOMES.description}
          align="center"
        />
      </FadeIn>

      <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[1.15rem]">
        {OUTCOMES.stats.map((stat, index) => (
          <FadeIn key={stat.label} delay={index * 0.05}>
            <div className="flex h-full flex-col rounded-[calc(var(--radius)+8px)] border border-border bg-background p-6 px-[1.4rem]">
              <div className="flex items-baseline gap-[0.15rem]">
                <span className="text-[clamp(2.25rem,4vw,2.75rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                  {stat.value}
                </span>
                {stat.unit ? (
                  <span className="text-lg font-medium tracking-[-0.02em] text-muted-foreground">{stat.unit}</span>
                ) : null}
              </div>
              <p className="mt-[0.65rem] text-[0.9375rem] font-semibold tracking-[-0.02em]">{stat.label}</p>
              <p className="mt-2 text-[0.8125rem] leading-[1.6] text-muted-foreground">{stat.description}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}
