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
import type { UgcWriteScriptOptions } from '@/types/ugc.types'
import { SparklesIcon, WandSparklesIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

type UgcScriptDialogProps = {
  open: boolean
  stillUrl?: string
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onWrite: (options?: UgcWriteScriptOptions) => Promise<boolean>
}

export function UgcScriptDialog({
  open,
  stillUrl,
  pending,
  onOpenChange,
  onWrite,
}: UgcScriptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={next => !pending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        {open ? (
          <UgcScriptDialogForm
            stillUrl={stillUrl}
            pending={pending}
            onCancel={() => onOpenChange(false)}
            onWrite={onWrite}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function UgcScriptDialogForm({
  stillUrl,
  pending,
  onCancel,
  onWrite,
}: {
  stillUrl?: string
  pending?: boolean
  onCancel: () => void
  onWrite: (options?: UgcWriteScriptOptions) => Promise<boolean>
}) {
  const [directions, setDirections] = useState('')
  const [mode, setMode] = useState<'auto' | 'write' | null>(null)
  const trimmed = directions.trim()
  const busy = Boolean(pending)

  const run = async (options?: UgcWriteScriptOptions) => {
    setMode(options?.directions ? 'write' : 'auto')
    const ok = await onWrite(options)
    if (ok) onCancel()
    setMode(null)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Write a script</DialogTitle>
        <DialogDescription>
          Tell us what they should say, or let Auto write a line from the photo.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        {stillUrl ? (
          <div className="flex items-center gap-3 rounded-[10px] bg-muted/40 px-2.5 py-2">
            <div className="relative h-[52px] w-9 shrink-0 overflow-hidden rounded-md outline outline-1 outline-black/10 dark:outline-white/10">
              <Image src={stillUrl} alt="" fill className="object-cover" sizes="36px" unoptimized />
            </div>
            <p className="min-w-0 text-[12px] leading-snug text-muted-foreground">
              Auto reads this scene photo — the room, the product, and who is talking.
            </p>
          </div>
        ) : (
          <p className="text-[12px] leading-snug text-muted-foreground">
            No scene photo yet. Auto will use the creator and product photos if they exist.
          </p>
        )}

        <div className="grid gap-1.5">
          <Label htmlFor="ugc-script-directions">Directions</Label>
          <Textarea
            id="ugc-script-directions"
            value={directions}
            disabled={busy}
            onChange={event => setDirections(event.target.value)}
            placeholder="First reaction to the serum — grey winter skin, then one pump on damp skin, then the link."
            className="min-h-24 text-[13px]"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => void run()}>
          {busy && mode === 'auto' ? (
            <Spinner className="size-3.5" />
          ) : (
            <WandSparklesIcon className="size-3.5" />
          )}
          Auto
        </Button>
        <Button
          type="button"
          disabled={busy || !trimmed}
          onClick={() => void run({ directions: trimmed })}
        >
          {busy && mode === 'write' ? (
            <Spinner className="size-3.5" />
          ) : (
            <SparklesIcon className="size-3.5" />
          )}
          Write script
        </Button>
      </DialogFooter>
    </>
  )
}
