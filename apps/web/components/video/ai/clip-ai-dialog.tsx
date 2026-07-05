'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2Icon, SparklesIcon } from 'lucide-react'
import type { EditVideoResolution } from '@/actions/fal.actions'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ClipId } from '@socialista/types'

export type ClipAiMode = 'edit-video' | 'animate-image'

export type ClipAiSubmitPayload =
  | { clipId: ClipId; mode: 'edit-video'; prompt: string; resolution: EditVideoResolution }
  | { clipId: ClipId; mode: 'animate-image'; prompt: string; duration: number }

const VIDEO_EDIT_SUGGESTIONS = [
  'Colorize the footage with a warm cinematic tone',
  'Add a soft film grain and vintage look',
  'Make the lighting brighter and more vibrant',
  'Apply a moody blue night-time color grade',
] as const

const IMAGE_ANIMATE_SUGGESTIONS = [
  'Slow zoom in with gentle camera movement',
  'Subtle parallax with soft ambient motion',
  'Wind gently moving hair and fabric',
  'Cinematic push-in with shallow depth of field',
] as const

const RESOLUTION_OPTIONS: { value: EditVideoResolution; label: string }[] = [
  { value: 'auto', label: 'Auto (match input)' },
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p' },
]

const DURATION_OPTIONS = [
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' },
] as const

type ClipAiDialogProps = {
  open: boolean
  mode: ClipAiMode | null
  clipId: ClipId | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: ClipAiSubmitPayload) => Promise<void>
}

export function ClipAiDialog({ open, mode, clipId, onOpenChange, onSubmit }: ClipAiDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [resolution, setResolution] = useState<EditVideoResolution>('auto')
  const [duration, setDuration] = useState<number>(5)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) {
      setPrompt('')
      setResolution('auto')
      setDuration(5)
    }
  }, [open])

  const suggestions = mode === 'animate-image' ? IMAGE_ANIMATE_SUGGESTIONS : VIDEO_EDIT_SUGGESTIONS
  const title = mode === 'animate-image' ? 'Animate image with AI' : 'Edit video with AI'
  const description =
    mode === 'animate-image'
      ? 'Describe how the still image should move. The model generates a short video clip from your photo.'
      : 'Describe the changes you want applied to this clip. The model edits the existing video in place.'

  const handleSubmit = () => {
    const trimmed = prompt.trim()
    if (!trimmed || isPending || !mode || !clipId) return

    startTransition(async () => {
      if (mode === 'animate-image') {
        await onSubmit({ clipId, mode, prompt: trimmed, duration })
      } else {
        await onSubmit({ clipId, mode, prompt: trimmed, resolution })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={value => !isPending && onOpenChange(value)}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="clip-ai-prompt" className="text-xs font-medium">
              Prompt
            </Label>
            <Textarea
              id="clip-ai-prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={
                mode === 'animate-image'
                  ? 'e.g. slow zoom in, leaves gently swaying in the breeze…'
                  : 'e.g. colorize the video, add a warm sunset glow…'
              }
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

          {mode === 'edit-video' ? (
            <div className="space-y-1.5">
              <Label htmlFor="clip-ai-resolution" className="text-xs font-medium">
                Output resolution
              </Label>
              <Select
                value={resolution}
                onValueChange={value => setResolution(value as EditVideoResolution)}
                disabled={isPending}
              >
                <SelectTrigger id="clip-ai-resolution" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOLUTION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Input is trimmed to 8 seconds max. Higher resolution may take longer to generate.
              </p>
            </div>
          ) : null}

          {mode === 'animate-image' ? (
            <div className="space-y-1.5">
              <Label htmlFor="clip-ai-duration" className="text-xs font-medium">
                Duration
              </Label>
              <Select
                value={String(duration)}
                onValueChange={value => setDuration(Number(value))}
                disabled={isPending}
              >
                <SelectTrigger id="clip-ai-duration" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">Quick ideas</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map(suggestion => (
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
          <Button type="button" onClick={handleSubmit} disabled={isPending || !prompt.trim() || !mode || !clipId}>
            {isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
            {isPending ? 'Generating…' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
