import { SocialistaMark } from '@/components/common/logo'
import { MoreHorizontal } from 'lucide-react'

type HeroSlideOverlayProps = {
  layout: 'caption' | 'card'
  hook: string
  line: string
  visible: boolean
}

export function HeroSlideOverlay({ layout, hook, line, visible }: HeroSlideOverlayProps) {
  if (!visible) return null

  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] flex items-center justify-between gap-2 px-[4.5cqw] pb-[3.2cqw] pt-[12cqw]"
        style={{
          background:
            'linear-gradient(to bottom, rgb(0 0 0 / 0.58), rgb(0 0 0 / 0.2) 78%, transparent)',
        }}
      >
        <SocialistaMark compact className="min-w-0 flex-1" />
        <MoreHorizontal
          className="size-[3.4cqw] shrink-0 text-white/90"
          strokeWidth={2.25}
          aria-hidden="true"
        />
      </div>

      {layout === 'card' ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[14%] z-[2] mx-auto w-[min(86%,15.5rem)] rounded-2xl bg-white/[0.96] px-[0.95rem] pb-[0.95rem] pt-[0.85rem] text-left shadow-[0_10px_28px_-12px_rgb(0_0_0/0.45)]">
          <p className="text-[0.92rem] font-semibold leading-tight tracking-[-0.03em] text-[#111]">
            {hook}
          </p>
          <p className="mt-[0.35rem] text-xs leading-[1.45] text-[#111]/72">{line}</p>
        </div>
      ) : (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] px-[4.5cqw] pb-[7.5cqw] pt-12"
          style={{
            background:
              'linear-gradient(to top, rgb(0 0 0 / 0.68), rgb(0 0 0 / 0.24) 58%, transparent)',
          }}
        >
          <p className="text-[3.1cqw] font-semibold leading-none text-white/95">@socialista</p>
          <p className="mt-[1.6cqw] text-[3.5cqw] font-semibold leading-[1.35] tracking-[-0.02em] text-pretty text-white">
            {hook}
          </p>
          <p className="mt-[1cqw] text-[2.9cqw] leading-[1.45] text-pretty text-white/88">{line}</p>
        </div>
      )}
    </>
  )
}
