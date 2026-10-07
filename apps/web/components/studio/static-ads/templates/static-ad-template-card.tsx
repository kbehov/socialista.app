'use client'

import { cn } from '@/lib/utils'
import type { StaticAdTemplateDto } from '@socialista/types'
import { EyeIcon } from 'lucide-react'
import { useState } from 'react'

type StaticAdTemplateCardProps = {
  template: StaticAdTemplateDto
  onPreview: (template: StaticAdTemplateDto) => void
  onRecreate: (template: StaticAdTemplateDto) => void
  entranceIndex?: number
  appendEntrance?: boolean
}

const ENTER_STAGGER_LIMIT = 12

const actionButtonClass = cn(
  'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl px-2',
  'text-[12px] font-medium tracking-[-0.015em] text-white backdrop-blur-md',
  'shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
  'transition-[opacity,transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
  'active:scale-[0.96] motion-reduce:active:scale-100',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
  'opacity-100 pointer-fine:pointer-events-none pointer-fine:opacity-0',
  'pointer-fine:group-hover/card:pointer-events-auto pointer-fine:group-hover/card:opacity-100',
  'pointer-fine:group-focus-within/card:pointer-events-auto pointer-fine:group-focus-within/card:opacity-100',
)

export function StaticAdTemplateCard({
  template,
  onPreview,
  onRecreate,
  entranceIndex,
  appendEntrance,
}: StaticAdTemplateCardProps) {
  const categoryEyebrow = template.categories[0]
  const [loaded, setLoaded] = useState(false)

  const showEntrance =
    entranceIndex !== undefined && entranceIndex < ENTER_STAGGER_LIMIT && !appendEntrance

  return (
    <article
      role="listitem"
      className={cn(
        'group/card',
        showEntrance &&
          'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:ease-out motion-safe:[animation-fill-mode:backwards] motion-reduce:animate-none',
        appendEntrance &&
          'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200 motion-safe:ease-out motion-reduce:animate-none',
      )}
      style={showEntrance ? { animationDelay: `${entranceIndex * 40}ms` } : undefined}
    >
      <div
        className={cn(
          'relative transition-[box-shadow] duration-200 ease-out motion-reduce:transition-none',
          'pointer-fine:group-hover/card:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]',
          'pointer-fine:dark:group-hover/card:shadow-[0_2px_8px_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.35)]',
        )}
      >
        <button
          type="button"
          aria-label="Preview ad template"
          className={cn(
            'relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black/[0.04] text-left',
            'outline outline-1 -outline-offset-1 outline-black/10 dark:bg-white/[0.04] dark:outline-white/10',
            'transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
            'active:scale-[0.96] motion-reduce:active:scale-100',
          )}
          onClick={() => onPreview(template)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={template.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setLoaded(true)}
            className={cn(
              'size-full object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10',
              'transition-[opacity,transform,filter] duration-300 ease-out',
              'pointer-fine:group-hover/card:scale-[1.02] motion-reduce:transition-none motion-reduce:pointer-fine:group-hover/card:scale-100',
              loaded
                ? 'opacity-100 blur-0 scale-100'
                : 'opacity-0 blur-[4px] scale-[1.02] motion-reduce:opacity-100 motion-reduce:blur-0 motion-reduce:scale-100',
            )}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 group-focus-within/card:opacity-100 motion-reduce:transition-none"
          />
        </button>

        <div className="absolute inset-x-2.5 bottom-2.5 z-10 flex gap-1.5">
          <button
            type="button"
            aria-label="Preview ad template"
            onClick={event => {
              event.stopPropagation()
              onPreview(template)
            }}
            className={cn(actionButtonClass, 'bg-black/55 hover:bg-black/70')}
          >
            <EyeIcon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="hidden min-[380px]:inline">Preview</span>
          </button>
          <button
            type="button"
            aria-label="Recreate ad template"
            onClick={event => {
              event.stopPropagation()
              onRecreate(template)
            }}
            className={cn(actionButtonClass, 'bg-black/70 hover:bg-black/85')}
          >
            Recreate
          </button>
        </div>
      </div>

      {categoryEyebrow ? (
        <p className="mt-2 truncate px-0.5 text-[11px] font-medium leading-none tracking-[-0.01em] text-black/42 dark:text-white/42">
          {categoryEyebrow}
        </p>
      ) : null}
    </article>
  )
}

export function StaticAdTemplateCardSkeleton() {
  return (
    <div className="animate-pulse" role="listitem">
      <div className="aspect-[4/5] w-full rounded-2xl bg-black/[0.04] outline outline-1 -outline-offset-1 outline-black/10 dark:bg-white/[0.04] dark:outline-white/10" />
      <div className="mt-2 h-2.5 w-1/3 rounded-md bg-black/[0.06] dark:bg-white/[0.06]" />
    </div>
  )
}
