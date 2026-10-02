import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

import { CtaPair } from './cta-pair'
import {
  COMPARE_CELL_LABEL,
  COMPARE_CHECKED_LABEL,
  COMPARE_COMPETITORS,
  COMPARE_FEATURES,
  COMPARE_GROUPS,
  SOCIALISTA_PRICING,
  comparePath,
  type CompareCell,
  type CompareCompetitor,
  type CompareFeatureId,
  type CompareGroupId,
} from './compare'
import { FadeIn } from './fade-in'
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
} from './landing-classes'
import { Section } from './section'

function featuresInGroup(group: CompareGroupId) {
  return COMPARE_FEATURES.filter(feature => feature.group === group)
}

function socialistaNote(feature: (typeof COMPARE_FEATURES)[number]) {
  return 'socialistaNote' in feature ? feature.socialistaNote : undefined
}

function competitorNote(
  notes: Partial<Record<CompareFeatureId, string>> | undefined,
  id: CompareFeatureId,
) {
  return notes?.[id]
}

function CompareCellValue({ cell, note }: { cell: CompareCell; note?: string }) {
  return (
    <>
      <span className="font-medium text-[var(--landing-ink)]">{COMPARE_CELL_LABEL[cell]}</span>
      {note ? (
        <span className="mt-1 block text-[0.75rem] leading-[1.45] font-normal text-[var(--landing-muted)]">
          {note}
        </span>
      ) : null}
    </>
  )
}

function CompareFeatureTable({ competitor }: { competitor: CompareCompetitor }) {
  return (
    <div className={cn(landingInsetPanel, 'overflow-x-auto')}>
      <table className="w-full min-w-[40rem] border-collapse text-left text-[0.875rem]">
        <caption className="sr-only">
          Feature comparison of Socialista and {competitor.name}, checked {COMPARE_CHECKED_LABEL}.
        </caption>
        <thead>
          <tr className="border-b border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]">
            <th scope="col" className="px-4 py-3 text-left font-medium text-[var(--landing-muted)] sm:px-5">
              Feature
            </th>
            <th scope="col" className="w-[28%] px-4 py-3 text-left font-medium text-[var(--landing-ink)] sm:px-5">
              Socialista
            </th>
            <th scope="col" className="w-[34%] px-4 py-3 text-left font-medium text-[var(--landing-ink)] sm:px-5">
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
                <th scope="row" className="px-4 py-3.5 text-left font-medium text-[var(--landing-ink)] sm:px-5">
                  {feature.label}
                </th>
                <td className="px-4 py-3.5 text-[var(--landing-ink)] sm:px-5">
                  <CompareCellValue cell={feature.socialista} note={socialistaNote(feature)} />
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

export function CompareHub() {
  return (
    <>
      <Section>
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>Compare</p>
            <h1 className={landingSectionTitle}>
              Socialista next to{' '}
              <span className={landingSectionTitleAccentSerif}>six other tools.</span>
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>
              What Arcads, MakeUGC, Buffer, Superscale, HeyGen, and Creatify publish about
              themselves, set next to what Socialista ships. Prices are dated{' '}
              {COMPARE_CHECKED_LABEL}.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.06} className={landingContentGap}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPARE_COMPETITORS.map(competitor => (
              <li key={competitor.slug}>
                <Link
                  href={comparePath(competitor.slug)}
                  className={cn(
                    landingGlassLight,
                    'flex h-full flex-col rounded-[var(--landing-panel-radius)] p-5 transition-colors duration-150 hover:bg-white sm:p-6',
                  )}
                >
                  <h2 className={cn(landingH3, 'text-[var(--landing-ink)]')}>
                    Socialista vs {competitor.name}
                  </h2>
                  <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>
                    {competitor.summary}
                  </p>
                  <span className="mt-5 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)]">
                    See the comparison
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Section>
      <LandingFinalCta />
    </>
  )
}

export function CompareDetail({ competitor }: { competitor: CompareCompetitor }) {
  return (
    <>
      <Section>
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>
              <Link href="/compare" className={landingNavLink}>
                Compare
              </Link>
            </p>
            <h1 className={landingSectionTitle}>
              Socialista vs <span className={landingSectionTitleAccentSerif}>{competitor.name}</span>
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{competitor.difference}</p>
          </div>
          <CtaPair className="mt-8 sm:mt-10" showMicroline={false} />
        </FadeIn>
      </Section>

      <Section id="fit" landingDivider labelledBy="fit-heading">
        <FadeIn>
          <h2 id="fit-heading" className="sr-only">
            When each tool fits
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <article className={cn(landingGlassLight, 'rounded-[var(--landing-panel-radius)] p-5 sm:p-6')}>
              <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>Choose Socialista if</h3>
              <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>
                {competitor.bestForSocialista}
              </p>
            </article>
            <article className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
              <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>Choose {competitor.name} if</h3>
              <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>
                {competitor.bestForThem}
              </p>
            </article>
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
              Yes, No, and Partial are stated on a public page or in the product. Not listed means
              the page we checked did not mention it. That is not a claim the feature is missing.
            </p>
          </div>
          <div className={landingContentGap}>
            <CompareFeatureTable competitor={competitor} />
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
                <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>Socialista</h3>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{SOCIALISTA_PRICING}</p>
              </article>
              <article className={cn(landingInsetPanel, 'p-5 sm:p-6')}>
                <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>{competitor.name}</h3>
                <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>
                  {competitor.pricing.summary}
                </p>
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

      <LandingFinalCta />
    </>
  )
}
