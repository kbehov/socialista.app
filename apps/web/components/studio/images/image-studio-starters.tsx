'use client'

import { useImageStudio } from '@/components/studio/images/image-studio-provider'
import { cn } from '@/lib/utils'

export const IMAGE_STUDIO_STARTERS = [
  {
    id: 'pdp',
    label: 'Luxury PDP',
    prompt:
      'Matte glass serum bottle on honed travertine, label square to camera, 50mm slight overhead, hard side light with controlled speculars, luxury ecommerce photography, true color, feed-ready',
  },
  {
    id: 'ugc',
    label: 'UGC hold',
    prompt:
      'Handheld product still, creator gripping the bottle at chest height, bathroom window light, native UGC for Reels, casual crop, slight grain, no studio backdrop',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    prompt:
      'Editorial beauty still, hard afternoon sun cutting across the set, film grain, muted palette, magazine cover energy, product as the only sharp subject',
  },
  {
    id: 'pack',
    label: 'Pack shot',
    prompt:
      'Clean pack shot on polished marble, soft overhead, infinite white falloff, catalog accuracy, true label color, ecommerce hero',
  },
  {
    id: 'tabletop',
    label: 'Tabletop',
    prompt:
      'Lifestyle tabletop, linen and citrus around the product, window side light, shallow depth, warm daylight, social still for a launch carousel',
  },
] as const

export function ImageStudioStarters({ disabled }: { disabled?: boolean }) {
  const { setPrompt } = useImageStudio()

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label="Prompt starters">
      {IMAGE_STUDIO_STARTERS.map(starter => (
        <button
          key={starter.id}
          type="button"
          title={starter.prompt}
          aria-label={`Use ${starter.label} prompt`}
          disabled={disabled}
          onClick={() => setPrompt(starter.prompt)}
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
          {starter.label}
        </button>
      ))}
    </div>
  )
}
