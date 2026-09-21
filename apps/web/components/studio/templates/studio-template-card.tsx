'use client'

import { StudioTemplatePreviewMedia } from '@/components/studio/templates/studio-template-preview-media'
import { CoverCard } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { StudioTemplateDto } from '@socialista/types'

export type StudioTemplateCardVariant = 'default' | 'visual'

type StudioTemplateCardProps = {
  template: StudioTemplateDto
  onPreview: (template: StudioTemplateDto) => void
  onRecreate: (template: StudioTemplateDto) => void
  openLabel?: string
  variant?: StudioTemplateCardVariant
}

export function StudioTemplateCard({
  template,
  onPreview,
  onRecreate,
  openLabel = 'Preview',
  variant = 'default',
}: StudioTemplateCardProps) {
  const isVisual = variant === 'visual'
  const label = template.name ?? 'Template'
  const previewAriaLabel = isVisual ? `${openLabel} inspiration` : `${openLabel} ${label}`
  const recreateAriaLabel = isVisual ? 'Recreate this inspiration' : `Recreate ${label}`

  return (
    <CoverCard
      ariaLabel={previewAriaLabel}
      onClick={() => onPreview(template)}
      coverClassName={cn(
        isVisual ? 'rounded-2xl' : 'rounded-xl',
        isVisual &&
          'hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.1)]',
        !isVisual && 'ring-1 ring-black/8 hover:ring-black/16 dark:ring-white/10 dark:hover:ring-white/18',
      )}
      media={
        <StudioTemplatePreviewMedia
          url={template.previewImageUrl}
          alt=""
          className={cn(
            'size-full outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10',
            'transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
            'group-hover/card:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100',
            isVisual && 'group-hover/card:scale-[1.03]',
          )}
        />
      }
      gradient={
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 via-black/20 to-transparent',
            isVisual ? 'h-20 opacity-70' : 'h-16 opacity-0',
            'transition-opacity duration-200',
            !isVisual && 'group-hover/card:opacity-100',
            'group-focus-within/card:opacity-100 motion-reduce:transition-none',
          )}
        />
      }
      overlay={
        <button
          type="button"
          aria-label={recreateAriaLabel}
          onClick={event => {
            event.stopPropagation()
            onRecreate(template)
          }}
          className={cn(
            'absolute z-10 inline-flex cursor-pointer items-center justify-center gap-1.5',
            isVisual ? 'inset-x-2.5 bottom-2.5 h-8 rounded-xl px-3' : 'inset-x-2 bottom-2 h-7 rounded-lg px-2.5',
            'bg-black/60 text-[12px] font-medium tracking-[-0.015em] text-white backdrop-blur-md',
            'shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
            'transition-[opacity,transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
            'hover:bg-black/75 active:scale-[0.96] motion-reduce:active:scale-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            isVisual
              ? 'opacity-100'
              : cn(
                  'opacity-100 pointer-fine:pointer-events-none pointer-fine:opacity-0',
                  'pointer-fine:group-hover/card:pointer-events-auto pointer-fine:group-hover/card:opacity-100',
                  'pointer-fine:group-focus-within/card:pointer-events-auto pointer-fine:group-focus-within/card:opacity-100',
                ),
          )}
        >
          Recreate
        </button>
      }
      title={
        !isVisual && template.name ? (
          <p className="mt-2 truncate px-0.5 text-[13px] font-medium leading-snug tracking-[-0.015em] text-foreground">
            {template.name}
          </p>
        ) : null
      }
    />
  )
}

export function StudioTemplateCardSkeleton({
  variant = 'default',
}: {
  variant?: StudioTemplateCardVariant
}) {
  const isVisual = variant === 'visual'

  return (
    <div className="animate-pulse">
      <div
        className={cn(
          'aspect-[4/5] w-full bg-black/[0.04] dark:bg-white/[0.04]',
          isVisual ? 'rounded-2xl' : 'rounded-xl',
          'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.08)]',
        )}
      />
      {!isVisual ? (
        <div className="mt-2 h-3.5 w-3/4 rounded-md bg-black/[0.06] dark:bg-white/[0.06]" />
      ) : null}
    </div>
  )
}
