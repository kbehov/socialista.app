'use client'

import { cn } from '@/lib/utils'
import type { Preset } from '@socialista/types'

export function StudioPreset({
  presets,
  disabled,
  onApply,
}: {
  presets: Preset[]
  disabled?: boolean
  onApply: (preset: Preset) => void
}) {
  if (presets.length === 0) return null

  return (
    <div className="flex flex-col items-center gap-2">
      <p
        id="studio-preset-label"
        className="text-[11px] font-medium tracking-[-0.02em] text-black/40 dark:text-white/40"
      >
        Preset
      </p>
      <div
        className="flex flex-wrap items-center justify-center gap-1.5"
        role="group"
        aria-labelledby="studio-preset-label"
      >
        {presets.map(preset => (
          <button
            key={preset._id}
            type="button"
            title={preset.prompt}
            aria-label={`Use ${preset.name} preset`}
            disabled={disabled}
            onClick={() => onApply(preset)}
            className={cn(
              'rounded-lg border border-black/10 bg-black/[0.02] px-2.5 py-1 text-[11px] font-medium tracking-[-0.015em] text-black/56',
              'transition-[background-color,border-color,color,transform] duration-150',
              'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground',
              'active:scale-[0.97] motion-reduce:active:scale-100',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
              'disabled:pointer-events-none disabled:opacity-40',
              'dark:border-white/12 dark:bg-white/[0.03] dark:text-white/56',
              'dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
            )}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  )
}
