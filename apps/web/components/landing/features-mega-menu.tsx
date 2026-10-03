import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { LANDING_FEATURES_NAV, LANDING_HEADER } from './content'
import { FEATURE_NAV_ICONS } from './feature-nav-icons'
import type { FeatureSlug } from './features'

export const FEATURES_MEGA_MENU_WIDTH = 'min(56rem, calc(100vw - 2rem))'

export const featuresMegaMenuPanelClass = cn(
  'overflow-hidden rounded-[calc(var(--landing-panel-radius)+2px)] border border-[color-mix(in_srgb,var(--landing-ink)_7%,transparent)] bg-[color-mix(in_srgb,white_94%,var(--landing-canvas))] p-0 shadow-[0_1px_2px_color-mix(in_oklch,var(--landing-ink)_4%,transparent),0_24px_56px_-32px_color-mix(in_oklch,var(--landing-ink)_20%,transparent)] ring-0 backdrop-blur-xl backdrop-saturate-150',
)

function FeatureMegaMenuItem({
  href,
  slug,
  label,
  summary,
}: {
  href: string
  slug: FeatureSlug
  label: string
  summary: string
}) {
  const Icon = FEATURE_NAV_ICONS[slug]

  return (
    <li className="min-w-0">
      <Link
        href={href}
        className={cn(
          'group flex h-full min-h-[5.5rem] flex-col gap-2 rounded-[0.625rem] p-2.5 outline-none',
          'border border-transparent transition-[background-color,border-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
          'hover:border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] hover:bg-[color-mix(in_srgb,var(--landing-stone)_22%,white)]',
          'focus-visible:border-[color-mix(in_srgb,var(--landing-ink)_10%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--landing-stone)_22%,white)] focus-visible:ring-2 focus-visible:ring-[var(--landing-ink)]/12',
        )}
      >
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-[0.5rem]',
            'border border-[color-mix(in_srgb,var(--landing-ink)_7%,transparent)] bg-white text-foreground',
            'shadow-[inset_0_1px_0_0_oklch(1_0_0/0.92)]',
            'transition-[border-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:border-[color-mix(in_srgb,var(--landing-ink)_12%,transparent)]',
          )}
          aria-hidden
        >
          <Icon className="size-3.5 stroke-[1.75]" />
        </span>
        <span className="min-w-0 flex flex-1 flex-col gap-0.5">
          <span className="line-clamp-2 text-[0.8125rem] font-medium leading-[1.25] tracking-[-0.02em] text-foreground">
            {label}
          </span>
          <span className="line-clamp-2 text-[0.6875rem] leading-[1.35] text-muted-foreground">
            {summary}
          </span>
        </span>
      </Link>
    </li>
  )
}

export function FeaturesMegaMenuContent() {
  return (
    <div className="w-full">
      <div className="p-3.5">
        {LANDING_FEATURES_NAV.map((group, groupIndex) => (
          <section
            key={group.id}
            className={cn(
              groupIndex > 0 &&
                'mt-3.5 border-t border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] pt-3.5',
            )}
            aria-labelledby={`features-mega-${group.id}`}
          >
            <h3
              id={`features-mega-${group.id}`}
              className="mb-2 px-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {group.label}
            </h3>
            <ul className="grid grid-cols-4 gap-1.5">
              {group.items.map(item => (
                <FeatureMegaMenuItem key={item.slug} {...item} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="flex h-10 items-center border-t border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] bg-[color-mix(in_srgb,var(--landing-stone)_10%,white)] px-4">
        <Link
          href={LANDING_HEADER.features.overviewHref}
          className="flex w-full items-center justify-between gap-2 rounded-[0.5rem] px-1 text-[0.8125rem] font-medium tracking-[-0.01em] text-foreground outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-foreground/75 focus-visible:ring-2 focus-visible:ring-[var(--landing-ink)]/12"
        >
          {LANDING_HEADER.features.overviewLabel}
          <ChevronRight className="size-3.5 opacity-50" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
