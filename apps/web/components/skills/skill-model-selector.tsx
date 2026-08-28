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
import { ModelLogo } from '@/components/icons/model-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getModelCompanyName } from '@/lib/model-company'
import { formatModelCost } from '@/utils/format'
import type { Model } from '@socialista/types'
import { CheckIcon, ChevronDownIcon, Loader2Icon } from 'lucide-react'
import { useMemo, useState } from 'react'

type SkillModelSelectorProps = {
  models: Model[]
  selectedModelId: string
  onSelectedModelChange: (modelId: string) => void
  loading?: boolean
  disabled?: boolean
  id?: string
}

export function SkillModelSelector({
  models,
  selectedModelId,
  onSelectedModelChange,
  loading = false,
  disabled = false,
  id,
}: SkillModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedModel = models.find(model => model._id === selectedModelId) ?? models[0]
  const companyNames = useMemo(
    () => [...new Set(models.map(model => getModelCompanyName(model)))].sort(),
    [models],
  )

  if (loading && models.length === 0) {
    return (
      <Button
        id={id}
        type="button"
        variant="outline"
        size="sm"
        className="h-9 w-full justify-start"
        disabled
      >
        <Loader2Icon className="size-3.5 animate-spin" />
        Loading models…
      </Button>
    )
  }

  if (!selectedModel) {
    return (
      <Button
        id={id}
        type="button"
        variant="outline"
        size="sm"
        className="h-9 w-full justify-start"
        disabled
      >
        No text models available
      </Button>
    )
  }

  return (
    <ModelSelector onOpenChange={setOpen} open={open}>
      <ModelSelectorTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={open}
          aria-haspopup="dialog"
          disabled={disabled}
          className={cn('h-9 w-full justify-between px-2.5 font-normal', open && 'border-ring/40')}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-[0.4375rem] bg-muted/50 ring-1 ring-border/30">
              <ModelLogo className="size-3" model={selectedModel} size={12} />
            </span>
            <ModelSelectorName className="text-[13px] font-medium leading-none tracking-[-0.015em]">
              {selectedModel.name}
            </ModelSelectorName>
          </span>
          <ChevronDownIcon
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200 ease-out',
              open && 'rotate-180',
            )}
          />
        </Button>
      </ModelSelectorTrigger>

      <ModelSelectorContent className="sm:max-w-104" title="Choose model">
        <ModelSelectorHeader
          heading="Text models"
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
