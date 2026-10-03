import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Clapperboard,
  Flag,
  Layers,
  LayoutDashboard,
  Library,
  LineChart,
  Megaphone,
  Package,
  ScanFace,
  Send,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Type,
  Users,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

import { CtaPair } from './cta-pair'
import { FadeIn } from './fade-in'
import { FeatureMedia } from './feature-media'
import { featurePath, getFeature } from './features'
import {
  INDUSTRIES,
  INDUSTRIES_PAGE,
  INDUSTRY_START_HERE,
  getIndustry,
  industryPath,
  industryReadingMinutes,
  industryToc,
  otherIndustries,
  type Industry,
  type IndustrySlug,
  type IndustryTocItem,
} from './industries'
import { LandingFinalCta } from './landing-final-cta'
import {
  landingBodySm,
  landingContentGap,
  landingEyebrow,
  landingGlassLight,
  landingH3,
  landingInsetPanel,
  landingNavLink,
  landingSectionLead,
  landingSectionTitle,
  landingSectionTitleAccentSerif,
  landingSupportingSectionY,
} from './landing-classes'
import { Section } from './section'

const INDUSTRY_ICONS: Record<IndustrySlug, LucideIcon> = {
  ecommerce: ShoppingBag,
  'mobile-apps': Smartphone,
  saas: LayoutDashboard,
  dropshipping: Package,
  agencies: Briefcase,
  creators: Clapperboard,
  founders: Flag,
}

const WHY_ICONS: Record<IndustrySlug, readonly [LucideIcon, LucideIcon, LucideIcon]> = {
  ecommerce: [Package, Clapperboard, CalendarDays],
  'mobile-apps': [Smartphone, Layers, Send],
  saas: [ScanFace, Type, Users],
  dropshipping: [Package, Layers, LineChart],
  agencies: [Library, Megaphone, CalendarDays],
  creators: [Layers, Clapperboard, ScanFace],
  founders: [Sparkles, ScanFace, Send],
}

const FORMAT_ICONS: Record<IndustrySlug, readonly [LucideIcon, LucideIcon, LucideIcon]> = {
  ecommerce: [Clapperboard, Megaphone, Layers],
  'mobile-apps': [Smartphone, Layers, Type],
  saas: [ScanFace, Megaphone, Layers],
  dropshipping: [Clapperboard, Megaphone, Sparkles],
  agencies: [Clapperboard, Megaphone, CalendarDays],
  creators: [Layers, Type, ScanFace],
  founders: [ScanFace, Megaphone, CalendarDays],
}

const industryH2 =
  'text-balance text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.034em] text-[var(--landing-ink)] sm:text-[1.875rem]'

const industryProse =
  'text-pretty text-[1.0625rem] leading-[1.75] text-[color-mix(in_srgb,var(--landing-ink)_76%,white)]'

const industryInlineLink =
  'rounded-sm font-medium text-[var(--landing-ink)] underline decoration-[color-mix(in_srgb,var(--landing-ink)_28%,transparent)] underline-offset-[0.18em] transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:decoration-[var(--landing-ink)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--landing-ink)]'

const industryTocLink =
  'block rounded-sm py-1.5 text-sm leading-snug tracking-[-0.01em] text-[var(--landing-muted)] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-[var(--landing-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]'

const industryChip =
  'inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] bg-white px-3.5 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[color-mix(in_srgb,var(--landing-stone)_35%,white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]'

const industryRule = 'border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]'

const industryCardHover =
  'outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]'

function isSafeIndustryHref(href: string) {
  return href.startsWith('/') && !href.startsWith('//')
}

function IndustryText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  const pattern = /\[([^\]]+)\]\((\/[^)\s]+)\)/g
  let lastIndex = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index
    const label = match[1]
    const href = match[2]
    if (label == null || href == null || !isSafeIndustryHref(href)) continue
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index))
    nodes.push(
      <Link key={`${href}-${index}`} href={href} className={industryInlineLink}>
        {label}
      </Link>,
    )
    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

function IndustryProse({ paragraphs, className }: { paragraphs: readonly string[]; className?: string }) {
  return (
    <div className={cn('space-y-5', className)}>
      {paragraphs.map(paragraph => (
        <p key={paragraph} className={industryProse}>
          <IndustryText text={paragraph} />
        </p>
      ))}
    </div>
  )
}

function IndustryTocList({ items }: { items: readonly IndustryTocItem[] }) {
  return (
    <ol className="mt-4 space-y-0.5">
      {items.map(item => (
        <li key={item.id}>
          <a href={`#${item.id}`} className={industryTocLink}>
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  )
}

function IndustryIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--landing-stone)_70%,transparent)] bg-[color-mix(in_srgb,var(--landing-stone)_28%,white)] text-[var(--landing-ink)]"
      aria-hidden="true"
    >
      <Icon className="size-[1.125rem]" strokeWidth={2} />
    </span>
  )
}

function IndustryCard({
  industry,
  heading: Heading = 'h2',
}: {
  industry: Industry
  heading?: 'h2' | 'h3'
}) {
  const Icon = INDUSTRY_ICONS[industry.slug as IndustrySlug]

  return (
    <Link
      href={industryPath(industry.slug)}
      className={cn(
        landingGlassLight,
        industryCardHover,
        'group flex h-full flex-col rounded-[var(--landing-panel-radius)] p-5 sm:p-6',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <IndustryIcon icon={Icon} />
      </div>
      <Heading className={cn(landingH3, 'mt-4 text-[var(--landing-ink)]')}>{industry.name}</Heading>
      <p className={cn(landingEyebrow, 'mt-1.5')}>{industry.audience}</p>
      <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{industry.summary}</p>
      <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)]">
        See the playbook
        <ArrowRight
          className="size-3.5 opacity-80 transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}

function CrumbSeparator() {
  return (
    <span className="text-[var(--landing-muted)]" aria-hidden>
      /
    </span>
  )
}

function relatedIndustryFeatures(industry: Industry) {
  return industry.relatedFeatureSlugs.flatMap(slug => {
    const feature = getFeature(slug)
    return feature ? [feature] : []
  })
}

function IndustryNudge({ title, body }: { title: string; body: string }) {
  return (
    <div className={cn(landingInsetPanel, 'mt-12 px-5 py-8 text-center sm:mt-14 sm:px-8 sm:py-10')}>
      <p className={cn(landingH3, 'text-[var(--landing-ink)]')}>{title}</p>
      <p className={cn(industryProse, 'mx-auto mt-3 max-w-md')}>{body}</p>
      <CtaPair className="mt-6" />
    </div>
  )
}

function IndustryArticle({ industry }: { industry: Industry }) {
  const toc = industryToc(industry)

  return (
    <div>
      <nav aria-label="On this page" className="mb-8 lg:hidden">
        <p className={landingEyebrow}>On this page</p>
        <ul className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
          {toc.map(item => (
            <li key={item.id}>
              <a href={`#${item.id}`} className={industryChip}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-[13rem_minmax(0,40rem)] lg:justify-center lg:gap-16">
        <nav aria-label="On this page" className="sticky top-24 hidden lg:block">
          <p className={landingEyebrow}>On this page</p>
          <IndustryTocList items={toc} />
        </nav>
        <div className="min-w-0">
          <div id={industry.essay.id} className="scroll-mt-28">
            <h2 className={industryH2}>{industry.essay.heading}</h2>
            <IndustryProse paragraphs={industry.essay.paragraphs} className="mt-5" />
          </div>
          {industry.guide.map(section => (
            <div
              key={section.id}
              id={section.id}
              className={cn('mt-12 scroll-mt-28 border-t pt-12 sm:mt-14 sm:pt-14', industryRule)}
            >
              <h2 className={industryH2}>{section.heading}</h2>
              <IndustryProse paragraphs={section.paragraphs} className="mt-5" />
            </div>
          ))}
          <IndustryNudge title={industry.nudge.title} body={industry.nudge.body} />
        </div>
      </div>
    </div>
  )
}

export function IndustriesHub() {
  return (
    <>
      <Section labelledBy="industries-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>{INDUSTRIES_PAGE.eyebrow}</p>
            <h1 id="industries-heading" className={landingSectionTitle}>
              {INDUSTRIES_PAGE.title}{' '}
              <span className={landingSectionTitleAccentSerif}>{INDUSTRIES_PAGE.titleAccent}</span>
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{INDUSTRIES_PAGE.description}</p>
          </div>
          <div className="mx-auto mt-8 max-w-[40rem] space-y-5 sm:mt-10">
            {INDUSTRIES_PAGE.intro.map(paragraph => (
              <p key={paragraph} className={industryProse}>
                {paragraph}
              </p>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.04} className={landingContentGap}>
          <div className="mx-auto max-w-[40rem]">
            <h2 className={industryH2}>Start here</h2>
            <p className={cn(landingBodySm, 'mt-3 text-[var(--landing-muted)]')}>
              Four playbooks if you already know the shape of the week. The full list is under them.
            </p>
            <ol className={cn('mt-6 border-t', industryRule)}>
              {INDUSTRY_START_HERE.map((item, index) => {
                const industry = getIndustry(item.slug)
                if (!industry) return null
                return (
                  <li key={item.slug} className={cn('border-b', industryRule)}>
                    <Link
                      href={industryPath(industry.slug)}
                      className="group flex gap-4 rounded-sm py-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]"
                    >
                      <span className={cn(landingEyebrow, 'pt-1 tabular-nums')}>{`0${index + 1}`}</span>
                      <span className="min-w-0">
                        <span className="block text-[1.0625rem] font-semibold tracking-[-0.02em] text-[var(--landing-ink)] underline decoration-transparent underline-offset-[0.18em] transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:decoration-[color-mix(in_srgb,var(--landing-ink)_28%,transparent)]">
                          {industry.name}
                        </span>
                        <span className={cn(landingBodySm, 'mt-1 block text-[var(--landing-muted)]')}>
                          {item.note}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className={landingContentGap}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={industryH2}>All industries</h2>
            <p className={cn(landingSectionLead, 'mt-3')}>
              The same studio. A different brief, a different week, a different reason the feed goes quiet.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map(industry => (
              <li key={industry.slug}>
                <IndustryCard industry={industry} />
              </li>
            ))}
          </ul>
        </FadeIn>
      </Section>

      <Section id="shared" landingDivider labelledBy="shared-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="shared-heading" className={landingSectionTitle}>
              {INDUSTRIES_PAGE.sharedTitle}{' '}
              <span className={landingSectionTitleAccentSerif}>{INDUSTRIES_PAGE.sharedTitleAccent}</span>
            </h2>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{INDUSTRIES_PAGE.sharedDescription}</p>
          </div>
          <ol className={cn('grid gap-4 md:grid-cols-3', landingContentGap)}>
            {INDUSTRIES_PAGE.sharedSteps.map(step => (
              <li key={step.step} className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
                <p className={landingEyebrow}>{step.step}</p>
                <h3 className={cn(landingH3, 'mt-3 text-[var(--landing-ink)]')}>{step.title}</h3>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{step.description}</p>
              </li>
            ))}
          </ol>
          <p className={cn(landingBodySm, 'mt-8 text-center text-[var(--landing-muted)] sm:mt-10')}>
            <Link href="/features" className={landingNavLink}>
              All features
            </Link>
            <span className="mx-2" aria-hidden>
              ·
            </span>
            <Link href="/compare" className={landingNavLink}>
              Compare
            </Link>
          </p>
        </FadeIn>
      </Section>

      <LandingFinalCta />
    </>
  )
}

export function IndustryDetail({ industry }: { industry: Industry }) {
  const related = relatedIndustryFeatures(industry)
  const others = otherIndustries(industry.slug)
  const minutes = industryReadingMinutes(industry)
  const whyIcons = WHY_ICONS[industry.slug as IndustrySlug]
  const formatIcons = FORMAT_ICONS[industry.slug as IndustrySlug]

  return (
    <>
      <Section labelledBy="industry-heading">
        <FadeIn>
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
            <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
              <li>
                <Link href="/industries" className={landingNavLink}>
                  Industries
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <CrumbSeparator />
                <span className="font-medium tracking-[-0.01em] text-[var(--landing-ink)]" aria-current="page">
                  {industry.name}
                </span>
              </li>
            </ol>
          </nav>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 flex flex-wrap items-center justify-center gap-x-2 sm:mb-5">
              <span className={landingEyebrow}>{industry.audience}</span>
              <span className="text-[var(--landing-muted)]" aria-hidden>
                ·
              </span>
              <span className="text-sm text-[var(--landing-muted)]">{minutes} min read</span>
            </p>
            <h1 id="industry-heading" className={landingSectionTitle}>
              {industry.title}{' '}
              <span className={landingSectionTitleAccentSerif}>{industry.titleAccent}</span>
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{industry.description}</p>
          </div>
          <CtaPair className="mt-8 sm:mt-10" showMicroline={false} />
        </FadeIn>

        <FadeIn delay={0.08} className={landingContentGap}>
          <FeatureMedia media={industry.media} />
        </FadeIn>
      </Section>

      <Section landingDivider>
        <FadeIn>
          <IndustryArticle industry={industry} />
        </FadeIn>
      </Section>

      <Section id="why-socialista" landingDivider labelledBy="why-socialista-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className={landingEyebrow}>Why Socialista</p>
            <h2 id="why-socialista-heading" className={cn(industryH2, 'mt-3')}>
              What changes when the studio fits this week
            </h2>
          </div>
          <ul className={cn('grid gap-4 md:grid-cols-3', landingContentGap)}>
            {industry.why.map((item, index) => {
              const WhyIcon = whyIcons[index]
              return (
                <li
                  key={item.title}
                  className={cn(landingGlassLight, 'rounded-[var(--landing-panel-radius)] p-5 sm:p-6')}
                >
                  {WhyIcon ? <IndustryIcon icon={WhyIcon} /> : null}
                  <h3 className={cn(landingH3, 'mt-4 text-[var(--landing-ink)]')}>{item.title}</h3>
                  <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{item.description}</p>
                </li>
              )
            })}
          </ul>
        </FadeIn>
      </Section>

      <Section id="problem" landingDivider labelledBy="problem-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="problem-heading" className={industryH2}>
              The problem it solves
            </h2>
            <p className={cn(landingSectionLead, 'mt-3')}>
              The feed goes quiet for a reason. These are usually that reason.
            </p>
          </div>
          <ul className={cn('grid gap-4 md:grid-cols-3', landingContentGap)}>
            {industry.painPoints.map((point, index) => (
              <li key={point.title} className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
                <p className={cn(landingEyebrow, 'tabular-nums')}>{`0${index + 1}`}</p>
                <h3 className={cn(landingH3, 'mt-3 text-[var(--landing-ink)]')}>{point.title}</h3>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{point.description}</p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Section>

      <Section id={industry.example.id} landingDivider labelledBy={`${industry.example.id}-heading`}>
        <FadeIn>
          <div className="mx-auto max-w-[40rem]">
            <p className={landingEyebrow}>In practice</p>
            <h2 id={`${industry.example.id}-heading`} className={cn(industryH2, 'mt-3')}>
              {industry.example.heading}
            </h2>
            <IndustryProse paragraphs={industry.example.paragraphs} className="mt-5" />
          </div>
          <ol className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', landingContentGap)}>
            {industry.week.map(day => (
              <li key={`${day.day}-${day.title}`} className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
                <p className={landingEyebrow}>{day.day}</p>
                <h3 className={cn(landingH3, 'mt-3 text-[var(--landing-ink)]')}>{day.title}</h3>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{day.description}</p>
              </li>
            ))}
          </ol>
        </FadeIn>
      </Section>

      <Section id="fits" landingDivider labelledBy="fits-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="fits-heading" className={industryH2}>
              Where it fits
            </h2>
          </div>
          <ul className={cn('grid gap-4 md:grid-cols-3', landingContentGap)}>
            {industry.uses.map(use => (
              <li key={use.title} className={cn(landingGlassLight, 'rounded-[var(--landing-panel-radius)] p-5 sm:p-6')}>
                <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>{use.title}</h3>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{use.description}</p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Section>

      <Section id="formats" landingDivider labelledBy="formats-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="formats-heading" className={industryH2}>
              What you can make
            </h2>
          </div>
          <ul className={cn('grid gap-4 md:grid-cols-3', landingContentGap)}>
            {industry.formats.map((format, index) => {
              const FormatIcon = formatIcons[index]
              return (
                <li
                  key={format.title}
                  className={cn(landingGlassLight, 'rounded-[var(--landing-panel-radius)] p-5 sm:p-6')}
                >
                  {FormatIcon ? <IndustryIcon icon={FormatIcon} /> : null}
                  <h3 className={cn(landingH3, 'mt-4 text-[var(--landing-ink)]')}>{format.title}</h3>
                  <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{format.description}</p>
                </li>
              )
            })}
          </ul>
        </FadeIn>
      </Section>

      <Section id="how" landingDivider labelledBy="how-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="how-heading" className={industryH2}>
              How you use it
            </h2>
          </div>
          <ol className={cn('grid gap-4 md:grid-cols-3', landingContentGap)}>
            {industry.steps.map(step => (
              <li key={step.step} className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
                <p className={landingEyebrow}>{step.step}</p>
                <h3 className={cn(landingH3, 'mt-3 text-[var(--landing-ink)]')}>{step.title}</h3>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{step.description}</p>
              </li>
            ))}
          </ol>
        </FadeIn>
      </Section>

      <Section
        id="proof"
        landingDivider
        labelledBy="proof-heading"
        className={landingSupportingSectionY}
      >
        <FadeIn>
          <h2 id="proof-heading" className="sr-only">
            At a glance
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {industry.proof.map(item => (
              <li
                key={item.value}
                className={cn(landingGlassLight, 'rounded-[var(--landing-panel-radius)] px-5 py-6 text-center sm:px-6')}
              >
                <p className="text-[1.375rem] font-semibold tracking-[-0.03em] text-[var(--landing-ink)] sm:text-[1.5rem]">
                  {item.value}
                </p>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{item.label}</p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Section>

      <Section id="limits" landingDivider labelledBy="limits-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="limits-heading" className={industryH2}>
              {industry.limitsHeading}
            </h2>
          </div>
          <ul
            className={cn(
              landingInsetPanel,
              'mx-auto max-w-3xl divide-y divide-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]',
              landingContentGap,
            )}
          >
            {industry.limits.map(item => (
              <li
                key={item.title}
                className="grid gap-2 px-5 py-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-baseline sm:gap-8 sm:px-7 sm:py-6"
              >
                <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>{item.title}</h3>
                <p className={cn(landingBodySm, 'text-[var(--landing-muted)]')}>{item.description}</p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Section>

      <Section id="features" landingDivider labelledBy="features-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="features-heading" className={industryH2}>
              The studio behind it
            </h2>
            <p className={cn(landingSectionLead, 'mt-4')}>
              The same tools, aimed at this kind of work.
            </p>
          </div>
          <ul className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', landingContentGap)}>
            {related.map(feature => (
              <li key={feature.slug}>
                <Link
                  href={featurePath(feature.slug)}
                  className={cn(
                    landingGlassLight,
                    industryCardHover,
                    'flex h-full flex-col rounded-[var(--landing-panel-radius)] p-5',
                  )}
                >
                  <span className={cn(landingH3, 'text-[var(--landing-ink)]')}>{feature.name}</span>
                  <span className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{feature.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={cn(landingBodySm, 'mt-8 text-center text-[var(--landing-muted)] sm:mt-10')}>
            <Link href="/features" className={landingNavLink}>
              All features
            </Link>
            <span className="mx-2" aria-hidden>
              ·
            </span>
            <Link href="/compare" className={landingNavLink}>
              Compare
            </Link>
          </p>
        </FadeIn>
      </Section>

      <Section id="faq" landingDivider labelledBy="industry-faq-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="industry-faq-heading" className={industryH2}>
              Questions
            </h2>
          </div>
          <Accordion
            type="single"
            collapsible
            className={cn(
              landingGlassLight,
              landingContentGap,
              'mx-auto max-w-2xl overflow-hidden rounded-[var(--landing-panel-radius)] px-1 sm:px-2',
              'divide-y divide-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]',
            )}
          >
            {industry.faqs.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`} className="border-none">
                <AccordionTrigger
                  className={cn(
                    landingH3,
                    'px-4 py-5 text-left text-[var(--landing-ink)] hover:no-underline sm:px-5',
                  )}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className={cn(landingBodySm, 'px-4 pb-5 text-[var(--landing-muted)] sm:px-5')}>
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </Section>

      <Section id="more" landingDivider labelledBy="more-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="more-heading" className={industryH2}>
              Other industries
            </h2>
            <p className={cn(landingSectionLead, 'mt-4')}>
              The same studio, for a different kind of work.
            </p>
          </div>
          <ul className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', landingContentGap)}>
            {others.map(other => (
              <li key={other.slug}>
                <IndustryCard industry={other} heading="h3" />
              </li>
            ))}
          </ul>
          <p className={cn(landingBodySm, 'mt-8 text-center text-[var(--landing-muted)] sm:mt-10')}>
            <Link href="/industries" className={landingNavLink}>
              All industries
            </Link>
          </p>
        </FadeIn>
      </Section>

      <LandingFinalCta />
    </>
  )
}
