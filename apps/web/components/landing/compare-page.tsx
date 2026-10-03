import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { ArrowUpRight, Check, Minus, X } from 'lucide-react'
import Link from 'next/link'

import { CtaPair } from './cta-pair'
import {
  COMPARE_CELL_HELP,
  COMPARE_CELL_LABEL,
  COMPARE_CHECKED_LABEL,
  COMPARE_COMPETITORS,
  COMPARE_DETAIL_TOC,
  COMPARE_FEATURES,
  COMPARE_GROUPS,
  COMPARE_HUB,
  COMPARE_LANES,
  COMPARE_SNAPSHOT_IDS,
  SOCIALISTA_PRICING,
  comparePath,
  competitorsInLane,
  getCompareFeature,
  otherCompareCompetitors,
  type CompareCell,
  type CompareCompetitor,
  type CompareFeatureId,
  type CompareGroupId,
} from './compare'
import { FadeIn } from './fade-in'
import { featurePath, getFeature } from './features'
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

const compareH2 =
  'text-balance text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.034em] text-[var(--landing-ink)] sm:text-[1.875rem]'

const compareProse =
  'text-pretty text-[1.0625rem] leading-[1.75] text-[color-mix(in_srgb,var(--landing-ink)_76%,white)]'

const compareChip =
  'inline-flex min-h-11 shrink-0 items-center rounded-full border border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] bg-white px-3.5 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[color-mix(in_srgb,var(--landing-stone)_35%,white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]'

const compareTocLink =
  'block rounded-sm py-1.5 text-sm leading-snug tracking-[-0.01em] text-[var(--landing-muted)] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-[var(--landing-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]'

const compareRule = 'border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]'

const socialistaCol =
  'bg-[color-mix(in_oklch,var(--accent-orange)_7%,transparent)]'

function featuresInGroup(group: CompareGroupId) {
  return COMPARE_FEATURES.filter(feature => feature.group === group)
}

function competitorNote(
  notes: Partial<Record<CompareFeatureId, string>> | undefined,
  id: CompareFeatureId,
) {
  return notes?.[id]
}

function relatedCompareFeatures(competitor: CompareCompetitor) {
  return competitor.relatedFeatureSlugs.flatMap(slug => {
    const feature = getFeature(slug)
    return feature ? [feature] : []
  })
}

function CompareCellIcon({ cell }: { cell: CompareCell }) {
  const label = COMPARE_CELL_LABEL[cell]

  if (cell === 'yes') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--accent-orange)_12%,transparent)] text-[var(--landing-ink)]">
        <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    )
  }

  if (cell === 'no') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--landing-ink)_5%,transparent)] text-[var(--landing-muted)]">
        <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    )
  }

  if (cell === 'partial') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--accent-orange)_8%,transparent)] text-[color-mix(in_srgb,var(--landing-ink)_62%,var(--landing-muted))]">
        <Minus className="size-3.5" strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex h-6 min-w-6 items-center text-[0.9375rem] leading-none text-[var(--landing-muted)]">
      <span aria-hidden="true">–</span>
      <span className="sr-only">{label}</span>
    </span>
  )
}

function CompareCellValue({ cell, note }: { cell: CompareCell; note?: string }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-2">
        <CompareCellIcon cell={cell} />
        <span className="text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--landing-ink)]">
          {COMPARE_CELL_LABEL[cell]}
        </span>
      </div>
      {note ? (
        <span className="block text-[0.75rem] leading-[1.45] font-normal text-[var(--landing-muted)]">
          {note}
        </span>
      ) : null}
    </div>
  )
}

function CompareLegend() {
  return (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.75rem] leading-[1.45] text-[var(--landing-muted)]">
      {(['yes', 'partial', 'no', 'unpublished'] as const).map(cell => (
        <li key={cell} className="inline-flex items-center gap-2">
          <CompareCellIcon cell={cell} />
          <span>
            <span className="font-medium text-[var(--landing-ink)]">{COMPARE_CELL_LABEL[cell]}</span>
            {'. '}
            {COMPARE_CELL_HELP[cell]}
          </span>
        </li>
      ))}
    </ul>
  )
}

function CompareScoreChips({ competitor }: { competitor: CompareCompetitor }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
      <p
        className={cn(
          landingInsetPanel,
          socialistaCol,
          'rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--landing-ink)]',
        )}
      >
        Socialista · what we ship
      </p>
      <p
        className={cn(
          landingInsetPanel,
          'rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--landing-ink)]',
        )}
      >
        {competitor.name} · public pages
      </p>
    </div>
  )
}

function CompareFeatureTable({ competitor }: { competitor: CompareCompetitor }) {
  return (
    <div className={cn(landingInsetPanel, 'hidden overflow-x-auto md:block')}>
      <table className="w-full min-w-[40rem] border-collapse text-left text-[0.875rem]">
        <caption className="sr-only">
          Feature comparison of Socialista and {competitor.name}, checked {COMPARE_CHECKED_LABEL}.
        </caption>
        <thead>
          <tr className="border-b border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]">
            <th
              scope="col"
              className="sticky left-0 z-10 bg-[var(--landing-surface-muted)] px-4 py-3 text-left font-medium text-[var(--landing-muted)] sm:px-5"
            >
              Feature
            </th>
            <th
              scope="col"
              className={cn(
                'w-[32%] px-4 py-3 text-left font-medium text-[var(--landing-ink)] sm:px-5',
                socialistaCol,
              )}
            >
              Socialista
            </th>
            <th
              scope="col"
              className="w-[32%] bg-[var(--landing-surface-muted)] px-4 py-3 text-left font-medium text-[var(--landing-ink)] sm:px-5"
            >
              {competitor.name}
            </th>
          </tr>
        </thead>
        {COMPARE_GROUPS.map(group => (
          <tbody key={group.id}>
            <tr>
              <th
                scope="colgroup"
                colSpan={3}
                className="bg-[color-mix(in_srgb,var(--landing-ink)_3%,transparent)] px-4 py-2.5 text-left text-[0.6875rem] font-semibold tracking-[0.14em] text-[var(--landing-muted)] uppercase sm:px-5"
              >
                {group.label}
              </th>
            </tr>
            {featuresInGroup(group.id).map(feature => (
              <tr
                key={feature.id}
                className="border-t border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] align-top"
              >
                <th
                  scope="row"
                  className="sticky left-0 bg-[var(--landing-surface-muted)] px-4 py-3.5 text-left sm:px-5"
                >
                  <span className="block font-medium text-[var(--landing-ink)]">{feature.label}</span>
                  <span className="mt-1 block text-[0.75rem] leading-[1.45] font-normal text-[var(--landing-muted)]">
                    {feature.hint}
                  </span>
                </th>
                <td className={cn('px-4 py-3.5 text-[var(--landing-ink)] sm:px-5', socialistaCol)}>
                  <CompareCellValue cell={feature.socialista} note={feature.socialistaNote} />
                </td>
                <td className="px-4 py-3.5 text-[var(--landing-ink)] sm:px-5">
                  <CompareCellValue
                    cell={competitor.cells[feature.id]}
                    note={competitorNote(competitor.notes, feature.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}

function CompareFeatureCards({ competitor }: { competitor: CompareCompetitor }) {
  return (
    <div className="space-y-8 md:hidden">
      {COMPARE_GROUPS.map(group => (
        <section key={group.id} aria-labelledby={`mobile-group-${group.id}`}>
          <h3
            id={`mobile-group-${group.id}`}
            className="text-[0.6875rem] font-semibold tracking-[0.14em] text-[var(--landing-muted)] uppercase"
          >
            {group.label}
          </h3>
          <ul className="mt-3 space-y-3">
            {featuresInGroup(group.id).map(feature => (
              <li key={feature.id} className={cn(landingInsetPanel, 'p-4')}>
                <p className="font-medium tracking-[-0.01em] text-[var(--landing-ink)]">{feature.label}</p>
                <p className="mt-1 text-[0.75rem] leading-[1.45] text-[var(--landing-muted)]">{feature.hint}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className={cn('rounded-[calc(var(--landing-panel-radius)-1rem)] p-3', socialistaCol)}>
                    <p className={cn(landingEyebrow, 'mb-2')}>Socialista</p>
                    <CompareCellValue cell={feature.socialista} note={feature.socialistaNote} />
                  </div>
                  <div className="rounded-[calc(var(--landing-panel-radius)-1rem)] bg-white/70 p-3">
                    <p className={cn(landingEyebrow, 'mb-2')}>{competitor.name}</p>
                    <CompareCellValue
                      cell={competitor.cells[feature.id]}
                      note={competitorNote(competitor.notes, feature.id)}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function SnapshotCell({ cell }: { cell: CompareCell }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CompareCellIcon cell={cell} />
      <span className="hidden text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--landing-ink)] sm:inline">
        {COMPARE_CELL_LABEL[cell]}
      </span>
    </span>
  )
}

function CompareSnapshot() {
  const snapshotFeatures = COMPARE_SNAPSHOT_IDS.map(id => getCompareFeature(id)).filter(
    (feature): feature is NonNullable<typeof feature> => feature != null,
  )

  return (
    <div className={cn(landingInsetPanel, 'overflow-x-auto')}>
      <table className="w-full min-w-[36rem] border-collapse text-left text-[0.875rem]">
        <caption className="sr-only">
          Snapshot of Socialista and eight other tools on talking UGC, organic posting, a free start, and ad
          launch.
        </caption>
        <thead>
          <tr className="border-b border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]">
            <th
              scope="col"
              className="sticky left-0 z-10 bg-[var(--landing-surface-muted)] px-4 py-3 font-medium text-[var(--landing-muted)] sm:px-5"
            >
              Tool
            </th>
            {snapshotFeatures.map(feature => (
              <th
                key={feature.id}
                scope="col"
                className="px-3 py-3 text-center font-medium text-[var(--landing-ink)] sm:px-4"
              >
                {feature.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]">
            <th
              scope="row"
              className={cn(
                'sticky left-0 z-10 px-4 py-3.5 text-left font-medium text-[var(--landing-ink)] sm:px-5',
                socialistaCol,
              )}
            >
              Socialista
            </th>
            {snapshotFeatures.map(feature => (
              <td key={feature.id} className={cn('px-3 py-3.5 text-center sm:px-4', socialistaCol)}>
                <span className="inline-flex justify-center">
                  <SnapshotCell cell={feature.socialista} />
                </span>
              </td>
            ))}
          </tr>
          {COMPARE_COMPETITORS.map(competitor => (
            <tr
              key={competitor.slug}
              className="border-t border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]"
            >
              <th
                scope="row"
                className="sticky left-0 bg-[var(--landing-surface-muted)] px-4 py-3.5 text-left font-medium sm:px-5"
              >
                <Link
                  href={comparePath(competitor.slug)}
                  className="rounded-sm text-[var(--landing-ink)] underline decoration-transparent underline-offset-[0.18em] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:decoration-[color-mix(in_srgb,var(--landing-ink)_28%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]"
                >
                  {competitor.name}
                </Link>
              </th>
              {snapshotFeatures.map(feature => (
                <td key={feature.id} className="px-3 py-3.5 text-center sm:px-4">
                  <span className="inline-flex justify-center">
                    <SnapshotCell cell={competitor.cells[feature.id]} />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CompareCard({
  competitor,
  heading: Heading = 'h3',
}: {
  competitor: CompareCompetitor
  heading?: 'h2' | 'h3'
}) {
  return (
    <Link
      href={comparePath(competitor.slug)}
      className={cn(
        landingGlassLight,
        'group flex h-full flex-col rounded-[var(--landing-panel-radius)] p-5 transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-white sm:p-6',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={landingEyebrow}>{competitor.category}</p>
        <ArrowUpRight
          className="size-4 shrink-0 text-[var(--landing-muted)] transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--landing-ink)]"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>
      <Heading className={cn(landingH3, 'mt-4 text-[var(--landing-ink)]')}>
        Socialista vs {competitor.name}
      </Heading>
      <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{competitor.summary}</p>
      <p className="mt-auto pt-5 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--landing-ink)]">
        {competitor.pricing.short}
      </p>
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

function CompareNudge({ competitor }: { competitor: CompareCompetitor }) {
  return (
    <div className={cn(landingInsetPanel, 'px-5 py-8 text-center sm:px-8 sm:py-10')}>
      <p className={cn(landingH3, 'text-[var(--landing-ink)]')}>
        Try the Socialista side on your next post
      </p>
      <p className={cn(compareProse, 'mx-auto mt-3 max-w-md')}>
        Make the talking clip or the still, then schedule it. {competitor.name} can stay in the mix for
        the job it already wins.
      </p>
      <CtaPair className="mt-6" />
    </div>
  )
}

export function CompareHub() {
  return (
    <>
      <Section labelledBy="compare-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>{COMPARE_HUB.eyebrow}</p>
            <h1 id="compare-heading" className={landingSectionTitle}>
              {COMPARE_HUB.title}{' '}
              <span className={landingSectionTitleAccentSerif}>{COMPARE_HUB.titleAccent}</span>
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{COMPARE_HUB.description}</p>
          </div>
          <div className="mx-auto mt-8 max-w-[40rem] space-y-5 sm:mt-10">
            {COMPARE_HUB.intro.map(paragraph => (
              <p key={paragraph} className={compareProse}>
                {paragraph}
              </p>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.04} className={landingContentGap}>
          <div className="mx-auto max-w-[40rem]">
            <h2 className={compareH2}>Start here</h2>
            <p className={cn(landingBodySm, 'mt-3 text-[var(--landing-muted)]')}>
              Three jobs. Open the lane that matches the next step, then read the comparison.
            </p>
            <ol className={cn('mt-6 border-t', compareRule)}>
              {COMPARE_HUB.startHere.map((item, index) => (
                <li key={item.id} className={cn('border-b', compareRule)}>
                  <a
                    href={`#${item.id}`}
                    className="group flex gap-4 rounded-sm py-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]"
                  >
                    <span className={cn(landingEyebrow, 'pt-1 tabular-nums')}>{`0${index + 1}`}</span>
                    <span className="min-w-0">
                      <span className="block text-[1.0625rem] font-semibold tracking-[-0.02em] text-[var(--landing-ink)] underline decoration-transparent underline-offset-[0.18em] transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:decoration-[color-mix(in_srgb,var(--landing-ink)_28%,transparent)]">
                        {item.title}
                      </span>
                      <span className={cn(landingBodySm, 'mt-1 block text-[var(--landing-muted)]')}>
                        {item.note}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </FadeIn>
      </Section>

      <Section
        id="snapshot"
        landingDivider
        labelledBy="snapshot-heading"
        className={landingSupportingSectionY}
      >
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="snapshot-heading" className={compareH2}>
              Four questions that sort the field
            </h2>
            <p className={cn(landingSectionLead, 'mt-3')}>{COMPARE_HUB.snapshotLead}</p>
          </div>
        </FadeIn>
        <div className={landingContentGap}>
          <CompareSnapshot />
          <p className={cn(landingBodySm, 'mt-4 text-center text-[var(--landing-muted)]')}>
            Dash means the public page we checked did not mention it. Open a row for the notes.
          </p>
        </div>
      </Section>

      {COMPARE_LANES.map(lane => (
        <Section key={lane.id} id={lane.id} landingDivider labelledBy={`${lane.id}-heading`}>
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <h2 id={`${lane.id}-heading`} className={compareH2}>
                {lane.label}
              </h2>
              <p className={cn(landingSectionLead, 'mt-3')}>{lane.description}</p>
            </div>
            <ul className={cn('grid gap-4 sm:grid-cols-2', landingContentGap)}>
              {competitorsInLane(lane.id).map(competitor => (
                <li key={competitor.slug}>
                  <CompareCard competitor={competitor} heading="h3" />
                </li>
              ))}
            </ul>
          </FadeIn>
        </Section>
      ))}

      <Section id="method" landingDivider labelledBy="method-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="method-heading" className={compareH2}>
              {COMPARE_HUB.methodologyTitle}
            </h2>
          </div>
          <ul
            className={cn(
              landingInsetPanel,
              'mx-auto max-w-3xl divide-y divide-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]',
              landingContentGap,
            )}
          >
            {COMPARE_HUB.methodology.map(item => (
              <li
                key={item.title}
                className="grid gap-2 px-5 py-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-baseline sm:gap-8 sm:px-7 sm:py-6"
              >
                <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>{item.title}</h3>
                <p className={cn(landingBodySm, 'text-[var(--landing-muted)]')}>{item.body}</p>
              </li>
            ))}
          </ul>
          <p className={cn(landingBodySm, 'mt-8 text-center text-[var(--landing-muted)]')}>
            Checked {COMPARE_CHECKED_LABEL}. Socialista is scored as shipped, including the nos.
          </p>
        </FadeIn>
      </Section>

      <Section id="faq" landingDivider labelledBy="compare-hub-faq-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="compare-hub-faq-heading" className={compareH2}>
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
            {COMPARE_HUB.faqs.map((item, index) => (
              <AccordionItem key={item.question} value={`hub-faq-${index}`} className="border-none">
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

      <LandingFinalCta />
    </>
  )
}

function CompareMobileToc() {
  return (
    <nav aria-label="On this page" className="mb-8 lg:hidden">
      <p className={landingEyebrow}>On this page</p>
      <ul className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {COMPARE_DETAIL_TOC.map(item => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={compareChip}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function CompareDesktopToc() {
  return (
    <nav aria-label="On this page" className="sticky top-24 hidden lg:block">
      <p className={landingEyebrow}>On this page</p>
      <ol className="mt-4 space-y-0.5">
        {COMPARE_DETAIL_TOC.map(item => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={compareTocLink}>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function CompareDetail({ competitor }: { competitor: CompareCompetitor }) {
  const others = otherCompareCompetitors(competitor.slug)
  const related = relatedCompareFeatures(competitor)
  const lane = COMPARE_LANES.find(entry => entry.id === competitor.lane)

  return (
    <>
      <Section labelledBy="compare-detail-heading">
        <FadeIn>
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
            <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
              <li>
                <Link href="/compare" className={landingNavLink}>
                  Compare
                </Link>
              </li>
              {lane ? (
                <li className="flex items-center gap-2">
                  <CrumbSeparator />
                  <Link href={`/compare#${lane.id}`} className={landingNavLink}>
                    {lane.label}
                  </Link>
                </li>
              ) : null}
              <li className="flex items-center gap-2">
                <CrumbSeparator />
                <span className="font-medium tracking-[-0.01em] text-[var(--landing-ink)]" aria-current="page">
                  vs {competitor.name}
                </span>
              </li>
            </ol>
          </nav>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 flex flex-wrap items-center justify-center gap-x-2 sm:mb-5">
              <span className={landingEyebrow}>{competitor.category}</span>
              <span className="text-[var(--landing-muted)]" aria-hidden>
                ·
              </span>
              <span className="text-sm text-[var(--landing-muted)]">Checked {COMPARE_CHECKED_LABEL}</span>
            </p>
            <h1 id="compare-detail-heading" className={landingSectionTitle}>
              {competitor.title}{' '}
              <span className={landingSectionTitleAccentSerif}>{competitor.titleAccent}</span>
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{competitor.difference}</p>
          </div>
          <CtaPair className="mt-8 sm:mt-10" showMicroline={false} />
        </FadeIn>
      </Section>

      <Section
        id="glance"
        landingDivider
        labelledBy="glance-heading"
        className={landingSupportingSectionY}
      >
        <FadeIn>
          <h2 id="glance-heading" className="sr-only">
            At a glance
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {competitor.stats.map(item => (
              <li
                key={`${item.value}-${item.label}`}
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

      <Section landingDivider>
        <FadeIn immediate>
          <div>
            <CompareMobileToc />
            <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-[13rem_minmax(0,40rem)] lg:justify-center lg:gap-16">
              <CompareDesktopToc />
              <div className="min-w-0">
              <div id="overview" className="scroll-mt-28">
                <h2 className={compareH2}>The difference</h2>
                <div className="mt-5 space-y-5">
                  {competitor.overview.map(paragraph => (
                    <p key={paragraph} className={compareProse}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div id="fit" className={cn('mt-12 scroll-mt-28 border-t pt-12 sm:mt-14 sm:pt-14', compareRule)}>
                <h2 className={compareH2}>Who should pick which</h2>
                <div className="mt-6 grid gap-4">
                  <article className={cn(landingGlassLight, 'rounded-[var(--landing-panel-radius)] p-5 sm:p-6')}>
                    <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>Choose Socialista if</h3>
                    <ul className="mt-4 space-y-3">
                      {competitor.bestForSocialista.map(item => (
                        <li key={item} className="flex gap-3">
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-[var(--landing-ink)]"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                          <span className={cn(landingBodySm, 'text-[var(--landing-muted)]')}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                  <article className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
                    <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>
                      Choose {competitor.name} if
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {competitor.bestForThem.map(item => (
                        <li key={item} className="flex gap-3">
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-[var(--landing-ink)]"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                          <span className={cn(landingBodySm, 'text-[var(--landing-muted)]')}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className={cn(landingEyebrow, 'mb-3')}>Socialista wins on</p>
                    <ul className="space-y-2">
                      {competitor.weWinOn.map(item => (
                        <li
                          key={item}
                          className={cn(landingBodySm, 'text-[color-mix(in_srgb,var(--landing-ink)_82%,white)]')}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className={cn(landingEyebrow, 'mb-3')}>{competitor.name} wins on</p>
                    <ul className="space-y-2">
                      {competitor.theyWinOn.map(item => (
                        <li
                          key={item}
                          className={cn(landingBodySm, 'text-[color-mix(in_srgb,var(--landing-ink)_82%,white)]')}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div id="how" className={cn('mt-12 scroll-mt-28 border-t pt-12 sm:mt-14 sm:pt-14', compareRule)}>
                <h2 className={compareH2}>How each tool works</h2>
                <div className="mt-6 grid gap-4">
                  <article className={cn(landingGlassLight, 'rounded-[var(--landing-panel-radius)] p-5 sm:p-6')}>
                    <p className={landingEyebrow}>Socialista</p>
                    <ol className="mt-4 space-y-4">
                      {competitor.howWeWork.map((step, index) => (
                        <li key={step} className="flex gap-4">
                          <span className={cn(landingEyebrow, 'pt-0.5 tabular-nums')}>{`0${index + 1}`}</span>
                          <span className={cn(landingBodySm, 'text-[var(--landing-muted)]')}>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </article>
                  <article className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
                    <p className={landingEyebrow}>{competitor.name}</p>
                    <ol className="mt-4 space-y-4">
                      {competitor.howTheyWork.map((step, index) => (
                        <li key={step} className="flex gap-4">
                          <span className={cn(landingEyebrow, 'pt-0.5 tabular-nums')}>{`0${index + 1}`}</span>
                          <span className={cn(landingBodySm, 'text-[var(--landing-muted)]')}>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </article>
                </div>
              </div>

              <div
                id="scenarios"
                className={cn('mt-12 scroll-mt-28 border-t pt-12 sm:mt-14 sm:pt-14', compareRule)}
              >
                <h2 className={compareH2}>Example weeks</h2>
                <ul className="mt-6 space-y-3">
                  {competitor.scenarios.map(scenario => (
                    <li key={scenario.title} className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
                      <p className={landingEyebrow}>
                        {scenario.pick === 'us' ? 'Pick Socialista' : `Pick ${competitor.name}`}
                      </p>
                      <h3 className={cn(landingH3, 'mt-2 text-[var(--landing-ink)]')}>{scenario.title}</h3>
                      <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{scenario.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Section>

      <Section id="features" landingDivider labelledBy="features-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="features-heading" className={landingSectionTitle}>
              Feature by feature
            </h2>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>
              Socialista on the left, {competitor.name} on the right. Partial has a limit. Not listed means
              the page we checked did not mention it.
            </p>
          </div>
          <div className={landingContentGap}>
            <CompareScoreChips competitor={competitor} />
            <div className="mt-6 sm:mt-8">
              <CompareLegend />
            </div>
            <div className="mt-6 sm:mt-8">
              <CompareFeatureTable competitor={competitor} />
              <CompareFeatureCards competitor={competitor} />
            </div>
            <p className="mt-4 text-center text-[0.8125rem] text-[var(--landing-muted)]">
              Checked {COMPARE_CHECKED_LABEL}.{' '}
              <a
                href={competitor.pricing.sourceUrl}
                className={cn(landingNavLink, 'font-medium text-[var(--landing-ink)]')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {competitor.pricing.sourceLabel}
              </a>
            </p>
          </div>
        </FadeIn>
      </Section>

      <Section id="pricing" landingDivider labelledBy="pricing-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl">
            <h2 id="pricing-heading" className={cn(landingSectionTitle, 'text-center')}>
              Price snapshot
            </h2>
            <div className={cn('grid gap-4 md:grid-cols-2', landingContentGap)}>
              <article className={cn(landingGlassLight, 'rounded-[var(--landing-panel-radius)] p-5 sm:p-6')}>
                <p className={landingEyebrow}>Us</p>
                <h3 className={cn(landingH3, 'mt-3 text-[var(--landing-ink)]')}>Socialista</h3>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{SOCIALISTA_PRICING}</p>
                <p className="mt-4">
                  <Link href="/pricing" className={cn(landingNavLink, 'font-medium text-[var(--landing-ink)]')}>
                    See Socialista pricing
                  </Link>
                </p>
              </article>
              <article className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
                <p className={landingEyebrow}>Them</p>
                <h3 className={cn(landingH3, 'mt-3 text-[var(--landing-ink)]')}>{competitor.name}</h3>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>
                  {competitor.pricing.summary}
                </p>
                {competitor.pricing.plans ? (
                  <ul className="mt-5 divide-y divide-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]">
                    {competitor.pricing.plans.map(plan => (
                      <li key={plan.name} className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <span>
                          <span className="block text-[0.875rem] font-medium tracking-[-0.01em] text-[var(--landing-ink)]">
                            {plan.name}
                          </span>
                          <span className="mt-0.5 block text-[0.75rem] leading-[1.45] text-[var(--landing-muted)]">
                            {plan.detail}
                          </span>
                        </span>
                        <span className="shrink-0 text-[0.875rem] font-semibold tabular-nums tracking-[-0.02em] text-[var(--landing-ink)]">
                          {plan.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-4 text-[0.8125rem] text-[var(--landing-muted)]">
                  Checked {COMPARE_CHECKED_LABEL}.{' '}
                  <a
                    href={competitor.pricing.sourceUrl}
                    className={cn(landingNavLink, 'font-medium text-[var(--landing-ink)]')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {competitor.pricing.sourceLabel}
                  </a>
                </p>
              </article>
            </div>
            {competitor.sources.length > 1 ? (
              <p className="mt-6 text-center text-[0.8125rem] text-[var(--landing-muted)]">
                Sources:{' '}
                {competitor.sources.map((source, index) => (
                  <span key={source.url}>
                    {index > 0 ? ', ' : null}
                    <a
                      href={source.url}
                      className={cn(landingNavLink, 'font-medium text-[var(--landing-ink)]')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.label}
                    </a>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </FadeIn>
      </Section>

      <Section id="verdict" landingDivider labelledBy="verdict-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="verdict-heading" className={landingSectionTitle}>
              The bottom line
            </h2>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{competitor.verdict}</p>
          </div>
          {related.length > 0 ? (
            <ul className={cn('grid gap-4 sm:grid-cols-3', landingContentGap)}>
              {related.map(feature => (
                <li key={feature.slug}>
                  <Link
                    href={featurePath(feature.slug)}
                    className={cn(
                      landingGlassLight,
                      'flex h-full flex-col rounded-[var(--landing-panel-radius)] p-5 transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-white',
                    )}
                  >
                    <span className={cn(landingH3, 'text-[var(--landing-ink)]')}>{feature.name}</span>
                    <span className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>
                      {feature.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <div className={landingContentGap}>
            <CompareNudge competitor={competitor} />
          </div>
        </FadeIn>
      </Section>

      <Section id="faq" landingDivider labelledBy="compare-faq-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="compare-faq-heading" className={landingSectionTitle}>
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
            {competitor.faqs.map((item, index) => (
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
            <h2 id="more-heading" className={landingSectionTitle}>
              Other comparisons
            </h2>
            <p className={cn(landingSectionLead, 'mt-4')}>
              Same questions, different tool. Every page uses dated public sources.
            </p>
          </div>
          <ul className={cn('grid gap-4 sm:grid-cols-2', landingContentGap)}>
            {others.map(other => (
              <li key={other.slug}>
                <CompareCard competitor={other} heading="h3" />
              </li>
            ))}
          </ul>
          <p className={cn(landingBodySm, 'mt-8 text-center text-[var(--landing-muted)] sm:mt-10')}>
            <Link href="/compare" className={landingNavLink}>
              All comparisons
            </Link>
            <span className="mx-2" aria-hidden>
              ·
            </span>
            <Link href="/features" className={landingNavLink}>
              Features
            </Link>
            <span className="mx-2" aria-hidden>
              ·
            </span>
            <Link href="/pricing" className={landingNavLink}>
              Pricing
            </Link>
          </p>
        </FadeIn>
      </Section>

      <LandingFinalCta />
    </>
  )
}
