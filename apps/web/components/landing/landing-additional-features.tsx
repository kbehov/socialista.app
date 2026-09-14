import { Layers, Sparkles, Store, Target, Wand2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { ADDITIONAL_FEATURES, type AdditionalFeatureId } from './content'
import { FadeIn } from './fade-in'
import {
  landingBentoTintGuest,
  landingBentoTintNeutral,
  landingBentoTintOrange,
  landingBentoTintOrangeSoft,
  landingBentoTintSubtle,
  landingBody,
  landingContentGap,
  landingH3,
} from './landing-classes'
import { Section, sectionHeadingId } from './section'
import { SectionHeader } from './section-header'

const GRID_SPAN: Record<AdditionalFeatureId, string> = {
  'brand-profile': 'lg:col-span-2',
  'post-composer': 'lg:col-span-2',
  'content-calendar': 'lg:col-span-2',
  'video-editor': 'lg:col-span-2',
  skills: 'lg:col-span-2',
  products: 'lg:col-span-2',
}

const TINT: Record<AdditionalFeatureId, string> = {
  'brand-profile': landingBentoTintOrange,
  'post-composer': landingBentoTintOrangeSoft,
  'content-calendar': landingBentoTintNeutral,
  'video-editor': landingBentoTintGuest,
  skills: landingBentoTintGuest,
  products: landingBentoTintSubtle,
}

const mockSurface =
  'rounded-2xl border border-[color-mix(in_oklch,var(--foreground)_6%,var(--border))] bg-background shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--foreground)_18%,transparent)]'

function BentoTile({
  title,
  description,
  tint,
  delay,
  titleId,
  children,
}: {
  title: string
  description: string
  tint: string
  delay: number
  titleId: string
  children: ReactNode
}) {
  return (
    <FadeIn delay={delay} className="flex h-full flex-col">
      <div
        className={cn(
          'flex min-h-[17.5rem] flex-1 flex-col overflow-hidden rounded-[1.5rem] p-4 sm:min-h-[19rem] sm:p-5',
          tint,
        )}
      >
        <div className="relative flex min-h-0 flex-1 items-center justify-center">{children}</div>
      </div>
      <div className="mt-4 px-0.5 sm:mt-5">
        <h3 id={titleId} className={cn(landingH3, 'text-base sm:text-lg')}>{title}</h3>
        <p className={cn(landingBody, 'mt-2 max-w-none text-[0.9375rem] leading-[1.6]')}>{description}</p>
      </div>
    </FadeIn>
  )
}

function BrandProfileVisual() {
  const rows = [
    { icon: Target, label: 'Your market is fitness lovers' },
    { icon: Layers, label: 'Top formats: UGC hooks & carousels' },
    { icon: Sparkles, label: 'Voice: direct, upbeat, proof-first' },
    { icon: Store, label: 'These are your closest competitors' },
  ]

  return (
    <div className="flex w-full max-w-[15.5rem] flex-col gap-2 sm:max-w-[17rem] sm:gap-2.5">
      {rows.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className={cn(mockSurface, 'flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-3')}
        >
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--muted)_60%,var(--background))] text-foreground"
            aria-hidden
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          <span className="text-[0.8125rem] font-medium leading-snug tracking-[-0.01em] text-foreground sm:text-sm">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

function PostComposerVisual() {
  const actions = ['Remix trending content', 'Create TikTok slideshow', 'Post directly']

  return (
    <div className={cn(mockSurface, 'w-full max-w-[16rem] p-4 sm:max-w-[17.5rem] sm:p-5')}>
      <p className="text-center text-sm font-semibold tracking-[-0.02em]">Generate</p>
      <ul className="mt-3 flex list-none flex-col gap-2 p-0">
        {actions.map(action => (
          <li key={action}>
            <span
              className="flex w-full items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--foreground)_8%,var(--border))] bg-[color-mix(in_oklch,var(--muted)_35%,var(--background))] px-3 py-2 text-[0.75rem] font-medium tracking-[-0.01em] text-foreground sm:text-[0.8125rem]"
            >
              {action}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContentCalendarVisual() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const active = new Set([1, 3, 5])

  return (
    <div className={cn(mockSurface, 'w-full max-w-[18rem] p-4 sm:p-5')}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold tracking-[-0.02em]">Repeat weekly</p>
        <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[0.625rem] font-medium text-background">
          On
        </span>
      </div>
      <div className="mt-4 flex justify-between gap-1">
        {days.map((day, index) => (
          <div key={`${day}-${index}`} className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-[0.6875rem] font-semibold sm:size-9',
                active.has(index)
                  ? 'bg-foreground text-background'
                  : 'bg-[color-mix(in_oklch,var(--muted)_50%,var(--background))] text-muted-foreground',
              )}
            >
              {day}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-1.5 text-[0.6875rem] text-muted-foreground sm:text-xs">
        <p>
          <span className="font-medium text-foreground">Start</span> Tue, 9:00 AM
        </p>
        <p>
          <span className="font-medium text-foreground">Next</span> Instagram + TikTok
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <span className="flex-1 rounded-full border border-border py-2 text-center text-xs font-medium">Cancel</span>
        <span className="flex-1 rounded-full bg-foreground py-2 text-center text-xs font-medium text-background">
          Save
        </span>
      </div>
    </div>
  )
}

function VideoEditorVisual() {
  return (
    <div className={cn(mockSurface, 'w-full max-w-[17rem] overflow-hidden p-3 sm:max-w-[18rem]')}>
      <div className="aspect-video rounded-lg bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))]" />
      <div className="mt-3 flex gap-1">
        {[32, 48, 28, 40].map((width, index) => (
          <div
            key={index}
            className={cn(
              'h-8 rounded-md',
              index === 1 ? 'bg-foreground/90' : 'bg-[color-mix(in_oklch,var(--muted)_50%,var(--background))]',
            )}
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[0.625rem] text-muted-foreground sm:text-[0.6875rem]">
        <span>0:04</span>
        <span className="font-medium text-foreground">Captions · Export</span>
        <span>0:18</span>
      </div>
    </div>
  )
}

function SkillsVisual() {
  const skills = ['Hook in 3s', 'No hashtag spam', 'UGC pacing', 'Brand-safe tone', 'Carousel swipe']

  return (
    <div className="flex w-full flex-wrap justify-center gap-2 px-2 sm:gap-2.5">
      {skills.map(skill => (
        <span
          key={skill}
          className={cn(
            mockSurface,
            'inline-flex items-center gap-1.5 px-3 py-2 text-[0.75rem] font-medium tracking-[-0.01em] sm:text-[0.8125rem]',
          )}
        >
          <Wand2 className="size-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          {skill}
        </span>
      ))}
    </div>
  )
}

function ProductsVisual() {
  const items = [
    { name: 'Ceramic mug', price: '$24' },
    { name: 'Protein bundle', price: '$49' },
    { name: 'Summer tee', price: '$32' },
  ]

  return (
    <div className="flex w-full max-w-[20rem] flex-col gap-2 sm:max-w-[22rem]">
      {items.map(item => (
        <div
          key={item.name}
          className={cn(mockSurface, 'flex items-center gap-3 px-3 py-2.5 sm:px-3.5')}
        >
          <div className="size-10 shrink-0 rounded-lg bg-[color-mix(in_oklch,var(--muted)_60%,var(--background))]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium tracking-[-0.02em]">{item.name}</p>
            <p className="text-xs text-muted-foreground">Used in 4 active ads</p>
          </div>
          <span className="text-sm font-semibold tabular-nums">{item.price}</span>
        </div>
      ))}
    </div>
  )
}

const VISUALS: Record<AdditionalFeatureId, () => ReactNode> = {
  'brand-profile': BrandProfileVisual,
  'post-composer': PostComposerVisual,
  'content-calendar': ContentCalendarVisual,
  'video-editor': VideoEditorVisual,
  skills: SkillsVisual,
  products: ProductsVisual,
}

export function LandingAdditionalFeatures() {
  const headingId = sectionHeadingId('features')

  return (
    <Section id="features" border alt>
      <FadeIn>
        <SectionHeader
          titleId={headingId}
          title={ADDITIONAL_FEATURES.title}
          description={ADDITIONAL_FEATURES.description}
          align="center"
        />
      </FadeIn>

      <ul
        className={cn(
          landingContentGap,
          'relative grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6 lg:gap-5',
        )}
      >
        {ADDITIONAL_FEATURES.cards.map((card, index) => {
          const Visual = VISUALS[card.id]
          const titleId = `feature-${card.id}-title`

          return (
            <li key={card.id} className={cn('min-h-0', GRID_SPAN[card.id])}>
              <article aria-labelledby={titleId}>
                <BentoTile
                  title={card.title}
                  description={card.description}
                  tint={TINT[card.id]}
                  delay={0.04 + index * 0.03}
                  titleId={titleId}
                >
                  <Visual />
                </BentoTile>
              </article>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
