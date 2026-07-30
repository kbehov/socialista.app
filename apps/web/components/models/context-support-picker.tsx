'use client'

import { CONTEXT_SUPPORT_OPTIONS } from '@/lib/model-context-support'
import { cn } from '@/lib/utils'
import type { ContextSupport } from '@socialista/types'

type ContextSupportPickerProps = {
  value: ContextSupport[]
  onChange: (value: ContextSupport[]) => void
  disabled?: boolean
  'aria-invalid'?: boolean
}

export function ContextSupportPicker({
  value,
  onChange,
  disabled,
  'aria-invalid': ariaInvalid,
}: ContextSupportPickerProps) {
  const toggle = (support: ContextSupport) => {
    if (value.includes(support)) {
      // Keep at least one modality selected
      if (value.length === 1) return
      onChange(value.filter(item => item !== support))
      return
    }
    onChange([...value, support])
  }

  return (
    <div
      role="group"
      aria-label="Context supports"
      aria-invalid={ariaInvalid}
      className="grid grid-cols-2 gap-2"
    >
      {CONTEXT_SUPPORT_OPTIONS.map(option => {
        const Icon = option.icon
        const isSelected = value.includes(option.value)

        return (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => toggle(option.value)}
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
