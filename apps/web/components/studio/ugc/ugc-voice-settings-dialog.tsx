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
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { UgcClipVoice } from '@socialista/types'
import { useMemo, useState } from 'react'

type UgcVoiceSettingsDialogProps = {
  open: boolean
  value: UgcClipVoice
  disabled?: boolean
  onOpenChange: (open: boolean) => void
  onChange: (voice: UgcClipVoice) => void
}

export function UgcVoiceSettingsDialog({
  open,
  value,
  disabled,
  onOpenChange,
  onChange,
}: UgcVoiceSettingsDialogProps) {
  const [draft, setDraft] = useState(value)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setDraft(value)
  }

  const speedValue = useMemo(() => [draft.speed ?? 1], [draft.speed])
  const stabilityValue = useMemo(() => [draft.stability ?? 45], [draft.stability])
  const similarityValue = useMemo(() => [draft.similarity ?? 75], [draft.similarity])
  const styleValue = useMemo(() => [draft.style ?? 15], [draft.style])

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (next) setDraft(value)
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice settings</DialogTitle>
          <DialogDescription>
            Tuned for natural UGC — conversational variation without sounding theatrical.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <label className="flex items-center justify-between gap-3 text-[13px]">
            <span>
              Voiceover
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                Turn off to skip audio for this scene
              </span>
            </span>
            <Switch
              checked={draft.enabled !== false}
              disabled={disabled}
              onCheckedChange={checked => setDraft(current => ({ ...current, enabled: checked }))}
            />
          </label>

          <VoiceSlider
            label="Stability"
            hint="Lower feels more natural and varied. Higher is more consistent."
            min={0}
            max={100}
            step={1}
            value={stabilityValue}
            display={Math.round(draft.stability ?? 45)}
            disabled={disabled || draft.enabled === false}
            onChange={next => setDraft(current => ({ ...current, stability: next }))}
          />
          <VoiceSlider
            label="Similarity"
            hint="How closely it matches the selected voice. Too high can sound processed."
            min={0}
            max={100}
            step={1}
            value={similarityValue}
            display={Math.round(draft.similarity ?? 75)}
            disabled={disabled || draft.enabled === false}
            onChange={next => setDraft(current => ({ ...current, similarity: next }))}
          />
          <VoiceSlider
            label="Style"
            hint="Subtle emotion for social ads. Keep low for talk-to-camera."
            min={0}
            max={100}
            step={1}
            value={styleValue}
            display={Math.round(draft.style ?? 15)}
            disabled={disabled || draft.enabled === false}
            onChange={next => setDraft(current => ({ ...current, style: next }))}
          />
          <VoiceSlider
            label="Speed"
            hint="Slightly above 1.0 reads snappier on Reels and TikTok."
            min={0.7}
            max={1.2}
            step={0.05}
            value={speedValue}
            display={(draft.speed ?? 1).toFixed(2)}
            disabled={disabled || draft.enabled === false}
            onChange={next => setDraft(current => ({ ...current, speed: next }))}
          />
          <label className="flex items-center justify-between gap-3 text-[13px]">
            <span>
              Speaker boost
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                Clearer presence in short-form feeds
              </span>
            </span>
            <Switch
              checked={draft.speakerBoost !== false}
              disabled={disabled || draft.enabled === false}
              onCheckedChange={checked => setDraft(current => ({ ...current, speakerBoost: checked }))}
            />
          </label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange(draft)
              onOpenChange(false)
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function VoiceSlider({
  label,
  hint,
  min,
  max,
  step,
  value,
  display,
  disabled,
  onChange,
}: {
  label: string
  hint: string
  min: number
  max: number
  step: number
  value: number[]
  display: string | number
  disabled?: boolean
  onChange: (value: number) => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <label className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="w-[4.5rem] shrink-0 text-foreground">{label}</span>
          <Slider
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onValueChange={([next]) => {
              if (typeof next === 'number') onChange(next)
            }}
          />
          <span className="w-8 tabular-nums text-foreground">{display}</span>
        </label>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{hint}</TooltipContent>
    </Tooltip>
  )
}
