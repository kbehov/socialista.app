import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import {
  CalendarDays,
  Captions,
  Clapperboard,
  Download,
  ImageIcon,
  Layers,
  Library,
  LineChart,
  Megaphone,
  Repeat,
  ScanFace,
  Send,
  Smartphone,
  Sparkles,
  Type,
  Users,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

import { CtaPair } from './cta-pair'
import { FadeIn } from './fade-in'
import { FEATURE_NAV_ICONS } from './feature-nav-icons'
import { FeatureMedia } from './feature-media'
import {
  FEATURE_CATEGORIES,
  FEATURE_START_HERE,
  FEATURES_PAGE,
  featurePath,
  featureReadingMinutes,
  featureToc,
  featuresByCategory,
  getFeature,
  relatedFeatures,
  type Feature,
  type FeatureSlug,
  type FeatureTocItem,
} from './features'
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

const FEATURE_ICONS = FEATURE_NAV_ICONS

const HIGHLIGHT_ICONS: Record<FeatureSlug, readonly [LucideIcon, LucideIcon, LucideIcon]> = {
  'ai-influencers': [ScanFace, Repeat, Users],
  'ai-ugc-video': [Clapperboard, Captions, Send],
  'ai-slideshows': [Layers, Smartphone, CalendarDays],
  'ai-meta-ads': [Megaphone, Layers, Download],
  'ai-images': [ImageIcon, Library, Sparkles],
  'ai-videos': [Clapperboard, Captions, Library],
  'social-scheduling': [Type, CalendarDays, Send],
  'social-analytics': [LineChart, Library, Sparkles],
}

const featureH2 =
  'text-balance text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.034em] text-[var(--landing-ink)] sm:text-[1.875rem]'

const featureProse =
  'text-pretty text-[1.0625rem] leading-[1.75] text-[color-mix(in_srgb,var(--landing-ink)_76%,white)]'

const featureInlineLink =
  'rounded-sm font-medium text-[var(--landing-ink)] underline decoration-[color-mix(in_srgb,var(--landing-ink)_28%,transparent)] underline-offset-[0.18em] transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:decoration-[var(--landing-ink)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--landing-ink)]'

const featureTocLink =
  'block rounded-sm py-1.5 text-sm leading-snug tracking-[-0.01em] text-[var(--landing-muted)] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-[var(--landing-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]'

const featureChip =
  'inline-flex min-h-11 shrink-0 items-center rounded-full border border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] bg-white px-3.5 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[color-mix(in_srgb,var(--landing-stone)_35%,white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]'

const featureRule = 'border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]'

function isSafeFeatureHref(href: string) {
  return href.startsWith('/') && !href.startsWith('//')
}

function FeatureText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  const pattern = /\[([^\]]+)\]\((\/[^)\s]+)\)/g
  let lastIndex = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index
    const label = match[1]
    const href = match[2]
    if (label == null || href == null || !isSafeFeatureHref(href)) continue
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index))
    nodes.push(
      <Link key={`${href}-${index}`} href={href} className={featureInlineLink}>
        {label}
      </Link>,
    )
    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

function FeatureProse({ paragraphs, className }: { paragraphs: readonly string[]; className?: string }) {
  return (
    <div className={cn('space-y-5', className)}>
      {paragraphs.map(paragraph => (
        <p key={paragraph} className={featureProse}>
          <FeatureText text={paragraph} />
        </p>
      ))}
    </div>
  )
}

function FeatureTocList({ items }: { items: readonly FeatureTocItem[] }) {
  return (
    <ol className="mt-4 space-y-0.5">
      {items.map(item => (
        <li key={item.id}>
          <a href={`#${item.id}`} className={featureTocLink}>
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  )
}

function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--landing-stone)_70%,transparent)] bg-[color-mix(in_srgb,var(--landing-stone)_28%,white)] text-[var(--landing-ink)]"
      aria-hidden="true"
    >
      <Icon className="size-[1.125rem]" strokeWidth={2} />
    </span>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = FEATURE_ICONS[feature.slug as FeatureSlug]
  const categoryLabel = FEATURE_CATEGORIES.find(category => category.id === feature.category)?.label

  return (
    <Link
      href={featurePath(feature.slug)}
      className={cn(
        landingGlassLight,
        'flex h-full flex-col rounded-[var(--landing-panel-radius)] p-5 transition-colors duration-150 hover:bg-white sm:p-6',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <FeatureIcon icon={Icon} />
        {categoryLabel ? <span className={landingEyebrow}>{categoryLabel}</span> : null}
      </div>
      <h3 className={cn(landingH3, 'mt-4 text-[var(--landing-ink)]')}>{feature.name}</h3>
      <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{feature.summary}</p>
      <span className="mt-5 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)]">
        Read the guide
      </span>
    </Link>
  )
}

export function FeaturesHub() {
  return (
    <>
      <Section labelledBy="features-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>{FEATURES_PAGE.eyebrow}</p>
            <h1 id="features-heading" className={landingSectionTitle}>
              {FEATURES_PAGE.title}{' '}
              <span className={landingSectionTitleAccentSerif}>{FEATURES_PAGE.titleAccent}</span>
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{FEATURES_PAGE.description}</p>
          </div>
          <div className="mx-auto mt-8 max-w-[40rem] space-y-5 sm:mt-10">
            {FEATURES_PAGE.intro.map(paragraph => (
              <p key={paragraph} className={featureProse}>
                <FeatureText text={paragraph} />
              </p>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.04} className={landingContentGap}>
          <div className="mx-auto max-w-[40rem]">
            <h2 className={featureH2}>Start here</h2>
            <p className={cn(landingBodySm, 'mt-3 text-[var(--landing-muted)]')}>
              Four guides if the studio is new. The full list is under them.
            </p>
            <ol className={cn('mt-6 border-t', featureRule)}>
              {FEATURE_START_HERE.map((item, index) => {
                const feature = getFeature(item.slug)
                if (!feature) return null
                return (
                  <li key={item.slug} className={cn('border-b', featureRule)}>
                    <Link
                      href={featurePath(feature.slug)}
                      className="group flex gap-4 rounded-sm py-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]"
                    >
                      <span className={cn(landingEyebrow, 'pt-1 tabular-nums')}>{`0${index + 1}`}</span>
                      <span className="min-w-0">
                        <span className="block text-[1.0625rem] font-semibold tracking-[-0.02em] text-[var(--landing-ink)] underline decoration-transparent underline-offset-[0.18em] transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:decoration-[color-mix(in_srgb,var(--landing-ink)_28%,transparent)]">
                          {feature.name}
                        </span>
                        <span className={cn(landingBodySm, 'mt-1 block text-[var(--landing-muted)]')}>{item.note}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </div>
        </FadeIn>

        {FEATURE_CATEGORIES.map((category, categoryIndex) => (
          <FadeIn key={category.id} delay={0.04 + categoryIndex * 0.04} className={landingContentGap}>
            <div id={category.id} className="scroll-mt-24">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className={featureH2}>{category.label}</h2>
                <p className={cn(landingSectionLead, 'mt-3')}>{category.description}</p>
              </div>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuresByCategory(category.id).map(feature => (
                  <li key={feature.slug}>
                    <FeatureCard feature={feature} />
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}

        <FadeIn delay={0.12} className={landingContentGap}>
          <p className={cn(landingBodySm, 'mx-auto max-w-xl text-center text-[var(--landing-muted)]')}>
            Need a vertical-specific playbook?{' '}
            <Link href="/industries" className={landingNavLink}>
              Browse industries
            </Link>
            .
          </p>
        </FadeIn>
      </Section>
      <LandingFinalCta />
    </>
  )
}

function CrumbSeparator() {
  return (
    <span className="text-[var(--landing-muted)]" aria-hidden>
      /
    </span>
  )
}

function FeatureNudge({ title, body }: { title: string; body: string }) {
  return (
    <div className={cn(landingInsetPanel, 'mt-12 px-5 py-8 text-center sm:mt-14 sm:px-8 sm:py-10')}>
      <p className={cn(landingH3, 'text-[var(--landing-ink)]')}>{title}</p>
      <p className={cn(featureProse, 'mx-auto mt-3 max-w-md')}>{body}</p>
      <CtaPair className="mt-6" />
    </div>
  )
}

function FeatureArticle({ feature }: { feature: Feature }) {
  const toc = featureToc(feature)

  return (
    <div>
      <nav aria-label="On this page" className="mb-8 lg:hidden">
        <p className={landingEyebrow}>On this page</p>
        <ul className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
          {toc.map(item => (
            <li key={item.id}>
              <a href={`#${item.id}`} className={featureChip}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-[13rem_minmax(0,40rem)] lg:justify-center lg:gap-16">
        <nav aria-label="On this page" className="sticky top-24 hidden lg:block">
          <p className={landingEyebrow}>On this page</p>
          <FeatureTocList items={toc} />
        </nav>
        <div className="min-w-0">
          <div id={feature.essay.id} className="scroll-mt-28">
            <h2 className={featureH2}>{feature.essay.heading}</h2>
            <FeatureProse paragraphs={feature.essay.paragraphs} className="mt-5" />
          </div>
          {feature.guide.map(section => (
            <div
              key={section.id}
              id={section.id}
              className={cn('mt-12 scroll-mt-28 border-t pt-12 sm:mt-14 sm:pt-14', featureRule)}
            >
              <h2 className={featureH2}>{section.heading}</h2>
              <FeatureProse paragraphs={section.paragraphs} className="mt-5" />
            </div>
          ))}
          <FeatureNudge title={feature.nudge.title} body={feature.nudge.body} />
        </div>
      </div>
    </div>
  )
}

export function FeatureDetail({ feature }: { feature: Feature }) {
  const category = FEATURE_CATEGORIES.find(entry => entry.id === feature.category)
  const highlightIcons = HIGHLIGHT_ICONS[feature.slug as FeatureSlug]
  const related = relatedFeatures(feature.slug)
  const minutes = featureReadingMinutes(feature)

  return (
    <>
      <Section labelledBy="feature-heading">
        <FadeIn>
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
            <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
              <li>
                <Link href="/features" className={landingNavLink}>
                  Features
                </Link>
              </li>
              {category ? (
                <li className="flex items-center gap-2">
                  <CrumbSeparator />
                  <Link href={`/features#${category.id}`} className={landingNavLink}>
                    {category.label}
                  </Link>
                </li>
              ) : null}
              <li className="flex items-center gap-2">
                <CrumbSeparator />
                <span className="font-medium tracking-[-0.01em] text-[var(--landing-ink)]" aria-current="page">
                  {feature.name}
                </span>
              </li>
            </ol>
          </nav>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 flex flex-wrap items-center justify-center gap-x-2 sm:mb-5">
              {category ? <span className={landingEyebrow}>{category.label}</span> : null}
              {category ? (
                <span className="text-[var(--landing-muted)]" aria-hidden>
                  ·
                </span>
              ) : null}
              <span className="text-sm text-[var(--landing-muted)]">{minutes} min read</span>
            </p>
            <h1 id="feature-heading" className={landingSectionTitle}>
              {feature.title}{' '}
              <span className={landingSectionTitleAccentSerif}>{feature.titleAccent}</span>
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{feature.description}</p>
          </div>
          <CtaPair className="mt-8 sm:mt-10" showMicroline={false} />
        </FadeIn>

        <FadeIn delay={0.08} className={landingContentGap}>
          <FeatureMedia media={feature.media} />
        </FadeIn>
      </Section>

      <Section landingDivider>
        <FadeIn>
          <FeatureArticle feature={feature} />
        </FadeIn>
      </Section>

      <Section id={feature.example.id} landingDivider labelledBy={`${feature.example.id}-heading`}>
        <FadeIn>
          <div className="mx-auto max-w-[40rem]">
            <p className={landingEyebrow}>In practice</p>
            <h2 id={`${feature.example.id}-heading`} className={cn(featureH2, 'mt-3')}>
              {feature.example.heading}
            </h2>
            <FeatureProse paragraphs={feature.example.paragraphs} className="mt-5" />
          </div>
        </FadeIn>
      </Section>

      <Section id="highlights" landingDivider labelledBy="highlights-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="highlights-heading" className={featureH2}>
              What you get
            </h2>
          </div>
          <ul className={cn('grid gap-4 md:grid-cols-3', landingContentGap)}>
            {feature.highlights.map((highlight, index) => {
              const Icon = highlightIcons[index]
              return (
                <li
                  key={highlight.title}
                  className={cn(landingGlassLight, 'rounded-[var(--landing-panel-radius)] p-5 sm:p-6')}
                >
                  {Icon ? <FeatureIcon icon={Icon} /> : null}
                  <h3 className={cn(landingH3, 'mt-4 text-[var(--landing-ink)]')}>{highlight.title}</h3>
                  <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>
                    {highlight.description}
                  </p>
                </li>
              )
            })}
          </ul>
        </FadeIn>
      </Section>

      <Section id="use-cases" landingDivider labelledBy="use-cases-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="use-cases-heading" className={featureH2}>
              Who it&apos;s for
            </h2>
          </div>
          <ul className={cn('grid gap-4 md:grid-cols-3', landingContentGap)}>
            {feature.useCases.map(useCase => (
              <li key={useCase.title} className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
                <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>{useCase.title}</h3>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{useCase.description}</p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Section>

      <Section id="how" landingDivider labelledBy="how-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="how-heading" className={featureH2}>
              How it works
            </h2>
          </div>
          <ol className={cn('grid gap-4 md:grid-cols-3', landingContentGap)}>
            {feature.steps.map(step => (
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
            {feature.proof.map(item => (
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
            <h2 id="limits-heading" className={featureH2}>
              {feature.limitsHeading}
            </h2>
          </div>
          <ul
            className={cn(
              landingInsetPanel,
              'mx-auto max-w-3xl divide-y divide-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]',
              landingContentGap,
            )}
          >
            {feature.limits.map(item => (
              <li
                key={item.title}
                className="grid gap-2 px-5 py-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-baseline sm:gap-8 sm:px-7 sm:py-6"
              >
                <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>{item.title}</h3>
                <p className={cn(landingBodySm, 'text-[var(--landing-muted)]')}>
                  <FeatureText text={item.description} />
                </p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Section>

      <Section id="more" landingDivider labelledBy="more-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="more-heading" className={featureH2}>
              More in the studio
            </h2>
            <p className={cn(landingSectionLead, 'mt-4')}>
              Pair this with the rest of the workflow, or see how teams in your space use Socialista.
            </p>
          </div>
          <ul className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', landingContentGap)}>
            {related.map(other => (
              <li key={other.slug}>
                <Link
                  href={featurePath(other.slug)}
                  className={cn(
                    landingGlassLight,
                    'flex h-full flex-col rounded-[var(--landing-panel-radius)] p-5 transition-colors duration-150 hover:bg-white',
                  )}
                >
                  <span className={cn(landingH3, 'text-[var(--landing-ink)]')}>{other.name}</span>
                  <span className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{other.summary}</span>
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
            <Link href="/industries" className={landingNavLink}>
              Industries
            </Link>
          </p>
        </FadeIn>
      </Section>

      <Section id="faq" landingDivider labelledBy="feature-faq-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="feature-faq-heading" className={featureH2}>
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
            {feature.faqs.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`} className="border-none">
                <AccordionTrigger
                  className={cn(
                    landingH3,
                    'px-4 py-5 text-left text-[var(--landing-ink)] hover:no-underline sm:px-5',
                  )}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent
                  className={cn(landingBodySm, 'px-4 pb-5 text-[var(--landing-muted)] sm:px-5')}
                >
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </Section>

      <LandingFinalCta />
    </>
  )
}
