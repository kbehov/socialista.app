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
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { UgcWriteVideoPromptOptions } from '@/types/ugc.types'
import { SparklesIcon, WandSparklesIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

type UgcVideoPromptDialogProps = {
  open: boolean
  stillUrl?: string
  hasAudio?: boolean
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onWrite: (options?: UgcWriteVideoPromptOptions) => Promise<boolean>
}

export function UgcVideoPromptDialog({
  open,
  stillUrl,
  hasAudio,
  pending,
  onOpenChange,
  onWrite,
}: UgcVideoPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={next => !pending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        {open ? (
          <UgcVideoPromptDialogForm
            stillUrl={stillUrl}
            hasAudio={hasAudio}
            pending={pending}
            onCancel={() => onOpenChange(false)}
            onWrite={onWrite}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function UgcVideoPromptDialogForm({
  stillUrl,
  hasAudio,
  pending,
  onCancel,
  onWrite,
}: {
  stillUrl?: string
  hasAudio?: boolean
  pending?: boolean
  onCancel: () => void
  onWrite: (options?: UgcWriteVideoPromptOptions) => Promise<boolean>
}) {
  const [directions, setDirections] = useState('')
  const [mode, setMode] = useState<'auto' | 'write' | null>(null)
  const trimmed = directions.trim()
  const busy = Boolean(pending)

  const run = async (options?: UgcWriteVideoPromptOptions) => {
    setMode(options?.directions ? 'write' : 'auto')
    const ok = await onWrite(options)
    if (ok) onCancel()
    setMode(null)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Write a video prompt</DialogTitle>
        <DialogDescription>
          Tell us how the clip should move, or let Auto write the motion from the photo.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        {stillUrl ? (
          <div className="flex items-center gap-3 rounded-[10px] bg-muted/40 px-2.5 py-2">
            <div className="relative h-[52px] w-9 shrink-0 overflow-hidden rounded-md outline outline-1 outline-black/10 dark:outline-white/10">
              <Image src={stillUrl} alt="" fill className="object-cover" sizes="36px" unoptimized />
            </div>
            <p className="min-w-0 text-[12px] leading-snug text-muted-foreground">
              {hasAudio
                ? 'Auto reads this scene photo and the recorded line, then writes a prompt you can generate with.'
                : 'Auto reads this scene photo — the room, the product, and who is in frame — then writes a prompt you can generate with.'}
            </p>
          </div>
        ) : (
          <p className="text-[12px] leading-snug text-muted-foreground">
            Add a scene photo first. The prompt is written from that frame.
          </p>
        )}

        <div className="grid gap-1.5">
          <Label htmlFor="ugc-video-prompt-directions">Directions</Label>
          <Textarea
            id="ugc-video-prompt-directions"
            value={directions}
            disabled={busy}
            onChange={event => setDirections(event.target.value)}
            placeholder="Slow push-in, she lifts the bottle toward the lens, small smile, same window light."
            className="min-h-24 text-[13px]"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="outline" disabled={busy || !stillUrl} onClick={() => void run()}>
          {busy && mode === 'auto' ? (
            <Spinner className="size-3.5" />
          ) : (
            <WandSparklesIcon className="size-3.5" />
          )}
          Auto
        </Button>
        <Button
          type="button"
          disabled={busy || !trimmed || !stillUrl}
          onClick={() => void run({ directions: trimmed })}
        >
          {busy && mode === 'write' ? (
            <Spinner className="size-3.5" />
          ) : (
            <SparklesIcon className="size-3.5" />
          )}
          Write prompt
        </Button>
      </DialogFooter>
    </>
  )
}
