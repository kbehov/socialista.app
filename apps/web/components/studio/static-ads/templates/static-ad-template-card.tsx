'use client'

import { cn } from '@/lib/utils'
import type { StaticAdTemplateDto } from '@socialista/types'

type StaticAdTemplateCardProps = {
  template: StaticAdTemplateDto
  onPreview: (template: StaticAdTemplateDto) => void
  onRecreate: (template: StaticAdTemplateDto) => void
}

export function StaticAdTemplateCard({ template, onPreview, onRecreate }: StaticAdTemplateCardProps) {
  const label = template.name ?? 'Ad template'

  return (
    <article className="group/card">
      <div className="relative">
        <button
          type="button"
          aria-label={`Preview ${label}`}
          className={cn(
            'relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black/[0.04] text-left',
            'ring-1 ring-black/8 dark:bg-white/[0.04] dark:ring-white/10',
            'transition-[box-shadow,ring-color,transform] duration-150',
            'hover:ring-black/16 dark:hover:ring-white/18',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
            'active:scale-[0.98] motion-reduce:active:scale-100',
          )}
          onClick={() => onPreview(template)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={template.imageUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 motion-reduce:transition-none"
          />
        </button>

        <button
          type="button"
          aria-label={`Recreate ${label}`}
          onClick={event => {
            event.stopPropagation()
            onRecreate(template)
          }}
          className={cn(
            'absolute inset-x-2 bottom-2 z-10 h-7 rounded-lg px-2.5',
            'bg-black/55 text-[12px] font-medium tracking-[-0.015em] text-white backdrop-blur-sm',
            'transition-[opacity,transform,background-color] duration-150',
            'hover:bg-black/70 active:scale-[0.98] motion-reduce:active:scale-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
            'opacity-100 pointer-fine:pointer-events-none pointer-fine:opacity-0',
            'pointer-fine:group-hover/card:pointer-events-auto pointer-fine:group-hover/card:opacity-100',
            'pointer-fine:group-focus-within/card:pointer-events-auto pointer-fine:group-focus-within/card:opacity-100',
          )}
        >
          Recreate
        </button>
      </div>

      {template.name ? (
        <p className="mt-2 truncate px-0.5 text-[13px] font-medium leading-snug tracking-[-0.015em] text-foreground">
          {template.name}
        </p>
      ) : null}
    </article>
  )
}

export function StaticAdTemplateCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] w-full rounded-xl bg-black/[0.04] ring-1 ring-black/8 dark:bg-white/[0.04] dark:ring-white/10" />
      <div className="mt-2 h-3.5 w-3/4 rounded-md bg-black/[0.06] dark:bg-white/[0.06]" />
    </div>
  )
}
