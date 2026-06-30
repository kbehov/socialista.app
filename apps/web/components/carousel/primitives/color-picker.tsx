'use client'

import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type ColorPickerProps = {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  className?: string
  allowNone?: boolean
}

const SWATCHES = [
  '#ffffff',
  '#000000',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
] as const

export function ColorPicker({ value, onChange, label, className, allowNone = true }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  const handleSwatch = useCallback(
    (color: string) => {
      onChange(color)
      setOpen(false)
    },
    [onChange],
  )

  const isNone = value === null

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-2 text-xs shadow-xs outline-none transition hover:bg-muted"
        aria-label={label ?? 'Pick color'}
      >
        <span
          className="size-4 rounded-sm border border-border"
          style={{
            background: isNone
              ? 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 50% / 8px 8px'
              : value,
          }}
        />
        {label ? <span className="text-muted-foreground">{label}</span> : null}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-44 rounded-md border bg-popover p-2 shadow-md">
            <div className="grid grid-cols-5 gap-1.5">
              {SWATCHES.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSwatch(color)}
                  className="size-6 rounded-sm border border-border transition hover:scale-110"
                  style={{ background: color }}
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={inputRef}
                type="color"
                value={value ?? '#ffffff'}
                onChange={e => onChange(e.target.value)}
                className="size-8 cursor-pointer rounded-md border border-input bg-transparent p-0"
                aria-label="Custom color"
              />
              {allowNone ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange(null)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex-1 rounded-md border px-2 py-1 text-xs transition hover:bg-muted',
                    isNone ? 'border-primary text-primary' : 'border-input text-muted-foreground',
                  )}
                >
                  None
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
