'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { getAspectRatioClass } from '@/utils/aspect-ratio'
import type { UgcSceneStill } from '@socialista/types'
import { AudioLinesIcon, CheckIcon, ImageIcon, VideoIcon } from 'lucide-react'
import Image from 'next/image'
import { useState, type ReactNode } from 'react'

type UgcStillsGridProps = {
  stills: UgcSceneStill[]
  selectedUrls: string[]
  generating?: boolean
  onToggle: (url: string) => void
  onUseSelected?: () => void
  aspectRatio?: string
  className?: string
}

export function UgcStillsGrid({
  stills,
  selectedUrls,
  generating,
  onToggle,
  onUseSelected,
  aspectRatio = '9:16',
  className,
}: UgcStillsGridProps) {
  const visible = stills.filter(still => still.imageUrl)
  if (visible.length === 0) return null

  const selectedSet = new Set(selectedUrls)

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] text-muted-foreground">
          {visible.length === 1 ? '1 photo' : `${visible.length} photos`}
          {selectedUrls.length > 0 ? ` · ${selectedUrls.length} selected` : ''}
        </p>
        {onUseSelected && selectedUrls.length > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[12px]"
            disabled={generating}
            onClick={onUseSelected}
          >
            Use for video
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {visible.map((still, index) => {
          const url = still.imageUrl
          if (!url) return null
          return (
            <UgcStillTile
              key={still.generationId ?? `${still.index}-${url}-${index}`}
              url={url}
              active={selectedSet.has(url)}
              aspectRatio={aspectRatio}
              onToggle={() => onToggle(url)}
            />
          )
        })}
      </div>
    </div>
  )
}

function UgcStillTile({
  url,
  active,
  aspectRatio = '9:16',
  onToggle,
}: {
  url: string
  active: boolean
  aspectRatio?: string
  onToggle: () => void
}) {
  const [zoomed, setZoomed] = useState(false)

  return (
    <>
      <div
        className={cn(
          'group relative h-[clamp(8.5rem,30svh,13rem)] overflow-hidden rounded-lg bg-muted/40',
          getAspectRatioClass(aspectRatio),
          active
            ? 'ring-2 ring-foreground/80'
            : 'ring-1 ring-black/[0.06] dark:ring-white/[0.08]',
        )}
      >
        <Image alt="" src={url} fill className="object-cover" sizes="160px" unoptimized />

        <button
          type="button"
          aria-label="Zoom photo"
          onClick={() => setZoomed(true)}
          className="absolute inset-0 z-[1] cursor-zoom-in"
        />

        <button
          type="button"
          aria-pressed={active}
          aria-label={active ? 'Deselect photo' : 'Select photo for video'}
          onClick={event => {
            event.preventDefault()
            event.stopPropagation()
            onToggle()
          }}
          onPointerDown={event => event.stopPropagation()}
          className={cn(
            'absolute top-1.5 right-1.5 z-[2] flex size-6 items-center justify-center rounded-full shadow-sm',
            'cursor-pointer transition-colors',
            'active:scale-95 motion-reduce:active:scale-100',
            active
              ? 'bg-foreground text-background'
              : 'bg-background/90 text-muted-foreground ring-1 ring-black/10 hover:text-foreground dark:ring-white/15',
          )}
        >
          <CheckIcon className="size-3" strokeWidth={2.5} />
        </button>
      </div>

      <Dialog open={zoomed} onOpenChange={setZoomed}>
        <DialogContent
          className={cn(
            'w-auto max-w-[min(92vw,28rem)] gap-0 overflow-hidden border-0 bg-transparent p-0 shadow-none sm:max-w-[min(92vw,28rem)]',
            '[&_[data-slot=dialog-close]]:top-2 [&_[data-slot=dialog-close]]:right-2 [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:bg-background/90',
          )}
        >
          <DialogTitle className="sr-only">Photo preview</DialogTitle>
          <DialogDescription className="sr-only">Enlarged scene photo</DialogDescription>
          <Image
            alt=""
            src={url}
            width={1080}
            height={1920}
            className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
            unoptimized
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

function EmptyHint({
  icon,
  title,
  description,
  step,
  next,
  className,
}: {
  icon: ReactNode
  title: string
  description: string
  step?: string
  next?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <span className="mb-3 text-muted-foreground/70">{icon}</span>
      {step ? (
        <p className="mb-1.5 text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          {step}
        </p>
      ) : null}
      <p className="text-[13px] font-medium tracking-tight">{title}</p>
      <p className="mt-1 max-w-[16rem] text-[12px] leading-relaxed text-muted-foreground">{description}</p>
      {next ? (
        <p className="mt-2 max-w-[18rem] text-[12px] leading-relaxed text-muted-foreground/80">
          Next: {next}
        </p>
      ) : null}
    </div>
  )
}

type EmptyHintExtras = {
  className?: string
  step?: string
  next?: string
}

export function UgcStillsEmptyHint({ className, step, next }: EmptyHintExtras) {
  return (
    <EmptyHint
      className={className}
      icon={<ImageIcon className="size-5" strokeWidth={1.5} />}
      title="Describe the scene photo"
      description="Framing, light, and what the creator is doing. Each take is kept so you can pick one."
      step={step}
      next={next}
    />
  )
}

export function UgcAudioEmptyHint({
  className,
  step,
  next,
  title = 'Write a line of dialogue',
  description = 'One short line they would say on camera. Generate the voiceover below.',
}: EmptyHintExtras & {
  title?: string
  description?: string
}) {
  return (
    <EmptyHint
      className={className}
      icon={<AudioLinesIcon className="size-5" strokeWidth={1.5} />}
      title={title}
      description={description}
      step={step}
      next={next}
    />
  )
}

export function UgcVideoEmptyHint({
  className,
  step,
  next,
  title = 'Describe the motion',
  description = 'A turn, smile, or product reveal from the start frame. Preview appears here when ready.',
}: EmptyHintExtras & {
  title?: string
  description?: string
}) {
  return (
    <EmptyHint
      className={className}
      icon={<VideoIcon className="size-5" strokeWidth={1.5} />}
      title={title}
      description={description}
      step={step}
      next={next}
    />
  )
}
