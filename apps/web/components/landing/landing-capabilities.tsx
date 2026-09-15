import { Boxes, CalendarDays, LineChart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { CAPABILITIES } from './content'
import { FadeIn } from './fade-in'
import { Section } from './section'

const icons: LucideIcon[] = [Boxes, CalendarDays, LineChart]

export function LandingCapabilities() {
  return <Section className="landing-canvas border-t border-[var(--landing-stone)]"><FadeIn><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><h2 className="max-w-2xl text-balance text-[clamp(2.1rem,3.7vw,3.6rem)] font-semibold leading-[.98] tracking-[-0.06em] text-[var(--landing-ink)]">{CAPABILITIES.title}</h2><p className="max-w-sm text-[0.9375rem] leading-6 text-[var(--landing-muted)]">{CAPABILITIES.description}</p></div></FadeIn><div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--landing-stone)] bg-[var(--landing-stone)] md:grid-cols-3">{CAPABILITIES.items.map((item, index) => { const Icon = icons[index]!; return <FadeIn key={item.title} delay={index * .05} className="bg-[var(--landing-canvas)]"><article className="min-h-full p-6 sm:p-7"><Icon className="size-5 text-[var(--landing-orange)]" strokeWidth={1.8} aria-hidden="true" /><h3 className="mt-14 text-xl font-semibold tracking-[-0.035em] text-[var(--landing-ink)]">{item.title}</h3><p className="mt-3 text-[0.9375rem] leading-6 text-[var(--landing-muted)]">{item.description}</p></article></FadeIn> })}</div></Section>
}
