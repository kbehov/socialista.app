import { WORKFLOW } from './content'
import { FadeIn } from './fade-in'
import { Section } from './section'
import { SectionHeader } from './section-header'

export function LandingWorkflow() {
  return (
    <Section border alt>
      <FadeIn>
        <SectionHeader
          eyebrow={WORKFLOW.eyebrow}
          title={WORKFLOW.title}
          description={WORKFLOW.description}
          align="center"
        />
      </FadeIn>
      <FadeIn
        delay={0.05}
        className="mt-12 grid gap-5 border-t border-border pt-8 sm:mt-14 lg:grid-cols-3 lg:gap-0 lg:border-t-0 lg:pt-0"
      >
        {WORKFLOW.steps.map((step, index) => (
          <div
            key={step.n}
            className="border-b border-border pb-5 lg:border-b-0 lg:border-l lg:px-8 lg:pb-0 first:lg:border-l-0 first:lg:pl-0"
          >
            <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground tabular-nums">{step.n}</p>
            <h3 className="mt-3 text-lg font-semibold tracking-[-0.025em]">{step.title}</h3>
            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </FadeIn>
    </Section>
  )
}
