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
import {
  UGC_CAMPAIGN_PRESETS,
  UGC_CLIP_TYPE_LABELS,
  type UgcCampaignPreset,
  type UgcCampaignPresetId,
} from '@socialista/types'
import { useState } from 'react'

type UgcCampaignPresetsProps = {
  open: boolean
  applying?: boolean
  hasGeneratedWork?: boolean
  onOpenChange: (open: boolean) => void
  onApply: (presetId: UgcCampaignPresetId) => void
}

function PresetCard({
  preset,
  disabled,
  onApply,
}: {
  preset: UgcCampaignPreset
  disabled?: boolean
  onApply: () => void
}) {
  const total = preset.beats.reduce((sum, beat) => sum + beat.durationSec, 0)
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onApply}
      className={cn(
        'flex w-full flex-col rounded-xl px-3 py-2.5 text-left transition',
        'hover:bg-muted/70 active:scale-[0.99] motion-reduce:active:scale-100 disabled:opacity-60',
      )}
    >
      <span className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-medium tracking-tight">{preset.label}</p>
        <p className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {preset.beats.length} · {total}s
        </p>
      </span>
      <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{preset.description}</p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {preset.beats.map(beat => `${beat.name} · ${UGC_CLIP_TYPE_LABELS[beat.type]}`).join(' → ')}
      </p>
    </button>
  )
}

export function UgcCampaignPresets({
  open,
  applying,
  hasGeneratedWork,
  onOpenChange,
  onApply,
}: UgcCampaignPresetsProps) {
  const [pendingId, setPendingId] = useState<UgcCampaignPresetId | null>(null)

  const apply = (presetId: UgcCampaignPresetId) => {
    if (hasGeneratedWork) {
      setPendingId(presetId)
      return
    }
    onApply(presetId)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) setPendingId(null)
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        {pendingId ? (
          <>
            <DialogHeader>
              <DialogTitle>Replace current scenes?</DialogTitle>
              <DialogDescription>
                Photos, voiceovers, and videos on those scenes will be removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPendingId(null)}
                disabled={applying}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={applying}
                onClick={() => {
                  onApply(pendingId)
                  setPendingId(null)
                }}
              >
                Replace
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Templates</DialogTitle>
              <DialogDescription>
                Replaces your scenes with this sequence. You can still edit every scene after.
              </DialogDescription>
            </DialogHeader>
            <div className="-mx-1 grid">
              {UGC_CAMPAIGN_PRESETS.map(preset => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  disabled={applying}
                  onApply={() => apply(preset.id)}
                />
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
