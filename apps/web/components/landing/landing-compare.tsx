import { cn } from '@/lib/utils'
import { Check, Minus, X } from 'lucide-react'
import Link from 'next/link'

import { COMPARE_CELL_LABEL, type CompareCell } from './compare'
import { HOME_COMPARE } from './content'
import { FadeIn } from './fade-in'
import {
  landingContentGap,
  landingEyebrow,
  landingNavLink,
} from './landing-classes'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'

const socialistaCol = 'bg-[color-mix(in_srgb,var(--landing-ink)_3.5%,white)]'

function CompareMark({ cell }: { cell: CompareCell }) {
  const label = COMPARE_CELL_LABEL[cell]

  if (cell === 'yes') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--accent-orange)_12%,transparent)] text-[var(--landing-ink)]">
        <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
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
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--landing-ink)_5%,transparent)] text-[var(--landing-muted)]">
      <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

function cellFor(row: (typeof HOME_COMPARE.rows)[number], columnId: (typeof HOME_COMPARE.columns)[number]['id']) {
  return row.cells[columnId]
}

export function LandingCompare() {
  return (
    <Section id="compare" landingDivider alt labelledBy="compare-heading">
      <FadeIn>
        <LandingSectionIntro
          titleId="compare-heading"
          eyebrow={HOME_COMPARE.eyebrow}
          title={HOME_COMPARE.title}
          titleAccent={HOME_COMPARE.titleAccent}
          description={HOME_COMPARE.description}
        />
      </FadeIn>

      <FadeIn delay={0.06} className={landingContentGap}>
        <div className="hidden overflow-hidden rounded-[var(--landing-panel-radius)] border border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] bg-white shadow-[0_1px_2px_color-mix(in_oklch,var(--landing-ink)_4%,transparent)] md:block">
          <table className="w-full border-collapse text-left text-[0.875rem]">
            <caption className="sr-only">
              Socialista compared with a typical fragmented create-and-publish workflow.
            </caption>
            <thead>
              <tr className="border-b border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]">
                <th scope="col" className="px-5 py-3.5 text-left font-medium text-[var(--landing-muted)]">
                  <span className="sr-only">Capability</span>
                </th>
                {HOME_COMPARE.columns.map(column => (
                  <th
                    key={column.id}
                    scope="col"
                    className={cn(
                      'px-4 py-3.5 text-center font-medium text-[var(--landing-ink)]',
                      column.id === 'socialista' && cn(socialistaCol, 'font-semibold'),
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOME_COMPARE.rows.map(row => (
                <tr
                  key={row.label}
                  className="border-t border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]"
                >
                  <th scope="row" className="px-5 py-4 text-left font-medium text-[var(--landing-ink)]">
                    {row.label}
                  </th>
                  {HOME_COMPARE.columns.map(column => (
                    <td
                      key={column.id}
                      className={cn('px-4 py-4 text-center', column.id === 'socialista' && socialistaCol)}
                    >
                      <CompareMark cell={cellFor(row, column.id)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="flex list-none flex-col gap-3 p-0 md:hidden">
          {HOME_COMPARE.rows.map(row => (
            <li
              key={row.label}
              className="rounded-[var(--landing-panel-radius)] border border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] bg-white p-4"
            >
              <p className="font-medium tracking-[-0.01em] text-[var(--landing-ink)]">{row.label}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {HOME_COMPARE.columns.map(column => (
                  <div
                    key={column.id}
                    className={cn(
                      'rounded-[var(--landing-inset-radius)] px-3 py-2.5',
                      column.id === 'socialista' ? socialistaCol : 'bg-[var(--landing-surface-muted)]',
                    )}
                  >
                    <dt className={cn(landingEyebrow, 'mb-2')}>{column.label}</dt>
                    <dd>
                      <CompareMark cell={cellFor(row, column.id)} />
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-sm text-[var(--landing-muted)]">
          {HOME_COMPARE.footnote}{' '}
          <Link href={HOME_COMPARE.footnoteHref} className={landingNavLink}>
            {HOME_COMPARE.footnoteLabel}
          </Link>
        </p>
      </FadeIn>
    </Section>
  )
}
