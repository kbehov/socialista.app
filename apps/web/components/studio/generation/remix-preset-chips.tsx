'use client'

import { usePromptInputController } from '@/components/ai-elements/prompt-input'
import { cn } from '@/lib/utils'

export const IMAGE_REMIX_PRESETS = [
  {
    id: 'setting',
    label: 'New setting',
    prompt:
      'Keep the product and framing, and move the scene to a new setting that still feels premium and on-brand.',
  },
  {
    id: 'angle',
    label: 'Different angle',
    prompt: 'Same product and lighting, shot from a different angle so it feels fresh in the feed.',
  },
  {
    id: 'seasonal',
    label: 'Seasonal twist',
    prompt: 'Keep the product hero, and restyle the set with a seasonal mood, props, and color.',
  },
  {
    id: 'sale',
    label: 'Turn it into a sale ad',
    prompt:
      'Turn this into a sale announcement: bold offer energy, the product front and center, room for a short headline.',
  },
] as const

export function RemixPresetChips() {
  const { textInput } = usePromptInputController()

  return (
    <div className="flex flex-wrap gap-1.5">
      {IMAGE_REMIX_PRESETS.map(preset => {
        const active = textInput.value === preset.prompt

        return (
          <button
            key={preset.id}
            type="button"
            aria-pressed={active}
            onClick={() => textInput.setInput(preset.prompt)}
            className={cn(
              'inline-flex h-8 items-center rounded-full px-3',
              'text-[12px] font-medium tracking-[-0.015em]',
              'transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
              'active:scale-[0.96] motion-reduce:active:scale-100',
              active
                ? 'bg-foreground text-background'
                : 'bg-transparent text-foreground/72 ring-1 ring-inset ring-black/10 hover:bg-black/[0.04] hover:text-foreground dark:ring-white/12 dark:hover:bg-white/[0.06]',
            )}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}
