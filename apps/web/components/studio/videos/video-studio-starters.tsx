'use client'

import { useVideoStudio } from '@/components/studio/videos/video-studio-provider'
import { cn } from '@/lib/utils'

export const VIDEO_STUDIO_STARTERS = [
  {
    id: 'ugc',
    label: 'UGC turn',
    prompt:
      'Handheld UGC, creator turns toward camera and smiles, bathroom window light, native Reels energy, slight grain, casual crop, she says "this changed everything"',
  },
  {
    id: 'pdp',
    label: 'Product hero',
    prompt:
      'Slow push-in on a matte serum bottle on honed travertine, hard side light, steam and dust in the beam, luxury ecommerce hero, true color, no people',
  },
  {
    id: 'unbox',
    label: 'Unboxing',
    prompt:
      'Top-down unboxing on linen, hands open the box and lift the product toward camera, soft window light, tactile packaging sounds, launch-clip pacing',
  },
  {
    id: 'talking',
    label: 'Talking head',
    prompt:
      'Eye-level talking head, creator holding the product at chest height, slow handheld sway, soft morning window light, she delivers one confident line',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    prompt:
      'Lifestyle walk into a sunlit kitchen, product on the counter catching the light, gentle camera follow, warm daylight, quiet room tone',
  },
] as const

export function VideoStudioStarters({ disabled }: { disabled?: boolean }) {
  const { setPrompt } = useVideoStudio()

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label="Prompt starters">
      {VIDEO_STUDIO_STARTERS.map(starter => (
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
