'use client'

import Image from 'next/image'
import { useState } from 'react'

import { ImageTemplateRecreateDialog } from '@/components/studio/images/image-template-recreate-dialog'
import { cn } from '@/lib/utils'
import type { Model, StudioTemplateDto } from '@socialista/types'

import { IMAGE_TEMPLATES_SECTION } from './content'
import { SectionCta } from './section-cta'
import { landingGlass } from './landing-classes'

const IMAGE_QUALITY = 80

const MASONRY_RATIOS = ['3 / 4', '4 / 5', '1 / 1', '5 / 6', '9 / 16', '4 / 3', '2 / 3', '5 / 4'] as const

type LandingImageTemplatesShowcaseProps = {
  templates: StudioTemplateDto[]
  models: Model[]
}

function MasonryTile({
  template,
  index,
  onRecreate,
}: {
  template: StudioTemplateDto
  index: number
  onRecreate: (template: StudioTemplateDto) => void
}) {
  const aspectRatio = MASONRY_RATIOS[index % MASONRY_RATIOS.length]

  return (
    <article
      className={cn(
        'group/card relative mb-3 w-full overflow-hidden rounded-[var(--landing-media-radius)] bg-[var(--landing-media-dark)] sm:mb-3.5',
        'shadow-[0_0_0_1px_oklch(0_0_0/0.1),0_16px_36px_-24px_rgb(0_0_0/0.38)]',
        'outline outline-1 outline-[oklch(0_0_0/0.1)]',
        'break-inside-avoid',
        'transition-[transform,box-shadow] duration-220 ease-[cubic-bezier(0.2,0,0,1)]',
        'hover:shadow-[0_0_0_1px_oklch(0_0_0/0.1),0_22px_48px_-22px_rgb(0_0_0/0.45)]',
      )}
      style={{ aspectRatio }}
    >
      <Image
        src={template.previewImageUrl}
        alt={template.name?.trim() || 'Image template preview'}
        fill
        quality={IMAGE_QUALITY}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-[transform,filter] duration-220 ease-[cubic-bezier(0.2,0,0,1)] pointer-fine:group-hover/card:scale-[1.04] pointer-fine:group-hover/card:brightness-[1.03]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-80 transition-opacity duration-300 group-hover/card:opacity-100"
        aria-hidden="true"
      />
      <button
        type="button"
        aria-label={template.name ? `Recreate ${template.name}` : 'Recreate this template'}
        onClick={event => {
          event.stopPropagation()
          onRecreate(template)
        }}
        className={cn(
          landingGlass,
          'absolute inset-x-2.5 bottom-2.5 z-10 inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3',
          'text-[0.8125rem] font-medium tracking-[-0.015em] text-white',
          'shadow-[0_2px_10px_rgba(0,0,0,0.28)]',
          'transition-[opacity,transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
          'hover:bg-white/[0.16] active:scale-[0.96] motion-reduce:active:scale-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
          'opacity-100 pointer-fine:translate-y-0.5 pointer-fine:opacity-0',
          'pointer-fine:group-hover/card:translate-y-0 pointer-fine:group-hover/card:opacity-100',
          'pointer-fine:group-focus-within/card:translate-y-0 pointer-fine:group-focus-within/card:opacity-100',
        )}
      >
        Recreate
      </button>
    </article>
  )
}

export function LandingImageTemplatesShowcase({ templates, models }: LandingImageTemplatesShowcaseProps) {
  const [recreateTemplate, setRecreateTemplate] = useState<StudioTemplateDto | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const openRecreate = (template: StudioTemplateDto) => {
    setRecreateTemplate(template)
    setDialogOpen(true)
  }

  if (templates.length === 0) return null

  return (
    <>
      <div className="flex flex-col gap-8 sm:gap-10">
        <ul
          className={cn(
            'columns-2 list-none gap-3 p-0 sm:columns-3 sm:gap-3.5 lg:columns-4 lg:gap-4',
            '[column-fill:balance]',
          )}
        >
          {templates.map((template, index) => (
            <li key={`${template._id}-${index}`} className="break-inside-avoid">
              <MasonryTile
                template={template}
                index={index}
                onRecreate={openRecreate}
              />
            </li>
          ))}
        </ul>

        <div className="flex justify-center pt-0.5">
          <SectionCta label={IMAGE_TEMPLATES_SECTION.cta} />
        </div>
      </div>

      <ImageTemplateRecreateDialog
        template={recreateTemplate}
        open={dialogOpen}
        onOpenChange={open => {
          setDialogOpen(open)
          if (!open) setRecreateTemplate(null)
        }}
        models={models}
      />
    </>
  )
}
