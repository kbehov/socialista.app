'use client'

import { MODEL_TYPE_OPTIONS } from '@/lib/model-type'
import { cn } from '@/lib/utils'
import type { ModelType } from '@socialista/types'

type ModelTypePickerProps = {
  value: ModelType
  onChange: (value: ModelType) => void
  disabled?: boolean
  'aria-invalid'?: boolean
}

export function ModelTypePicker({ value, onChange, disabled, 'aria-invalid': ariaInvalid }: ModelTypePickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Model type"
      aria-invalid={ariaInvalid}
      className="grid grid-cols-2 gap-2"
    >
      {MODEL_TYPE_OPTIONS.map(option => {
        const Icon = option.icon
        const isSelected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
              'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              'disabled:pointer-events-none disabled:opacity-50',
              isSelected
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-input hover:bg-muted/50',
              ariaInvalid && !isSelected && 'border-destructive/50',
            )}
          >
            <Icon
              className={cn('size-4 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')}
              aria-hidden
            />
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
