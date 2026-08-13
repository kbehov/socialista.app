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
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputController,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { ModelProviderIcon } from '@/components/icons/model-provider-icon'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { FIELD_ICONS } from '@/lib/studio/influencers/option-icons'
import { INFLUENCER_PROMPT_PLACEHOLDER } from '@/lib/studio/influencers/options'
import { cn } from '@/lib/utils'
import { formatModelCost } from '@/utils/format'
import { INFLUENCER_GENERATION_BILLED, INFLUENCER_GENERATION_SHOT_COUNT, type Model } from '@socialista/types'
import {
  CheckIcon,
  ChevronDownIcon,
  SparklesIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FieldLabel } from './influencer-option-controls'

type ModelHighlight = 'cheapest' | 'newest' | 'mostUsed'

const MODEL_HIGHLIGHT_CONFIG = {
  cheapest: { label: 'Cheapest', className: 'border-success/20 bg-success/10 text-success' },
  newest: { label: 'New', className: 'border-info/20 bg-info/10 text-info' },
  mostUsed: { label: 'Popular', className: 'border-warning/20 bg-warning/10 text-warning-foreground' },
} as const satisfies Record<ModelHighlight, { label: string; className: string }>

function getModelUsageCount(model: Model): number {
  if ('usageCount' in model && typeof model.usageCount === 'number') return model.usageCount
  return 0
}

function buildModelHighlights(models: Model[]): Map<string, ModelHighlight[]> {
  const highlights = new Map<string, ModelHighlight[]>()
  if (models.length === 0) return highlights
  const newestId = [...models].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?._id
  const cheapestId = [...models].sort((a, b) => a.cost - b.cost)[0]?._id
  const mostUsedModel = [...models].sort((a, b) => getModelUsageCount(b) - getModelUsageCount(a))[0]
  const mostUsedId = mostUsedModel && getModelUsageCount(mostUsedModel) > 0 ? mostUsedModel._id : undefined
  for (const model of models) {
    const modelHighlights: ModelHighlight[] = []
    if (model._id === newestId) modelHighlights.push('newest')
    if (model._id === cheapestId) modelHighlights.push('cheapest')
    if (mostUsedId && model._id === mostUsedId) modelHighlights.push('mostUsed')
    if (modelHighlights.length > 0) highlights.set(model._id, modelHighlights)
  }
  return highlights
}

export type InfluencerPromptComposerProps = {
  models: Model[]
  selectedModelId: string
  onSelectedModelChange: (id: string) => void
  onSubmit: (message: PromptInputMessage) => void
  disabled?: boolean
  /** When true, allow generate even without creative direction (e.g. niche selected). */
  formReady?: boolean
  /** When true, allow generate even without a prompt (style refs attached on the form). */
  hasStyleReferences?: boolean
  /** Resets prompt text when presets are applied */
  initialInput?: string
  composerKey?: string
}

function InfluencerPromptComposerInner({
  models,
  selectedModelId,
  onSelectedModelChange,
  onSubmit,
  disabled,
  formReady,
  hasStyleReferences,
}: InfluencerPromptComposerProps) {
  const { textInput } = usePromptInputController()
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedModel = useMemo(
    () => models.find(m => m._id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  )
  const chefs = useMemo(() => [...new Set(models.map(m => m.chef))].sort(), [models])
  const modelHighlights = useMemo(() => buildModelHighlights(models), [models])
  const generationCost = selectedModel ? selectedModel.cost * INFLUENCER_GENERATION_BILLED : 0

  const hasPrompt = textInput.value.trim().length > 0
  const canSubmit = (hasPrompt || hasStyleReferences || formReady) && !!selectedModel && !disabled

  const focusPrompt = useCallback(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        focusPrompt()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [focusPrompt])

  const modelSelector = selectedModel ? (
    <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
      <ModelSelectorTrigger asChild>
        <button
          aria-expanded={modelSelectorOpen}
          aria-haspopup="dialog"
          className={cn(
            'flex h-12 w-full items-center gap-3 rounded-[10px] border border-border/50 bg-background px-3 text-left',
            'shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-150',
            'hover:border-border/70 hover:bg-muted/15',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
            'disabled:pointer-events-none disabled:opacity-50',
            modelSelectorOpen && 'border-border/70 bg-muted/15',
          )}
          disabled={disabled}
          type="button"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/30">
            <ModelProviderIcon className="size-4" provider={selectedModel.modelProvider} />
          </span>
          <span className="min-w-0 flex-1">
            <ModelSelectorName className="block truncate text-[14px] font-medium leading-tight tracking-[-0.015em]">
              {selectedModel.name}
            </ModelSelectorName>
            <span className="mt-0.5 block text-[12px] leading-none text-muted-foreground">
              {formatModelCost(selectedModel.cost, selectedModel.costUnit)} per portrait
            </span>
          </span>
          <ChevronDownIcon
            className={cn(
              'size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200',
              modelSelectorOpen && 'rotate-180',
            )}
          />
        </button>
      </ModelSelectorTrigger>
      <ModelSelectorContent className="sm:max-w-104" title="Choose model">
        <ModelSelectorHeader heading="Models" description={`${models.length} available`} />
        <ModelSelectorInput placeholder="Search models…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models match.</ModelSelectorEmpty>
          {chefs.map(chef => (
            <ModelSelectorGroup heading={chef} key={chef}>
              {models
                .filter(m => m.chef === chef)
                .map(model => {
                  const isSelected = selectedModelId === model._id
                  const highlights = modelHighlights.get(model._id) ?? []
                  return (
                    <ModelSelectorItem
                      key={model._id}
                      data-checked={isSelected ? true : undefined}
                      onSelect={() => {
                        onSelectedModelChange(model._id)
                        setModelSelectorOpen(false)
                      }}
                      value={`${model.name} ${model.modelProvider}`}
                    >
                      <ModelSelectorLogoBadge>
                        <ModelProviderIcon className="size-3.5" provider={model.modelProvider} />
                      </ModelSelectorLogoBadge>
                      <span className="flex min-w-0 flex-1 items-center gap-1.5">
                        <ModelSelectorName className="min-w-0 flex-1 text-[13px] font-medium">
                          {model.name}
                        </ModelSelectorName>
                        {highlights.map(h => (
                          <Badge
                            key={h}
                            className={cn(
                              MODEL_HIGHLIGHT_CONFIG[h].className,
                              'h-4 rounded-full border-0 px-1.5 text-[9px]',
                            )}
                          >
                            {MODEL_HIGHLIGHT_CONFIG[h].label}
                          </Badge>
                        ))}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <ModelSelectorShortcut>
                          {formatModelCost(model.cost, model.costUnit)}
                        </ModelSelectorShortcut>
                        {isSelected ? <CheckIcon className="size-3.5" /> : null}
                      </span>
                    </ModelSelectorItem>
                  )
                })}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  ) : null

  const generationCostLabel = selectedModel
    ? formatModelCost(generationCost, selectedModel.costUnit)
    : null

  return (
    <div className="w-full scroll-mt-10 space-y-6" id="influencer-composer">
      <div>
        <FieldLabel icon={FIELD_ICONS.model}>Generation model</FieldLabel>
        {modelSelector}
        {selectedModel && generationCostLabel ? (
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            This model will generate your influencer.{' '}
            {INFLUENCER_GENERATION_SHOT_COUNT} portraits for{' '}
            <span className="font-medium tabular-nums text-foreground">{generationCostLabel}</span>
            {' '}total.
          </p>
        ) : null}
      </div>

      <div>
        <FieldLabel htmlFor="influencer-direction" icon={FIELD_ICONS.directions}>
          Creative direction
        </FieldLabel>
        <PromptInput
          className={cn(
            'rounded-[14px] border-border/50 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
            'has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/20',
          )}
          onSubmit={onSubmit}
          maxFiles={0}
        >
          <PromptInputBody className="relative">
            <PromptInputTextarea
              ref={textareaRef}
              id="influencer-direction"
              className="min-h-28 px-3.5 pt-3.5 pb-3 text-[15px] leading-[1.65] tracking-[-0.012em]"
              disabled={disabled}
              placeholder={INFLUENCER_PROMPT_PLACEHOLDER}
              onKeyDown={event => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
            />
          </PromptInputBody>

          <PromptInputFooter className="flex-col items-stretch border-t border-border/35 bg-muted/10 p-3">
            <PromptInputSubmit
              className={cn(
                'h-12 w-full gap-2 rounded-[10px] px-5 text-[15px] font-semibold',
                !canSubmit && 'opacity-45',
              )}
              disabled={!canSubmit}
              size="sm"
              status={disabled ? 'submitted' : undefined}
            >
              <SparklesIcon className="size-4" strokeWidth={1.75} />
              Generate {INFLUENCER_GENERATION_SHOT_COUNT} portraits
              {generationCostLabel ? (
                <span className="font-medium tabular-nums text-primary-foreground/80">
                  {generationCostLabel}
                </span>
              ) : null}
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground/75">
          Optional. Lighting, wardrobe, or energy — the look above still defines the person.
        </p>
        {!canSubmit && !disabled ? (
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground/75">
            Pick a niche, add a style reference, or write direction to generate.
          </p>
        ) : (
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground/60">
            <Kbd className="mr-1 h-4 min-w-4 border-border/40 bg-muted/30 px-1 text-[10px]">⌘↵</Kbd>
            to generate
          </p>
        )}
      </div>
    </div>
  )
}

export function InfluencerPromptComposer({
  initialInput = '',
  composerKey = 'default',
  ...props
}: InfluencerPromptComposerProps) {
  if (props.models.length === 0) {
    return (
      <div className="rounded-[1.375rem] border border-dashed border-border/50 bg-muted/10 px-6 py-14 text-center">
        <SparklesIcon className="mx-auto mb-4 size-8 text-muted-foreground/60" />
        <p className="text-[15px] font-semibold tracking-[-0.02em]">No image models available</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted-foreground">
          Add an image generation model to create AI influencers.
        </p>
      </div>
    )
  }

  return (
    <PromptInputProvider key={composerKey} initialInput={initialInput}>
      <InfluencerPromptComposerInner {...props} />
    </PromptInputProvider>
  )
}
