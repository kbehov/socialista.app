'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { StaticAdTemplateDto } from '@socialista/types'
import { SparklesIcon } from 'lucide-react'

type StaticAdTemplateCardProps = {
  template: StaticAdTemplateDto
  onPreview: (template: StaticAdTemplateDto) => void
  onRecreate: (template: StaticAdTemplateDto) => void
}

export function StaticAdTemplateCard({ template, onPreview, onRecreate }: StaticAdTemplateCardProps) {
  const label = template.name ?? 'Ad template'

  return (
    <article className="group relative overflow-hidden rounded-[1.125rem] bg-muted/20 ring-1 ring-border/45">
      <button
        type="button"
        aria-label={`Preview ${label}`}
        className="relative aspect-[4/5] w-full overflow-hidden text-left active:scale-[0.99] motion-reduce:active:scale-100"
        onClick={() => onPreview(template)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.imageUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80"
        />
      </button>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
        {template.categories.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {template.categories.slice(0, 2).map(category => (
              <Badge
                key={category}
                variant="secondary"
                className="h-5 max-w-full truncate bg-white/15 text-[10px] font-medium text-white ring-1 ring-white/15"
              >
                {category}
              </Badge>
            ))}
          </div>
        ) : null}
        <Button
          type="button"
          size="sm"
          className={cn(
            'pointer-events-auto h-8 w-full rounded-full bg-white text-foreground shadow-sm',
            'hover:bg-white/90 active:scale-[0.97] motion-reduce:active:scale-100',
          )}
          onClick={() => onRecreate(template)}
        >
          <SparklesIcon className="size-3.5" />
          Recreate
        </Button>
      </div>
    </article>
  )
}
