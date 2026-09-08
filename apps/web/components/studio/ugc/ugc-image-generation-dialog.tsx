'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { UgcClip } from '@socialista/types'
import { CheckIcon, ImageIcon, Loader2Icon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

type UgcImageGenerationDialogProps = {
  open: boolean
  clip?: UgcClip
  generating?: boolean
  progress?: number
  progressLabel?: string
  onOpenChange: (open: boolean) => void
  onConfirm: (urls: string[]) => void
}

export function UgcImageGenerationDialog({
  open,
  clip,
  generating,
  progress,
  progressLabel,
  onOpenChange,
  onConfirm,
}: UgcImageGenerationDialogProps) {
  const stills = (clip?.stills ?? []).filter(still => still.imageUrl)
  const stillUrls = stills.flatMap(still => (still.imageUrl ? [still.imageUrl] : []))
  const [picked, setPicked] = useState<string[] | null>(null)
  const kept = (picked ?? []).filter(url => stillUrls.includes(url))
  const newest = stillUrls[stillUrls.length - 1]
  const selected = kept.length > 0 ? kept : newest ? [newest] : []

  const toggle = (url: string) => {
    setPicked(current => {
      const base = current ?? selected
      return base.includes(url) ? base.filter(item => item !== url) : [...base, url]
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) setPicked(null)
        onOpenChange(next)
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick a scene photo</DialogTitle>
          <DialogDescription>
            Generation happens here. Select the still that should start this scene — it will be ready for video next.
          </DialogDescription>
        </DialogHeader>

        {generating && stills.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-muted/40 py-16">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            <p className="text-[13px] font-medium">{progressLabel ?? 'Generating photos…'}</p>
            {typeof progress === 'number' ? (
              <p className="text-[11px] tabular-nums text-muted-foreground">{Math.round(progress)}%</p>
            ) : null}
          </div>
        ) : stills.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 py-16 text-center">
            <ImageIcon className="size-5 text-muted-foreground" />
            <p className="text-[13px] font-medium">Photos will appear here</p>
            <p className="max-w-xs text-[12px] text-muted-foreground">
              Write a prompt in the Image tab, then generate. You can pick one or more results.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stills.map(still => {
              const url = still.imageUrl
              if (!url) return null
              const active = selected.includes(url)
              return (
                <button
                  key={`${still.index}-${url}`}
                  type="button"
                  onClick={() => toggle(url)}
                  className={cn(
                    'relative aspect-[9/16] overflow-hidden rounded-2xl ring-1 transition',
                    active ? 'ring-foreground/50' : 'ring-border/60 hover:ring-border',
                  )}
                >
                  <Image alt="" src={url} fill className="object-cover" sizes="180px" unoptimized />
                  {generating && still.index === stills.length - 1 ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                      <Loader2Icon className="size-5 animate-spin" />
                    </span>
                  ) : null}
                  {active ? (
                    <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background">
                      <CheckIcon className="size-3.5" />
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={selected.length === 0 || generating}
            onClick={() => onConfirm(selected)}
          >
            Use selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
