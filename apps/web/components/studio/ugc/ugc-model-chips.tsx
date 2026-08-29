'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import { formatCredits } from '@/utils/format'
import type { Model } from '@socialista/types'
import { CheckIcon, ChevronDownIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'

type ChipKey = 'image' | 'script' | 'video'

type UgcModelChipsProps = {
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
  loading,
  onOpen,
  onChange,
}: {
  label: string
  models: Model[]
  value?: string
  disabled?: boolean
  loading?: boolean
  onOpen: () => void
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = findModel(models, value)

  return (
    <Popover
      open={open}
      onOpenChange={next => {
        setOpen(next)
        if (next) onOpen()
      }}
    >
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 text-[12px] font-medium',
          'transition-colors hover:bg-muted/40 disabled:opacity-50',
        )}
      >
        <span className="text-muted-foreground">{label}</span>
        <span className="max-w-36 truncate">{current?.name ?? (value ? 'Selected' : 'Choose')}</span>
        <ChevronDownIcon className="size-3 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1.5">
        {loading && models.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
          </div>
        ) : models.length === 0 ? (
          <p className="px-2.5 py-6 text-center text-[13px] text-muted-foreground">No models available.</p>
        ) : (
          <ul className="max-h-72 overflow-y-auto">
            {models.map(model => {
              const selected = model.value === value
              return (
                <li key={model._id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(model.value)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-muted/50',
                      selected && 'bg-muted/40',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{model.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {formatCredits(model.cost)} cr · {model.modelProvider}
                      </span>
                    </span>
                    {selected ? <CheckIcon className="size-3.5 shrink-0" /> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function UgcModelChips({
  imageValue,
  scriptValue,
  videoValue,
  scriptEnabled,
  disabled,
  onChange,
}: UgcModelChipsProps) {
  const imageModels = useUgcProjectStore(s => s.imageModels)
  const scriptModels = useUgcProjectStore(s => s.scriptModels)
  const videoModels = useUgcProjectStore(s => s.videoModels)
  const modelsLoading = useUgcProjectStore(s => s.modelsLoading)
  const ensureModels = useUgcProjectStore(s => s.ensureModels)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ModelChip
        label="Image"
        models={imageModels}
        value={imageValue}
        disabled={disabled}
        loading={modelsLoading}
        onOpen={() => void ensureModels()}
        onChange={value => onChange('image', value)}
      />
      <ModelChip
        label="Script"
        models={scriptModels}
        value={scriptValue}
        disabled={disabled || !scriptEnabled}
        loading={modelsLoading}
        onOpen={() => void ensureModels()}
        onChange={value => onChange('script', value)}
      />
      <ModelChip
        label="Video"
        models={videoModels}
        value={videoValue}
        disabled={disabled}
        loading={modelsLoading}
        onOpen={() => void ensureModels()}
        onChange={value => onChange('video', value)}
      />
    </div>
  )
}
