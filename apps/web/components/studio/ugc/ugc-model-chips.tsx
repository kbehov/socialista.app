'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Model } from '@socialista/types'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

type ChipKey = 'image' | 'script' | 'video'

type UgcModelChipsProps = {
  imageModels: Model[]
  scriptModels: Model[]
  videoModels: Model[]
  imageValue?: string
  scriptValue?: string
  videoValue?: string
  scriptEnabled?: boolean
  disabled?: boolean
  onChange: (key: ChipKey, value: string) => void
}

function findModel(models: Model[], value?: string) {
  if (!value) return undefined
  return models.find(model => model.value === value)
}

function ModelChip({
  label,
  models,
  value,
  disabled,
  onChange,
}: {
  label: string
  models: Model[]
  value?: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const current = findModel(models, value)

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled || models.length === 0}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 text-[12px] font-medium',
          'transition-colors hover:bg-muted/40 disabled:opacity-50',
        )}
      >
        <span className="text-muted-foreground">{label}</span>
        <span className="max-w-36 truncate">{current?.name ?? 'Choose'}</span>
        <ChevronDownIcon className="size-3 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1.5">
        <ul className="max-h-72 overflow-y-auto">
          {models.map(model => {
            const selected = model.value === value
            return (
              <li key={model._id}>
                <button
                  type="button"
                  onClick={() => onChange(model.value)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-muted/50',
                    selected && 'bg-muted/40',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{model.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {model.cost} cr · {model.modelProvider}
                    </span>
                  </span>
                  {selected ? <CheckIcon className="size-3.5 shrink-0" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export function UgcModelChips({
  imageModels,
  scriptModels,
  videoModels,
  imageValue,
  scriptValue,
  videoValue,
  scriptEnabled,
  disabled,
  onChange,
}: UgcModelChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ModelChip
        label="Image"
        models={imageModels}
        value={imageValue}
        disabled={disabled}
        onChange={value => onChange('image', value)}
      />
      <ModelChip
        label="Script"
        models={scriptModels}
        value={scriptValue}
        disabled={disabled || !scriptEnabled}
        onChange={value => onChange('script', value)}
      />
      <ModelChip
        label="Video"
        models={videoModels}
        value={videoValue}
        disabled={disabled}
        onChange={value => onChange('video', value)}
      />
      <span className={cn(dashboardSurface.metricMeta, 'ml-1 hidden sm:inline')}>Advanced</span>
    </div>
  )
}
