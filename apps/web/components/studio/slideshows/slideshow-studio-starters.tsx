'use client'

import { useSlideshowStudio } from '@/components/studio/slideshows/slideshow-studio-provider'
import { cn } from '@/lib/utils'

export const SLIDESHOW_STUDIO_STARTERS = [
  {
    id: 'story',
    label: '30-day story',
    prompt:
      'I used this serum every night for 30 days and nobody talks about what actually changed. 7-slide story for women 22–32, first person then you, specific texture and timeline details, end on save this',
  },
  {
    id: 'list',
    label: 'Listicle',
    prompt:
      '5 skincare mistakes that quietly ruin your barrier. Numbered Instagram carousel, punchy hooks, one specific fix per slide, save-this energy',
  },
  {
    id: 'myth',
    label: 'Myth bust',
    prompt:
      "Everyone says you need a 10-step routine. They're wrong. Contrarian carousel that names the myth, why it stuck, and the 3-step version that actually works",
  },
  {
    id: 'routine',
    label: 'Routine',
    prompt:
      'The 6-minute morning I actually keep. Habit-stack carousel with exact times, products, and how it feels after two weeks. Comment "me" as the CTA',
  },
  {
    id: 'guide',
    label: 'How-to',
    prompt:
      'Stop layering actives like this if you want calm skin. Step-by-step guide carousel, biggest mistake first, then the order that actually works, save for later',
  },
] as const

export function SlideshowStudioStarters({ disabled }: { disabled?: boolean }) {
  const { setPrompt } = useSlideshowStudio()

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label="Prompt starters">
      {SLIDESHOW_STUDIO_STARTERS.map(starter => (
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
