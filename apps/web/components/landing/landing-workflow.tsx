import { ArrowDownRight, CheckCircle2 } from 'lucide-react'

import { WORKFLOW } from './content'
import { FadeIn } from './fade-in'
import { Section } from './section'

export function LandingWorkflow() {
  return <Section id="workflow" className="landing-canvas border-t border-[var(--landing-stone)]"><FadeIn><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><p className="text-sm font-semibold text-[var(--landing-orange)]">A connected creative workflow</p><h2 id="workflow-heading" className="mt-4 max-w-xl text-balance text-[clamp(2.25rem,4vw,4rem)] font-semibold leading-[.98] tracking-[-0.06em] text-[var(--landing-ink)]">{WORKFLOW.title}</h2><p className="mt-5 max-w-md text-[1.0625rem] leading-7 text-[var(--landing-muted)]">{WORKFLOW.description}</p></div><ol className="divide-y divide-[var(--landing-stone)] border-y border-[var(--landing-stone)]">{WORKFLOW.steps.map((step, index) => <li key={step.number} className="group grid grid-cols-[3rem_1fr_auto] gap-3 py-5 sm:grid-cols-[4.5rem_1fr_auto] sm:gap-5 sm:py-6"><span className="pt-0.5 text-sm font-semibold text-[var(--landing-orange)]">{step.number}</span><div><h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--landing-ink)]">{step.title}</h3><p className="mt-1.5 max-w-lg text-[0.9375rem] leading-6 text-[var(--landing-muted)]">{step.description}</p></div>{index === WORKFLOW.steps.length - 1 ? <CheckCircle2 className="mt-1 size-5 text-[var(--landing-orange)]" aria-hidden="true" /> : <ArrowDownRight className="mt-1 size-5 text-[var(--landing-muted)] transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />}</li>)}</ol></div></FadeIn></Section>
}
