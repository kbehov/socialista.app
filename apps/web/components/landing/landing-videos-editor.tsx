'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Captions, Copy, Play, Scissors, Type } from 'lucide-react'
import { useState } from 'react'

import { StudioTemplatePreviewMedia } from '@/components/studio/templates/studio-template-preview-media'
import { VideoTemplateRecreateDialog } from '@/components/studio/videos/video-template-recreate-dialog'
import { Button } from '@/components/ui/button'
import { isVideoPreviewUrl } from '@/lib/studio/template-media'
import { cn } from '@/lib/utils'
import type { Model, StudioTemplateDto } from '@socialista/types'

import { VIDEOS_SECTION } from './content'
import { landingCtaPrimary } from './landing-classes'

const ease = 'duration-150 ease-[cubic-bezier(0.2,0,0,1)]'

const WAVEFORM_HEIGHTS = Array.from({ length: 40 }, (_, index) => 4 + ((index * 17) % 10))

type LandingVideosEditorProps = {
  templates: StudioTemplateDto[]
  models: Model[]
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function readableTemplateName(name: string | undefined): string | null {
  const trimmed = name?.trim()
  if (!trimmed) return null
  const compact = trimmed.replace(/[\s-]/g, '')
  if (/^[0-9a-f]{16,}$/i.test(compact)) return null
  return trimmed
}

function templateLabel(template: StudioTemplateDto, index: number): string {
  return readableTemplateName(template.name) ?? `Video template ${index + 1}`
}

function PreviewMedia({ url, autoPlay }: { url: string; autoPlay?: boolean }) {
  return (
    <StudioTemplatePreviewMedia
      key={url}
      url={url}
      alt=""
      autoPlay={autoPlay}
      className="absolute inset-0 size-full"
    />
  )
}

function ThumbMedia({ url, focus = 'center' }: { url: string; focus?: 'center' | 'top' }) {
  return (
    <StudioTemplatePreviewMedia
      url={url}
      alt=""
      className={cn('absolute inset-0 size-full', focus === 'top' && 'object-[center_22%]')}
    />
  )
}

function EditorTool({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof Scissors
  label: string
  active?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2 text-[0.6875rem] font-medium tracking-[-0.01em] sm:px-2.5',
        active ? 'bg-white/12 text-white' : 'text-white/48',
      )}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  )
}

export function LandingVideosEditor({ templates, models }: LandingVideosEditorProps) {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recreateTemplate, setRecreateTemplate] = useState<StudioTemplateDto | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (templates.length === 0) return null

  const selected = templates[selectedIndex] ?? templates[0]!
  const clipFrames = [0, 1, 2, 3].map(offset => {
    const index = (selectedIndex + offset - 1 + templates.length) % templates.length
    return templates[index]!
  })
  const durationSec =
    selected.kind === 'video' && selected.payload.durationSec && selected.payload.durationSec > 0
      ? selected.payload.durationSec
      : 12
  const playheadLabel = formatClock(Math.min(4, Math.max(1, Math.round(durationSec * 0.34))))
  const caption = readableTemplateName(selected.name) ?? 'Hook on screen'
  const previewIsVideo = isVideoPreviewUrl(selected.previewImageUrl)

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
      <div className="flex flex-col gap-8 sm:gap-10">
        <div
          className={cn(
            'overflow-hidden rounded-[1.75rem] bg-[#0c0c0c] text-white',
            'shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_28px_64px_-36px_rgba(0,0,0,0.55)]',
            'outline outline-1 outline-[oklch(0_0_0/0.1)]',
          )}
        >
          <div className="flex h-11 items-center gap-3 border-b border-white/[0.08] px-3.5 sm:px-4">
            <p className="min-w-0 truncate text-[0.8125rem] font-medium tracking-[-0.02em] text-white/90">
              Video editor
            </p>
            <div className="ml-auto flex items-center gap-2" aria-hidden="true">
              <span className="inline-flex h-6 items-center rounded-full border border-white/10 px-2 text-[0.6875rem] font-medium tabular-nums text-white/50">
                9:16
              </span>
              <span className="inline-flex h-7 items-center rounded-full bg-white px-3 text-[0.75rem] font-medium tracking-[-0.01em] text-[#111]">
                Export
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[6.25rem_minmax(0,1fr)]">
            <div className="relative border-b border-white/[0.08] lg:border-r lg:border-b-0">
              <div className="flex flex-col p-2 lg:absolute lg:inset-0 lg:p-2.5">
              <p className="hidden shrink-0 px-0.5 pb-2 text-[0.625rem] font-medium tracking-[0.08em] text-white/38 uppercase lg:block">
                Templates
              </p>
              <div
                role="listbox"
                aria-label="Video templates"
                className="flex gap-1.5 overflow-x-auto lg:min-h-0 lg:flex-1 lg:flex-col lg:items-center lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {templates.map((template, index) => {
                  const selectedItem = index === selectedIndex
                  return (
                    <button
                      key={`${template._id}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={selectedItem}
                      aria-label={templateLabel(template, index)}
                      onClick={() => setSelectedIndex(index)}
                      className={cn(
                        'relative aspect-[9/16] w-[3.15rem] shrink-0 cursor-pointer overflow-hidden rounded-[0.5rem] bg-[#161616] sm:w-[3.35rem]',
                        'transition-[transform,outline-color] active:scale-[0.96] motion-reduce:active:scale-100',
                        ease,
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
                        selectedItem
                          ? 'outline outline-2 outline-white'
                          : 'outline outline-1 outline-[oklch(1_0_0/0.1)]',
                      )}
                    >
                      <ThumbMedia url={template.previewImageUrl} />
                    </button>
                  )
                })}
              </div>
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-10 bg-gradient-to-t from-[#0c0c0c] to-transparent lg:block"
                aria-hidden="true"
              />
            </div>

            <div className="relative flex items-center justify-center px-4 py-6 sm:py-7">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_42%,rgba(255,255,255,0.06),transparent_68%)]"
                aria-hidden="true"
              />
              <div className="relative aspect-[9/16] h-[17.5rem] overflow-hidden rounded-[1.125rem] bg-[#080808] shadow-[0_24px_48px_-28px_rgba(0,0,0,0.85)] outline outline-1 outline-[oklch(1_0_0/0.1)] sm:h-[20.5rem]">
                <PreviewMedia url={selected.previewImageUrl} autoPlay={previewIsVideo} />
                {previewIsVideo ? null : (
                  <span
                    className="pointer-events-none absolute top-[42%] left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-black/45 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)] backdrop-blur-md"
                    aria-hidden="true"
                  >
                    <Play className="size-4 translate-x-px fill-white" strokeWidth={0} />
                  </span>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" aria-hidden="true" />
                <div className="absolute inset-x-2.5 bottom-2.5 z-10 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => openRecreate(selected)}
                    className={cn(
                      'inline-flex h-8 flex-1 cursor-pointer items-center justify-center rounded-full bg-white px-3',
                      'text-[0.75rem] font-medium tracking-[-0.015em] text-[#111]',
                      'transition-[transform,background-color] ease-[cubic-bezier(0.2,0,0,1)] hover:bg-white/92 active:scale-[0.96] motion-reduce:active:scale-100',
                      ease,
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
                    )}
                  >
                    {VIDEOS_SECTION.recreate}
                  </button>
                  <button
                    type="button"
                    onClick={() => openRecreate(selected)}
                    className={cn(
                      'inline-flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3',
                      'border border-white/16 bg-black/40 text-[0.75rem] font-medium tracking-[-0.015em] text-white backdrop-blur-md',
                      'transition-[transform,background-color] ease-[cubic-bezier(0.2,0,0,1)] hover:bg-black/55 active:scale-[0.96] motion-reduce:active:scale-100',
                      ease,
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                    )}
                  >
                    <Copy className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                    {VIDEOS_SECTION.clone}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.08] px-3 py-3 sm:px-4 sm:py-3.5" aria-hidden="true">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[#111]">
                <Play className="size-3 translate-x-px fill-[#111]" strokeWidth={0} />
              </span>
              <span className="text-[0.6875rem] font-medium tabular-nums text-white/72">
                {playheadLabel}
                <span className="text-white/35"> / {formatClock(durationSec)}</span>
              </span>
              <div className="ml-auto flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <EditorTool icon={Scissors} label="Trim" />
                <EditorTool icon={Type} label="Text" />
                <EditorTool icon={Captions} label="Captions" active />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2">
              <span />
              <div className="mb-1.5 flex justify-between text-[0.625rem] font-medium tabular-nums text-white/32">
                <span>0:00</span>
                <span>{formatClock(durationSec / 2)}</span>
                <span>{formatClock(durationSec)}</span>
              </div>
              <div className="flex flex-col justify-center gap-1.5 text-[0.625rem] font-medium text-white/35">
                <span className="flex h-8 items-center">V1</span>
                <span className="flex h-6 items-center">A1</span>
                <span className="flex h-6 items-center">CC</span>
              </div>
              <div className="relative flex flex-col gap-1.5">
                <div className="flex h-8 overflow-hidden rounded-[0.4375rem] bg-white/[0.04] outline outline-1 outline-white/[0.06]">
                  {clipFrames.map((template, index) => (
                    <div
                      key={`clip-${template._id}-${index}`}
                      className={cn(
                        'relative min-w-0 flex-1',
                        index === 1 && 'outline outline-1 -outline-offset-1 outline-white/85',
                      )}
                    >
                      <ThumbMedia url={template.previewImageUrl} focus="top" />
                    </div>
                  ))}
                </div>
                <div className="flex h-6 items-end gap-px overflow-hidden rounded-[0.4375rem] bg-white/[0.04] px-1.5 py-1 outline outline-1 outline-white/[0.06]">
                  {WAVEFORM_HEIGHTS.map((height, index) => (
                    <span
                      key={index}
                      className="min-w-px flex-1 rounded-full bg-white/35"
                      style={{ height }}
                    />
                  ))}
                </div>
                <div className="relative h-6 overflow-hidden rounded-[0.4375rem] bg-white/[0.04] outline outline-1 outline-white/[0.06]">
                  <span className="absolute inset-y-1 left-[22%] flex w-[42%] items-center truncate rounded-[0.25rem] bg-white/14 px-2 text-[0.625rem] font-medium text-white/80">
                    {caption}
                  </span>
                </div>
                <span className="pointer-events-none absolute -top-5 bottom-0 left-[37.5%] w-px -translate-x-1/2 bg-white">
                  <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_0_2px_#0c0c0c]" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg" className={cn(landingCtaPrimary, 'h-11 px-7')}>
            <Link href={VIDEOS_SECTION.ctaHref}>{VIDEOS_SECTION.cta}</Link>
          </Button>
        </div>
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
