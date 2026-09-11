import { ArrowRight } from 'lucide-react'

import { PAIN_POINTS } from './content'
import { FadeIn } from './fade-in'
import { Section } from './section'
import { SectionHeader } from './section-header'

export function LandingPainPoints() {
  return (
    <Section border className="bg-[color-mix(in_oklch,var(--surface-0)_40%,var(--background))]">
      <FadeIn>
        <SectionHeader
          eyebrow={PAIN_POINTS.eyebrow}
          title={PAIN_POINTS.title}
          description={PAIN_POINTS.description}
          align="center"
        />
      </FadeIn>

      <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-[1.15rem] lg:grid-cols-4">
        {PAIN_POINTS.items.map((item, index) => (
          <FadeIn key={item.pain} delay={index * 0.05}>
            <article className="flex h-full flex-col rounded-[calc(var(--radius)+8px)] border border-border bg-background p-[1.35rem_1.4rem] transition-[border-color,box-shadow] duration-[180ms] ease-out hover:border-[color-mix(in_oklch,var(--foreground)_14%,var(--border))] hover:shadow-[0_20px_44px_-28px_color-mix(in_oklch,var(--foreground)_18%,transparent)]">
              <p className="text-[0.625rem] font-medium tracking-[0.08em] uppercase text-[color-mix(in_oklch,var(--muted-foreground)_85%,transparent)]">
                Before
              </p>
              <p className="mt-2 text-[0.9375rem] font-medium leading-normal tracking-[-0.015em] text-[color-mix(in_oklch,var(--foreground)_75%,var(--muted-foreground))]">
                {item.pain}
              </p>
              <div
                className="my-4 flex items-center py-1 before:h-px before:flex-1 before:bg-border before:content-[''] after:h-px after:flex-1 after:bg-border after:content-['']"
                aria-hidden="true"
              >
                <ArrowRight className="mx-2.5 size-3.5 shrink-0 text-muted-foreground" />
              </div>
              <p className="text-[0.625rem] font-medium tracking-[0.08em] uppercase text-success">With Socialista</p>
              <p className="mt-2 text-sm leading-[1.6] text-foreground">{item.solution}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}
