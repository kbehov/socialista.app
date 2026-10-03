import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ReactNode } from 'react'

import {
  landingBodySm,
  landingEyebrow,
  landingFooterLink,
  landingGlassLight,
  landingH2,
  landingSection,
  landingSectionDivider,
} from './landing-classes'

export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: readonly string[] }

export type LegalSection = {
  id: string
  title: string
  blocks: readonly LegalBlock[]
}

export type LegalDocumentMeta = {
  title: string
  description: string
  effectiveDate: string
  lastUpdated: string
  intro: readonly string[]
  sections: readonly LegalSection[]
}

const legalTocLink =
  'block rounded-sm py-1.5 pl-3 text-[0.8125rem] leading-snug tracking-[-0.01em] text-[var(--landing-muted)] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-[var(--landing-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)] border-l border-transparent hover:border-[color-mix(in_srgb,var(--landing-ink)_12%,transparent)]'

const legalProse =
  'text-[0.9375rem] leading-[1.75] tracking-[-0.01em] text-[color-mix(in_srgb,var(--landing-ink)_82%,var(--landing-muted))]'

const legalList =
  'mt-4 list-disc space-y-2.5 pl-5 marker:text-[color-mix(in_srgb,var(--landing-ink)_35%,var(--landing-muted))]'

function isSafeHref(href: string) {
  return (
    href.startsWith('/') ||
    href.startsWith('mailto:') ||
    href.startsWith('https://') ||
    href.startsWith('#')
  )
}

function LegalRichText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    const label = match[1]
    const href = match[2]
    if (isSafeHref(href)) {
      if (href.startsWith('/') || href.startsWith('#')) {
        nodes.push(
          <Link key={`${match.index}-${href}`} href={href} className={cn(landingFooterLink, 'text-[inherit] underline-offset-2')}>
            {label}
          </Link>,
        )
      } else {
        nodes.push(
          <a
            key={`${match.index}-${href}`}
            href={href}
            className={cn(landingFooterLink, 'text-[inherit] underline-offset-2')}
          >
            {label}
          </a>,
        )
      }
    } else {
      nodes.push(label)
    }
    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return <>{nodes}</>
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === 'list') {
    return (
      <ul className={legalList}>
        {block.items.map(item => (
          <li key={item} className="text-pretty">
            <LegalRichText text={item} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className={cn(legalProse, 'text-pretty')}>
      <LegalRichText text={block.text} />
    </p>
  )
}

function LegalToc({ sections }: { sections: readonly LegalSection[] }) {
  return (
    <ol className="mt-4 flex flex-col gap-0.5">
      {sections.map((section, index) => (
        <li key={section.id}>
          <a href={`#${section.id}`} className={legalTocLink}>
            <span className="tabular-nums text-[color-mix(in_srgb,var(--landing-ink)_40%,var(--landing-muted))]">
              {index + 1}.
            </span>{' '}
            {section.title}
          </a>
        </li>
      ))}
    </ol>
  )
}

export function LegalDocument({ meta }: { meta: LegalDocumentMeta }) {
  const { title, description, effectiveDate, lastUpdated, intro, sections } = meta

  return (
    <article className={cn(landingSectionDivider, 'border-b border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] bg-[var(--landing-canvas)]')}>
      <header className={cn(landingSection, 'pt-16 pb-10 sm:pt-20 sm:pb-12 lg:pt-24')}>
        <p className={landingEyebrow}>Legal</p>
        <h1 className={cn(landingH2, 'mt-4 max-w-3xl text-[var(--landing-ink)]')}>{title}</h1>
        <p className={cn(landingBodySm, 'mt-4 max-w-2xl text-[var(--landing-muted)]')}>{description}</p>
        <dl
          className={cn(
            landingGlassLight,
            'mt-8 flex max-w-xl flex-col gap-3 rounded-[var(--landing-panel-radius)] px-5 py-4 sm:flex-row sm:gap-8 sm:px-6',
          )}
        >
          <div>
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--landing-muted)]">
              Effective
            </dt>
            <dd className="mt-1 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)]">{effectiveDate}</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--landing-muted)]">
              Last updated
            </dt>
            <dd className="mt-1 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)]">{lastUpdated}</dd>
          </div>
        </dl>
      </header>

      <div className={cn(landingSection, 'pb-20 sm:pb-24 lg:pb-28')}>
        <div className="lg:grid lg:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)] lg:gap-x-14 xl:gap-x-20">
          <nav
            aria-label="Table of contents"
            className="mb-10 lg:sticky lg:top-28 lg:mb-0 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:pb-8"
          >
            <p className={landingEyebrow}>Contents</p>
            <div className="hidden lg:block">
              <LegalToc sections={sections} />
            </div>
            <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
              {sections.map(section => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="inline-flex shrink-0 items-center rounded-full border border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] bg-white px-3.5 py-2 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)]"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="min-w-0">
            <div className={cn('flex flex-col gap-4 border-b border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] pb-10', legalProse)}>
              {intro.map(paragraph => (
                <p key={paragraph} className="text-pretty font-medium text-[var(--landing-ink)]">
                  <LegalRichText text={paragraph} />
                </p>
              ))}
            </div>

            <div className="mt-12 flex flex-col gap-14 sm:gap-16">
              {sections.map(section => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.03em] text-[var(--landing-ink)] sm:text-[1.375rem]">
                    {section.title}
                  </h2>
                  <div className="mt-5 flex flex-col gap-4">
                    {section.blocks.map((block, index) => (
                      <LegalBlockView key={`${section.id}-${index}`} block={block} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
