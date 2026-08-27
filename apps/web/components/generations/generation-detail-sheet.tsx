'use client'

import { GENERATION_KIND_LABELS, getGenerationTitle } from '@/components/generations/generation-meta'
import { GenerationStatusBadge } from '@/components/generations/generation-status-badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useCopyPrompt } from '@/hooks/use-copy-prompt'
import { cn } from '@/lib/utils'
import { formatAbsoluteDate, formatCost, formatDuration, formatRelativeTime } from '@/utils/format'
import type { Generation, GenerationAdCopy } from '@socialista/types'
import { CopyIcon, ExternalLinkIcon, ImageIcon, ImagesIcon, SendIcon, VideoIcon } from 'lucide-react'
import Link from 'next/link'
import { useState, type KeyboardEvent, type ReactNode } from 'react'

type GenerationDetailSheetProps = {
  generation: Generation | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-3">
      <dt className="text-[13px] text-foreground/56">{label}</dt>
      <dd className="min-w-0 text-[13px] text-foreground">{children}</dd>
    </div>
  )
}

function CopyTextButton({ value, label }: { value: string; label: string }) {
  const { copyPrompt } = useCopyPrompt()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="size-7 rounded-md text-foreground/44 hover:text-foreground"
      aria-label={`Copy ${label.toLowerCase()}`}
      onClick={() => void copyPrompt(value, `${label} copied`)}
    >
      <CopyIcon className="size-3.5" strokeWidth={1.5} />
    </Button>
  )
}

function PromptBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-foreground/56">{label}</p>
        <CopyTextButton value={value} label={label} />
      </div>
      <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words text-foreground">
        {value}
      </p>
    </div>
  )
}

function AdCopyBlock({ adCopy }: { adCopy: GenerationAdCopy }) {
  const rows = [
    adCopy.brandName ? { label: 'Brand', value: adCopy.brandName } : null,
    adCopy.headline ? { label: 'Headline', value: adCopy.headline } : null,
    adCopy.subheadline ? { label: 'Subheadline', value: adCopy.subheadline } : null,
    adCopy.cta ? { label: 'Call to action', value: adCopy.cta } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  if (rows.length === 0) return null

  return (
    <dl className="space-y-2.5">
      {rows.map(row => (
        <DetailRow key={row.label} label={row.label}>
          {row.value}
        </DetailRow>
      ))}
    </dl>
  )
}

function EmptyResult({ generation }: { generation: Generation }) {
  const isVideo = generation.kind === 'video'
  const isRunning = generation.status === 'running'
  const Icon = isVideo ? VideoIcon : generation.kind === 'slideshow' ? ImagesIcon : ImageIcon

  return (
    <div className="-mx-6 flex aspect-[4/3] w-[calc(100%+3rem)] items-center justify-center bg-foreground/[0.03] text-foreground/44">
      <div className="flex flex-col items-center gap-2 px-6 text-center">
        <Icon
          className={cn('size-6', isRunning && 'motion-safe:animate-pulse')}
          strokeWidth={1.5}
        />
        <p className="text-sm text-foreground/56">
          {isRunning ? 'Generating…' : 'No result yet'}
        </p>
      </div>
    </div>
  )
}

function ResultPreview({
  generation,
  activeIndex,
  onActiveIndexChange,
}: {
  generation: Generation
  activeIndex: number
  onActiveIndexChange: (index: number) => void
}) {
  const result = generation.result
  const urls = result?.urls && result.urls.length > 0 ? result.urls : result?.url ? [result.url] : []

  if (!result?.url) {
    return <EmptyResult generation={generation} />
  }

  if (generation.kind === 'slideshow' && !/^https?:\/\//.test(result.url) && !(result.urls && result.urls.length > 0)) {
    return <EmptyResult generation={generation} />
  }

  if (result.type === 'video') {
    return (
      <div className="-mx-6 w-[calc(100%+3rem)] overflow-hidden bg-foreground/[0.03]">
        <video
          src={result.url}
          controls
          className="max-h-[min(52vh,480px)] w-full bg-black object-contain"
        />
      </div>
    )
  }

  const lastIndex = Math.max(0, urls.length - 1)
  const safeIndex = Math.min(Math.max(0, activeIndex), lastIndex)
  const activeUrl = urls[safeIndex] ?? result.url

  const move = (delta: number) => {
    if (urls.length < 2) return
    onActiveIndexChange((safeIndex + delta + urls.length) % urls.length)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      move(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      move(1)
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="-mx-6 w-[calc(100%+3rem)] overflow-hidden bg-foreground/[0.03] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/20"
        tabIndex={urls.length > 1 ? 0 : undefined}
        onKeyDown={handleKeyDown}
        aria-label={urls.length > 1 ? `Result ${safeIndex + 1} of ${urls.length}` : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- remote generation URLs vary by provider */}
        <img src={activeUrl} alt="" className="max-h-[min(52vh,480px)] w-full object-contain" />
      </div>

      {urls.length > 1 ? (
        <div className="flex items-end justify-between gap-3">
          <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5">
            {urls.map((url, index) => {
              const selected = index === safeIndex
              return (
                <button
                  key={url}
                  type="button"
                  aria-label={`Show result ${index + 1} of ${urls.length}`}
                  aria-pressed={selected}
                  onClick={() => onActiveIndexChange(index)}
                  className={cn(
                    'overflow-hidden rounded-md bg-foreground/[0.03] transition-colors duration-150 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20',
                    selected ? 'ring-1 ring-foreground/20' : 'hover:bg-foreground/[0.05]',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote generation URLs vary by provider */}
                  <img src={url} alt="" className="aspect-square w-full object-cover" />
                </button>
              )
            })}
          </div>
          <p className="shrink-0 pb-0.5 text-[11px] tabular-nums text-foreground/56">
            {safeIndex + 1}/{urls.length}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function GenerationDetailBody({ generation }: { generation: Generation }) {
  const result = generation.result
  const urls = result?.urls && result.urls.length > 0 ? result.urls : result?.url ? [result.url] : []
  const [activeIndex, setActiveIndex] = useState(0)
  const lastIndex = Math.max(0, urls.length - 1)
  const activeUrl =
    result?.type === 'video' ? result.url : (urls[Math.min(activeIndex, lastIndex)] ?? result?.url)
  const hasResult = Boolean(activeUrl)
  const modelLabel = generation.modelName ?? generation.model
  const adCopy = generation.inputs?.adCopy
  const sizeLabel =
    result?.width && result.height ? `${result.width} × ${result.height}` : null
  const aspectLabel = [generation.inputs?.aspectRatio, sizeLabel].filter(Boolean).join(' · ')

  return (
    <>
      <ScrollArea className="min-h-0 flex-1" scrollFade>
        <div className="space-y-5 px-6 py-5">
          <ResultPreview
            generation={generation}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
          />

          {generation.errorMessage ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-[13px] font-medium text-destructive">Couldn&apos;t finish</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-destructive/90">
                {generation.errorMessage}
              </p>
            </div>
          ) : null}

          <dl className="space-y-2.5">
            <DetailRow label="Model">{modelLabel}</DetailRow>
            <DetailRow label="Cost">{formatCost(generation.creditsCharged || generation.cost)}</DetailRow>
            <DetailRow label="Runtime">{formatDuration(generation.durationMs)}</DetailRow>
            {aspectLabel ? <DetailRow label="Format">{aspectLabel}</DetailRow> : null}
            <DetailRow label="Created">
              <span className="tabular-nums">
                {formatRelativeTime(generation.createdAt)}
                <span className="text-foreground/56">
                  {' '}
                  · {formatAbsoluteDate(generation.createdAt)}
                </span>
              </span>
            </DetailRow>
          </dl>

          {adCopy ? <AdCopyBlock adCopy={adCopy} /> : null}

          {generation.prompt || generation.enhancedPrompt ? (
            <div className="space-y-4 border-t border-foreground/10 pt-4">
              {generation.prompt ? <PromptBlock label="Prompt" value={generation.prompt} /> : null}
              {generation.enhancedPrompt ? (
                <PromptBlock label="Enhanced prompt" value={generation.enhancedPrompt} />
              ) : null}
            </div>
          ) : null}
        </div>
      </ScrollArea>

      {hasResult && (activeUrl || generation.result?.slideshowId) ? (
        <SheetFooter className="shrink-0 flex-row gap-2 border-t border-foreground/10 px-6 py-3 sm:flex-row sm:space-x-0">
          {generation.kind === 'slideshow' && generation.result?.slideshowId ? (
            <Button variant="outline" size="sm" className="h-8 min-w-0 flex-1 rounded-md" asChild>
              <Link href={DASHBOARD_ROUTES.STUDIO.slideshow(generation.result.slideshowId)}>
                <ImagesIcon className="size-3.5" strokeWidth={1.75} />
                Open in editor
              </Link>
            </Button>
          ) : activeUrl ? (
            <Button variant="outline" size="sm" className="h-8 min-w-0 flex-1 rounded-md" asChild>
              <a href={activeUrl} target="_blank" rel="noreferrer">
                {result?.type === 'video' ? (
                  <VideoIcon className="size-3.5" strokeWidth={1.75} />
                ) : (
                  <ExternalLinkIcon className="size-3.5" strokeWidth={1.75} />
                )}
                Open
              </a>
            </Button>
          ) : null}
          <Button size="sm" className="h-8 min-w-0 flex-1 rounded-md" asChild>
            <Link
              href={
                generation.kind === 'slideshow' && generation.result?.slideshowId
                  ? DASHBOARD_ROUTES.createPost({ slideshowId: generation.result.slideshowId })
                  : DASHBOARD_ROUTES.createPost({ generationId: generation._id })
              }
            >
              <SendIcon className="size-3.5" strokeWidth={1.75} />
              Post now
            </Link>
          </Button>
        </SheetFooter>
      ) : null}
    </>
  )
}

export function GenerationDetailSheet({ generation, open, onOpenChange }: GenerationDetailSheetProps) {
  const title = generation ? getGenerationTitle(generation.prompt, generation.kind) : 'Generation'
  const kindLabel = generation ? GENERATION_KIND_LABELS[generation.kind] : ''

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 space-y-0 border-b border-foreground/10 px-6 py-3.5 pr-12 text-left">
          <SheetTitle className="truncate text-[15px] font-medium tracking-[-0.02em]">
            {title}
          </SheetTitle>
          {generation ? (
            <>
              <SheetDescription className="sr-only">
                {kindLabel} generation, {generation.status}
              </SheetDescription>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[13px] text-foreground/56">{kindLabel}</span>
                <GenerationStatusBadge status={generation.status} />
              </div>
            </>
          ) : (
            <SheetDescription className="sr-only">Generation details</SheetDescription>
          )}
        </SheetHeader>

        {generation ? <GenerationDetailBody key={generation._id} generation={generation} /> : null}
      </SheetContent>
    </Sheet>
  )
}
