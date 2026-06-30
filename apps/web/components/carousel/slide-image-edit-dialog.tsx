'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2Icon, SparklesIcon } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'

const PROMPT_SUGGESTIONS = [
  'Make the lighting warmer and more cinematic',
  'Remove background clutter and simplify the scene',
  'Add a soft golden-hour glow',
  'Increase contrast and make colors more vibrant',
] as const

type SlideImageEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (prompt: string) => Promise<void>
}

export function SlideImageEditDialog({ open, onOpenChange, onSubmit }: SlideImageEditDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) setPrompt('')
  }, [open])

  const handleSubmit = () => {
    const trimmed = prompt.trim()
    if (!trimmed || isPending) return

    startTransition(async () => {
      await onSubmit(trimmed)
    })
  }

  return (
    <Dialog open={open} onOpenChange={value => !isPending && onOpenChange(value)}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-primary" />
            Edit image with AI
          </DialogTitle>
          <DialogDescription>
            Describe how you want to change this slide background. The model edits the existing image in place.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="image-edit-prompt" className="text-xs font-medium">
              Edit prompt
            </Label>
            <Textarea
              id="image-edit-prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. brighten the image, add a moody blue tone, remove the person in the background…"
              rows={4}
              disabled={isPending}
              className="min-h-24 resize-none text-sm"
              onKeyDown={e => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">Quick ideas</p>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isPending}
                  onClick={() => setPrompt(suggestion)}
                  className="rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/30 hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending || !prompt.trim()}>
            {isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
            {isPending ? 'Generating…' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
