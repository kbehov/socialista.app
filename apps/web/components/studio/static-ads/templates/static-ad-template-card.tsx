'use client'

import { Button } from '@/components/ui/button'
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
    <article className="group flex flex-col">
      <button
        type="button"
        aria-label={`Preview ${label}`}
        className={cn(
          'relative aspect-[4/5] w-full overflow-hidden rounded-[10px] bg-black/[0.03] text-left',
          'ring-1 ring-black/10 dark:ring-white/12',
          'transition-[box-shadow,transform] duration-200 ease-out',
          'hover:ring-black/18 dark:hover:ring-white/18',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
          'active:scale-[0.985] motion-reduce:active:scale-100 motion-reduce:transition-none',
        )}
        onClick={() => onPreview(template)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.imageUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </button>

      <div className="mt-2 flex min-w-0 flex-col gap-2">
        {template.name ? (
          <p className="truncate text-[13px] font-medium tracking-[-0.015em] text-foreground">{template.name}</p>
        ) : null}

        <Button
          type="button"
          size="sm"
          className={cn(
            'h-8 w-full rounded-lg bg-foreground text-[13px] font-medium tracking-[-0.015em] text-background',
            'hover:bg-foreground/90 active:scale-[0.97] motion-reduce:active:scale-100',
          )}
          onClick={() => onRecreate(template)}
        >
          Recreate
        </Button>
      </div>
    </article>
  )
}
