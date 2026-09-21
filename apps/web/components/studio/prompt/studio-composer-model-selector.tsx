'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { PromptInputButton } from '@/components/ai-elements/prompt-input'
import { ModelLogo } from '@/components/icons/model-logo'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StudioInputActionTooltip } from '@/components/studio/prompt/studio-input-action-tooltip'
import {
  STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
  STUDIO_TOOL_BUTTON_CLASS,
  STUDIO_TOOL_CHEVRON_CLASS,
} from '@/components/studio/prompt/studio-composer-surface'
import { getModelCompanyName } from '@/lib/model-company'
import { cn } from '@/lib/utils'
import { formatCredits } from '@/utils/format'
import { ContextSupport, ModelType, type Model } from '@socialista/types'
import { ChevronDownIcon, CoinsIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

export type StudioModelPickerVariant = 'default' | 'image'

type StudioComposerModelSelectorProps = {
  models: Model[]
  selectedModelId: string
  onSelectedModelChange: (modelId: string) => void
  disabled?: boolean
  heading?: string
  tooltip?: string
  variant?: StudioModelPickerVariant
}

type ModelFilterId =
  | 'trending'
  | 'realistic'
  | 'upscaling'
  | 'editing'
  | 'audio'
  | 'fast'
  | 'low-cost'

const DEFAULT_FILTER_OPTIONS: { id: ModelFilterId; label: string }[] = [
  { id: 'trending', label: '🔥 Trending' },
  { id: 'realistic', label: 'Realistic' },
  { id: 'upscaling', label: 'Upscaling' },
  { id: 'editing', label: 'Editing' },
  { id: 'audio', label: 'Audio' },
  { id: 'fast', label: 'Fast' },
  { id: 'low-cost', label: '💰 Low Cost' },
]

const IMAGE_FILTER_OPTIONS: { id: ModelFilterId; label: string }[] = [
  { id: 'trending', label: '🔥 Trending' },
  { id: 'low-cost', label: '💰 Low Cost' },
]

const MODALITY_TABS: { type: ModelType; label: string }[] = [
  { type: ModelType.IMAGE, label: 'Image' },
  { type: ModelType.VIDEO, label: 'Video' },
  { type: ModelType.LIP_SYNC, label: 'Lip sync' },
]

function getModelUsageCount(model: Model): number {
  if ('usageCount' in model && typeof model.usageCount === 'number') {
    return model.usageCount
  }
  return 0
}

function buildNewestModelId(models: Model[]): string | undefined {
  if (models.length === 0) return undefined
  return [...models].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]?._id
}

function getLowCostThreshold(models: Model[]): number {
  if (models.length === 0) return 0
  const sorted = [...models].sort((a, b) => a.cost - b.cost)
  const index = Math.max(0, Math.floor(sorted.length / 3) - 1)
  return sorted[index]?.cost ?? sorted[0]!.cost
}

function buildTrendingModelIds(models: Model[]): Set<string> {
  if (models.length === 0) return new Set()

  const byUsage = [...models].sort(
    (a, b) => getModelUsageCount(b) - getModelUsageCount(a),
  )
  const topUsage = getModelUsageCount(byUsage[0]!)

  if (topUsage > 0) {
    return new Set(
      byUsage
        .filter(
          (model, index) =>
            index < 3 || getModelUsageCount(model) >= topUsage * 0.6,
        )
        .map(model => model._id),
    )
  }

  const newest = [...models]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, Math.min(3, models.length))

  return new Set(newest.map(model => model._id))
}

function modelMatchesFilter(
  model: Model,
  filter: ModelFilterId,
  lowCostThreshold: number,
  trendingModelIds: Set<string>,
): boolean {
  const haystack = `${model.name} ${model.value} ${model.modelProvider}`.toLowerCase()

  switch (filter) {
    case 'trending':
      return trendingModelIds.has(model._id)
    case 'audio':
      return model.contextSupports?.includes(ContextSupport.AUDIO) ?? false
    case 'fast':
      return /flash|fast|turbo|mini|lite|quick|omni/i.test(haystack)
    case 'low-cost':
      return model.cost <= lowCostThreshold
    case 'realistic':
      return /real|photo|natural|pro|cinematic|seedance|kling/i.test(haystack)
    case 'upscaling':
      return /upscale|enhance|4k|hd|super/i.test(haystack)
    case 'editing':
      return /edit|inpaint|outpaint|remix|extend|vary/i.test(haystack)
    default:
      return false
  }
}

function getModelDescription(model: Model): string {
  const supports = model.contextSupports ?? []
  const company = getModelCompanyName(model)

  if (supports.length === 0) {
    return `${company} · ${model.modelProvider}`
  }

  const labels = supports.map(support => {
    switch (support) {
      case ContextSupport.IMAGE:
        return 'image'
      case ContextSupport.VIDEO:
        return 'video'
      case ContextSupport.AUDIO:
        return 'audio'
      case ContextSupport.TEXT:
        return 'text'
      case ContextSupport.FILE:
        return 'file'
      default:
        return support
    }
  })

  const unique = [...new Set(labels)]
  return `Supports ${unique.join(', ')} references · ${company}`
}

function isBetaModel(model: Model): boolean {
  return /beta/i.test(`${model.name} ${model.value}`)
}

export function StudioComposerModelSelector({
  models,
  selectedModelId,
  onSelectedModelChange,
  disabled = false,
  heading = 'Text models',
  tooltip = 'Choose generation model',
  variant = 'default',
}: StudioComposerModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<ModelFilterId>>(() => new Set())

  const selectedModel = models.find(model => model._id === selectedModelId) ?? models[0]
  const newestModelId = useMemo(() => buildNewestModelId(models), [models])
  const lowCostThreshold = useMemo(() => getLowCostThreshold(models), [models])
  const trendingModelIds = useMemo(() => buildTrendingModelIds(models), [models])
  const filterOptions =
    variant === 'image' ? IMAGE_FILTER_OPTIONS : DEFAULT_FILTER_OPTIONS

  const availableModalities = useMemo(() => {
    const types = new Set(models.map(model => model.modelType))
    return MODALITY_TABS.filter(tab => types.has(tab.type))
  }, [models])

  const [modality, setModality] = useState<ModelType | null>(null)

  const resolvedModality = useMemo(() => {
    if (availableModalities.length <= 1) return null
    if (modality && availableModalities.some(tab => tab.type === modality)) {
      return modality
    }
    const selectedType = selectedModel?.modelType
    if (selectedType && availableModalities.some(tab => tab.type === selectedType)) {
      return selectedType
    }
    return availableModalities[0]?.type ?? null
  }, [availableModalities, modality, selectedModel?.modelType])

  const visibleFilters = useMemo(() => {
    if (variant === 'image') return filterOptions
    return filterOptions.filter(option =>
      models.some(model =>
        modelMatchesFilter(model, option.id, lowCostThreshold, trendingModelIds),
      ),
    )
  }, [filterOptions, lowCostThreshold, models, trendingModelIds, variant])

  const filteredModels = useMemo(() => {
    let next = models

    if (resolvedModality) {
      next = next.filter(model => model.modelType === resolvedModality)
    }

    if (activeFilters.size > 0) {
      next = next.filter(model =>
        [...activeFilters].some(filter =>
          modelMatchesFilter(model, filter, lowCostThreshold, trendingModelIds),
        ),
      )
    }

    return [...next].sort((a, b) => {
      const usageDelta = getModelUsageCount(b) - getModelUsageCount(a)
      if (usageDelta !== 0) return usageDelta
      return a.name.localeCompare(b.name)
    })
  }, [activeFilters, lowCostThreshold, models, resolvedModality, trendingModelIds])

  const toggleFilter = (filter: ModelFilterId) => {
    setActiveFilters(previous => {
      const next = new Set(previous)
      if (next.has(filter)) {
        next.delete(filter)
      } else {
        next.add(filter)
      }
      return next
    })
  }

  if (!selectedModel) return null

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <StudioInputActionTooltip label={tooltip}>
        <PopoverTrigger asChild>
          <PromptInputButton
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={tooltip}
            className={cn(
              STUDIO_TOOL_BUTTON_CLASS,
              'max-w-[min(100%,14rem)] min-w-0 [&_svg]:text-foreground/70',
              open && STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
            )}
            disabled={disabled}
            size="xs"
            type="button"
          >
            <ModelLogo className="size-3.5 shrink-0" model={selectedModel} size={14} />
            <span className="min-w-0 truncate text-[12px] font-medium leading-none tracking-[-0.015em]">
              {selectedModel.name}
            </span>
            <ChevronDownIcon
              className={cn(
                STUDIO_TOOL_CHEVRON_CLASS,
                'transition-transform duration-150',
                open && 'rotate-180',
              )}
            />
          </PromptInputButton>
        </PopoverTrigger>
      </StudioInputActionTooltip>

      <PopoverContent
        align="start"
        collisionPadding={12}
        className={cn(
          'flex max-h-[min(70dvh,26rem)] w-[min(calc(100vw-1.5rem),26rem)] flex-col gap-0 overflow-hidden rounded-xl border-border/50 p-0 shadow-xl',
          'ring-1 ring-foreground/8',
        )}
        side="top"
        sideOffset={6}
      >
        <Command
          className="flex min-h-0 max-h-[inherit] flex-1 flex-col overflow-hidden rounded-none border-0 bg-background p-0 shadow-none"
          filter={(value, search) => (value.includes(search.toLowerCase()) ? 1 : 0)}
        >
          <div className="flex shrink-0 items-center gap-1.5 border-b border-border/40 px-2.5 py-1.5">
            <div
              className={cn(
                'min-w-0 flex-1',
                '[&_[data-slot=command-input-wrapper]]:p-0',
                '[&_[data-slot=input-group]]:h-8 [&_[data-slot=input-group]]:rounded-md',
                '[&_[data-slot=input-group]]:border-border/45 [&_[data-slot=input-group]]:bg-muted/25',
                '[&_[data-slot=input-group]]:shadow-none',
                '[&_[data-slot=input-group]_svg]:size-3.5',
              )}
            >
              <CommandInput
                className="text-[12px] tracking-[-0.012em] placeholder:text-muted-foreground/55"
                placeholder="Search all models…"
              />
            </div>
            {availableModalities.length > 1 ? (
              <div
                className="flex shrink-0 gap-0.5 rounded-lg bg-muted/35 p-0.5"
                role="tablist"
                aria-label="Model modality"
              >
                {availableModalities.map(tab => {
                  const active = resolvedModality === tab.type
                  return (
                    <button
                      key={tab.type}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[10px] font-medium tracking-[-0.01em] transition-colors',
                        active
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      onClick={() => setModality(tab.type)}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          {visibleFilters.length > 0 ? (
            <div className="flex shrink-0 flex-wrap gap-1 border-b border-border/35 px-2.5 py-1.5">
              {visibleFilters.map(filter => {
                const active = activeFilters.has(filter.id)
                return (
                  <button
                    key={filter.id}
                    type="button"
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-[-0.01em] transition-colors',
                      active
                        ? 'border-foreground/15 bg-foreground text-background'
                        : 'border-border/60 bg-background text-foreground/80 hover:border-border hover:bg-muted/30',
                    )}
                    onClick={() => toggleFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>
          ) : null}

          <CommandList
            aria-label={heading}
            className="min-h-0 flex-1 overflow-y-auto scroll-py-0.5 px-1 py-1"
          >
            <CommandEmpty className="py-6 text-[12px] text-muted-foreground">
              No models match your search.
            </CommandEmpty>
            {filteredModels.map(model => {
              const isSelected = selectedModelId === model._id
              const isNew = model._id === newestModelId
              const isBeta = isBetaModel(model)

              return (
                <CommandItem
                  key={model._id}
                  className={cn(
                    'gap-2 rounded-lg px-2 py-1.5 aria-selected:bg-muted/55',
                    isSelected && 'bg-muted/35',
                  )}
                  onSelect={() => {
                    onSelectedModelChange(model._id)
                    setOpen(false)
                  }}
                  value={`${model.name} ${model.modelProvider} ${getModelCompanyName(model)} ${model.value}`.toLowerCase()}
                >
                  <span
                    className={cn(
                      'relative flex size-8 shrink-0 items-center justify-center rounded-lg',
                      'bg-muted/45 ring-1 ring-border/35',
                    )}
                  >
                    <ModelLogo className="size-4" model={model} size={16} />
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                    <span className="flex min-w-0 items-center gap-1">
                      <span className="min-w-0 truncate text-[12px] font-semibold leading-tight tracking-[-0.02em]">
                        {model.name}
                      </span>
                      {isNew ? (
                        <Badge
                          variant="secondary"
                          className="h-3.5 shrink-0 rounded border-0 bg-muted px-1 text-[8px] font-medium leading-none text-muted-foreground"
                        >
                          New
                        </Badge>
                      ) : null}
                      {isBeta ? (
                        <Badge
                          variant="secondary"
                          className="h-3.5 shrink-0 rounded border-0 bg-muted px-1 text-[8px] font-medium leading-none text-muted-foreground"
                        >
                          Beta
                        </Badge>
                      ) : null}
                      <span className="ml-auto flex shrink-0 items-center gap-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                        <CoinsIcon className="size-2.5 opacity-70" strokeWidth={2} />
                        {formatCredits(model.cost)}
                      </span>
                    </span>
                    <span className="line-clamp-1 text-[10px] leading-snug tracking-[-0.01em] text-muted-foreground/80">
                      {getModelDescription(model)}
                    </span>
                  </span>
                </CommandItem>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
