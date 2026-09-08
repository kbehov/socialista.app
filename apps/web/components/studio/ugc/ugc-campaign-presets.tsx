'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
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

type UgcCampaignPresetsProps = {
  open: boolean
  applying?: boolean
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

export function UgcCampaignPresets({ open, applying, onOpenChange, onApply }: UgcCampaignPresetsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Templates</DialogTitle>
          <DialogDescription>Adds a 3-scene sequence. You can still edit every scene after.</DialogDescription>
        </DialogHeader>
        <div className="-mx-1 grid">
          {UGC_CAMPAIGN_PRESETS.map(preset => (
            <PresetCard
              key={preset.id}
              preset={preset}
              disabled={applying}
              onApply={() => onApply(preset.id)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
