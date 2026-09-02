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
import { PromptInputButton } from '@/components/ai-elements/prompt-input'
import { ModelLogo } from '@/components/icons/model-logo'
import { StudioInputActionTooltip } from '@/components/studio/prompt/studio-input-action-tooltip'
import {
  STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
  STUDIO_TOOL_BUTTON_CLASS,
  STUDIO_TOOL_CHEVRON_CLASS,
} from '@/components/studio/prompt/studio-composer-surface'
import { getModelCompanyName } from '@/lib/model-company'
import { cn } from '@/lib/utils'
import { formatModelCost } from '@/utils/format'
import type { Model } from '@socialista/types'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

type StudioComposerModelSelectorProps = {
  models: Model[]
  selectedModelId: string
  onSelectedModelChange: (modelId: string) => void
  disabled?: boolean
  heading?: string
  tooltip?: string
}

export function StudioComposerModelSelector({
  models,
  selectedModelId,
  onSelectedModelChange,
  disabled = false,
  heading = 'Text models',
  tooltip = 'Copy model — writes the slides',
}: StudioComposerModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedModel = models.find(model => model._id === selectedModelId) ?? models[0]
  const companyNames = useMemo(
    () => [...new Set(models.map(model => getModelCompanyName(model)))].sort(),
    [models],
  )

  if (!selectedModel) return null

  return (
    <ModelSelector onOpenChange={setOpen} open={open}>
      <StudioInputActionTooltip label={tooltip}>
        <ModelSelectorTrigger asChild>
          <PromptInputButton
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={tooltip}
            className={cn(
              STUDIO_TOOL_BUTTON_CLASS,
              'max-w-[min(100%,12rem)] min-w-0 [&_svg]:text-foreground/70',
              open && STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
            )}
            disabled={disabled}
            size="xs"
            type="button"
          >
            <ModelLogo className="size-3.5 shrink-0" model={selectedModel} size={14} />
            <ModelSelectorName className="min-w-0 text-[12px] font-medium leading-none tracking-[-0.015em]">
              {selectedModel.name}
            </ModelSelectorName>
            <ChevronDownIcon
              className={cn(
                STUDIO_TOOL_CHEVRON_CLASS,
                'transition-transform duration-150',
                open && 'rotate-180',
              )}
            />
          </PromptInputButton>
        </ModelSelectorTrigger>
      </StudioInputActionTooltip>

      <ModelSelectorContent className="sm:max-w-104" title="Choose model">
        <ModelSelectorHeader
          heading={heading}
          description={
            <>
              {models.length} available
              {companyNames.length > 1 ? ` · ${companyNames.length} companies` : null}
            </>
          }
        />
        <ModelSelectorInput placeholder="Search by name or provider…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models match your search.</ModelSelectorEmpty>
          {companyNames.map(companyName => (
            <ModelSelectorGroup heading={companyName} key={companyName}>
              {models
                .filter(model => getModelCompanyName(model) === companyName)
                .map(model => {
                  const isSelected = selectedModelId === model._id

                  return (
                    <ModelSelectorItem
                      key={model._id}
                      data-checked={isSelected ? true : undefined}
                      onSelect={() => {
                        onSelectedModelChange(model._id)
                        setOpen(false)
                      }}
                      value={`${model.name} ${model.modelProvider} ${getModelCompanyName(model)}`}
                    >
                      <ModelSelectorLogoBadge>
                        <ModelLogo className="size-3.5" model={model} size={14} />
                      </ModelSelectorLogoBadge>

                      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                        <ModelSelectorName className="min-w-0 text-[13px] font-medium leading-none tracking-[-0.016em]">
                          {model.name}
                        </ModelSelectorName>
                        <span className="text-[11px] tracking-[-0.01em] text-muted-foreground/70">
                          {model.modelProvider}
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
  )
}
