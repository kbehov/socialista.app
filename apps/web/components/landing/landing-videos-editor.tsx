'use client'

import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'
import { useState } from 'react'

import { StudioTemplatePreviewMedia } from '@/components/studio/templates/studio-template-preview-media'
import { VideoTemplateRecreateDialog } from '@/components/studio/videos/video-template-recreate-dialog'
import { isVideoPreviewUrl } from '@/lib/studio/template-media'
import { cn } from '@/lib/utils'
import type { Model, StudioTemplateDto } from '@socialista/types'

import { VIDEOS_SECTION } from './content'
import { SectionCta } from './section-cta'
import {
  landingMediaCardHover,
  landingMediaPanel,
} from './landing-classes'

const ease = 'duration-200 ease-[cubic-bezier(0.2,0,0,1)]'

type LandingVideosEditorProps = {
  templates: StudioTemplateDto[]
  models: Model[]
}

function readableTemplateName(name: string | undefined): string | null {
  const trimmed = name?.trim()
  if (!trimmed) return null
  const compact = trimmed.replace(/[\s-]/g, '')
  if (/^[0-9a-f]{16,}$/i.test(compact)) return null
  return trimmed
}

function templateLabel(template: StudioTemplateDto, index: number): string {
  return readableTemplateName(template.name) ?? `Video ${index + 1}`
}

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function PreviewMedia({
  url,
  autoPlay,
  className,
  alt = '',
}: {
  url: string
  autoPlay?: boolean
  className?: string
  alt?: string
}) {
  return (
    <StudioTemplatePreviewMedia
      key={url}
      url={url}
      alt={alt}
      autoPlay={autoPlay}
      className={cn('absolute inset-0 size-full object-cover', className)}
    />
  )
}

function FeaturedPreview({
  template,
  onRecreate,
}: {
  template: StudioTemplateDto
  onRecreate: () => void
}) {
  const previewIsVideo = isVideoPreviewUrl(template.previewImageUrl)
  const durationSec =
    template.kind === 'video' &&
    template.payload.durationSec &&
    template.payload.durationSec > 0
      ? template.payload.durationSec
      : null

  return (
    <div
      className={cn(
        landingMediaPanel,
        landingMediaCardHover,
        'relative mx-auto aspect-[9/16] w-full max-w-[min(100%,17.5rem)] overflow-hidden sm:max-w-[19.5rem] lg:max-w-[21rem]',
        'shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_32px_72px_-40px_rgba(0,0,0,0.55)]',
      )}
    >
      <PreviewMedia
        url={template.previewImageUrl}
        autoPlay={previewIsVideo}
        alt={readableTemplateName(template.name) ?? 'Video template preview'}
      />
      {previewIsVideo ? null : (
        <span
          className="pointer-events-none absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-sm"
          aria-hidden="true"
        >
          <Play className="size-[1.125rem] translate-x-px fill-white" strokeWidth={0} />
        </span>
      )}
      {durationSec ? (
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/45 px-2 py-0.5 text-[0.6875rem] font-medium tabular-nums tracking-[-0.02em] text-white/90 backdrop-blur-sm">
          {formatDuration(durationSec)}
        </span>
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"
        aria-hidden="true"
      />
      <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2">
        <button
          type="button"
          onClick={onRecreate}
          className={cn(
            'inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full bg-white px-3',
            'text-[0.8125rem] font-medium tracking-[-0.02em] text-[var(--landing-charcoal)]',
            'transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
          )}
        >
          {VIDEOS_SECTION.recreate}
        </button>
      </div>
    </div>
  )
}

function PreviewThumb({
  template,
  index,
  selected,
  onSelect,
}: {
  template: StudioTemplateDto
  index: number
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={templateLabel(template, index)}
      onClick={onSelect}
      className={cn(
        'relative aspect-[9/16] w-[3.25rem] shrink-0 cursor-pointer overflow-hidden rounded-[0.875rem] bg-[#111]',
        'outline outline-1 outline-[oklch(0_0_0/0.1)]',
        'transition-[transform,outline-color,box-shadow] active:scale-[0.96] motion-reduce:active:scale-100',
        ease,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-canvas)]',
        selected &&
          'outline-2 outline-[var(--landing-ink)] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]',
        !selected && 'opacity-80 hover:opacity-100',
      )}
    >
      <PreviewMedia url={template.previewImageUrl} />
    </button>
  )
}

export function LandingVideosEditor({ templates, models }: LandingVideosEditorProps) {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recreateTemplate, setRecreateTemplate] = useState<StudioTemplateDto | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (templates.length === 0) return null

  const selected = templates[selectedIndex] ?? templates[0]!

  const openRecreate = (template: StudioTemplateDto) => {
    if (models.length === 0) {
      router.push(VIDEOS_SECTION.ctaHref)
      return
    }
    setRecreateTemplate(template)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="flex flex-col items-center gap-10 sm:gap-12">
        <FeaturedPreview template={selected} onRecreate={() => openRecreate(selected)} />

        {/* Scroll wrapper + w-max row: centered when it fits, scrollable from the first thumb when it doesn't */}
        <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div role="group" aria-label="Video previews" className="mx-auto flex w-max gap-2 px-1 py-1 sm:gap-2.5">
          {templates.map((template, index) => (
            <PreviewThumb
              key={`${template._id}-${index}`}
              template={template}
              index={index}
              selected={index === selectedIndex}
              onSelect={() => setSelectedIndex(index)}
            />
          ))}
          </div>
        </div>

        <SectionCta label={VIDEOS_SECTION.cta} />
      </div>

      <VideoTemplateRecreateDialog
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
