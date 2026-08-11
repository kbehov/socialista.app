'use client'

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorHeader,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogoBadge,
  ModelSelectorName,
  ModelSelectorShortcut,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector'
import { ModelProviderIcon } from '@/components/icons/model-provider-icon'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatModelCost } from '@/utils/format'
import type { Model } from '@socialista/types'
import { CheckIcon, ChevronDownIcon, ImageIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

type ModelHighlight = 'cheapest' | 'newest' | 'mostUsed'

const MODEL_HIGHLIGHT_CONFIG = {
  cheapest: {
    label: 'Cheapest',
    className: 'border-success/20 bg-success/10 text-success',
  },
  newest: {
    label: 'New',
    className: 'border-info/20 bg-info/10 text-info',
  },
  mostUsed: {
    label: 'Popular',
    className: 'border-warning/20 bg-warning/10 text-warning-foreground',
  },
} as const satisfies Record<ModelHighlight, { label: string; className: string }>

function getModelUsageCount(model: Model): number {
  if ('usageCount' in model && typeof model.usageCount === 'number') {
    return model.usageCount
  }
  return 0
}

function buildModelHighlights(models: Model[]): Map<string, ModelHighlight[]> {
  const highlights = new Map<string, ModelHighlight[]>()
  if (models.length === 0) return highlights

  const newestId = [...models].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]?._id
  const cheapestId = [...models].sort((a, b) => a.cost - b.cost)[0]?._id
  const mostUsedModel = [...models].sort((a, b) => getModelUsageCount(b) - getModelUsageCount(a))[0]
  const mostUsedId =
    mostUsedModel && getModelUsageCount(mostUsedModel) > 0 ? mostUsedModel._id : undefined

  for (const model of models) {
    const modelHighlights: ModelHighlight[] = []
    if (model._id === newestId) modelHighlights.push('newest')
    if (model._id === cheapestId) modelHighlights.push('cheapest')
    if (mostUsedId && model._id === mostUsedId) modelHighlights.push('mostUsed')
    if (modelHighlights.length > 0) highlights.set(model._id, modelHighlights)
  }

  return highlights
}

function ModelHighlightBadge({ highlight }: { highlight: ModelHighlight }) {
  const config = MODEL_HIGHLIGHT_CONFIG[highlight]
  return (
    <Badge
      className={cn(
        config.className,
        'h-4 shrink-0 rounded-full border-0 px-1.5 py-0 text-[9px] font-medium leading-none tracking-[-0.01em]',
      )}
    >
      {config.label}
    </Badge>
  )
}

export type InfluencerModelPickerProps = {
  models: Model[]
  value: string
  onChange: (modelId: string) => void
  /** Per-shot cost multiplier shown next to each model (anchor count). */
  shotCount: number
  disabled?: boolean
  className?: string
  /** Compact trigger for sticky preview / mobile bars */
  size?: 'default' | 'compact'
  /** Show total cost line under the trigger (default true) */
  showBreakdown?: boolean
}

export function InfluencerModelPicker({
  models,
  value,
  onChange,
  shotCount,
  disabled,
  className,
  size = 'default',
  showBreakdown = true,
}: InfluencerModelPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedModel = useMemo(
    () => models.find(model => model._id === value) ?? models[0],
    [models, value],
  )
  const chefs = useMemo(() => [...new Set(models.map(model => model.chef))].sort(), [models])
  const modelHighlights = useMemo(() => buildModelHighlights(models), [models])
  const selectedHighlights = selectedModel
    ? (modelHighlights.get(selectedModel._id) ?? [])
    : []

  if (!selectedModel) {
    return (
      <div
        className={cn(
          'rounded-xl bg-muted/20 px-3.5 py-3 text-[13px] text-muted-foreground ring-1 ring-border/35',
          className,
        )}
      >
        No image-context models available. Add one in the model manager.
      </div>
    )
  }

  const totalCost = selectedModel.cost * shotCount

  return (
    <div className={cn('space-y-2', className)}>
      <ModelSelector onOpenChange={setOpen} open={open}>
        <ModelSelectorTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="dialog"
            className={cn(
              'group flex w-full items-center gap-2.5 rounded-xl text-left',
              'ring-1 ring-border/40 bg-background/90 transition-[border-color,background-color,box-shadow] duration-150',
              'hover:bg-muted/20 hover:ring-border/55',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
              'disabled:cursor-not-allowed disabled:opacity-50',
              open && 'bg-muted/15 ring-border/55 shadow-sm',
              size === 'compact' ? 'h-10 px-2.5' : 'h-11 px-3',
            )}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/30">
              <ModelProviderIcon className="size-3.5" provider={selectedModel.modelProvider} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <ModelSelectorName
                  className={cn(
                    'truncate font-medium tracking-[-0.015em] text-foreground',
                    size === 'compact' ? 'text-[12px]' : 'text-[13px]',
                  )}
                >
                  {selectedModel.name}
                </ModelSelectorName>
                {selectedHighlights[0] ? (
                  <ModelHighlightBadge highlight={selectedHighlights[0]} />
                ) : null}
              </span>
              {size === 'default' ? (
                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ImageIcon className="size-2.5" strokeWidth={1.75} aria-hidden />
                  Image context
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-[12px] font-medium tabular-nums tracking-[-0.01em] text-muted-foreground">
              {formatModelCost(selectedModel.cost, selectedModel.costUnit)}
            </span>
            <ChevronDownIcon
              className={cn(
                'size-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200',
                open && 'rotate-180',
              )}
            />
          </button>
        </ModelSelectorTrigger>

        <ModelSelectorContent className="sm:max-w-104" title="Choose model">
          <ModelSelectorHeader
            heading="Models"
            description={
              <>
                {models.length} with image context
                {chefs.length > 1 ? ` · ${chefs.length} providers` : null}
                {' · '}
                {shotCount} portraits each
              </>
            }
          />
          <ModelSelectorInput placeholder="Search by name or provider…" />
          <ModelSelectorList>
            <ModelSelectorEmpty>No models match your search.</ModelSelectorEmpty>
            {chefs.map(chef => (
              <ModelSelectorGroup heading={chef} key={chef}>
                {models
                  .filter(model => model.chef === chef)
                  .map(model => {
                    const isSelected = value === model._id || (!value && model._id === selectedModel._id)
                    const highlights = modelHighlights.get(model._id) ?? []
                    return (
                      <ModelSelectorItem
                        key={model._id}
                        data-checked={isSelected ? true : undefined}
                        onSelect={() => {
                          onChange(model._id)
                          setOpen(false)
                        }}
                        value={`${model.name} ${model.modelProvider} ${model.chef}`}
                      >
                        <ModelSelectorLogoBadge>
                          <ModelProviderIcon className="size-3.5" provider={model.modelProvider} />
                        </ModelSelectorLogoBadge>

                        <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <ModelSelectorName className="min-w-0 flex-1 text-[13px] font-medium leading-none tracking-[-0.016em]">
                              {model.name}
                            </ModelSelectorName>
                            {highlights.length > 0 ? (
                              <span className="flex shrink-0 items-center gap-1">
                                {highlights.map(highlight => (
                                  <ModelHighlightBadge key={highlight} highlight={highlight} />
                                ))}
                              </span>
                            ) : null}
                          </span>
                          <span className="text-[11px] text-muted-foreground/70">
                            {formatModelCost(model.cost * shotCount, model.costUnit)} total
                          </span>
                        </span>

                        <span className="flex shrink-0 items-center gap-2.5">
                          <ModelSelectorShortcut>
                            {formatModelCost(model.cost, model.costUnit)}
                          </ModelSelectorShortcut>
                          <span
                            aria-hidden
                            className={cn(
                              'flex size-4 items-center justify-center transition-opacity duration-150',
                              isSelected ? 'opacity-100' : 'opacity-0',
                            )}
                          >
                            <CheckIcon className="size-3.5 text-foreground" strokeWidth={2.25} />
                          </span>
                        </span>
                      </ModelSelectorItem>
                    )
                  })}
              </ModelSelectorGroup>
            ))}
          </ModelSelectorList>
        </ModelSelectorContent>
      </ModelSelector>

      {showBreakdown ? (
        <p className="text-[12px] leading-relaxed tracking-[-0.005em] text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground/80">
            {formatModelCost(totalCost, selectedModel.costUnit)}
          </span>
          {' · '}
          {shotCount} anchor portraits ({formatModelCost(selectedModel.cost, selectedModel.costUnit)}{' '}
          each)
        </p>
      ) : null}
    </div>
  )
}
