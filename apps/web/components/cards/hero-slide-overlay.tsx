type HeroSlideOverlayProps = {
  layout: 'caption' | 'card'
  hook: string
  line: string
  visible: boolean
}

export function HeroSlideOverlay({ layout, hook, line, visible }: HeroSlideOverlayProps) {
  if (!visible) return null

  if (layout === 'card') {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[2] mx-auto w-[min(86%,15.5rem)] -translate-y-1/2 rounded-2xl bg-white/[0.96] px-[0.95rem] pb-[0.95rem] pt-[0.85rem] text-left shadow-[0_10px_28px_-12px_rgb(0_0_0/0.45)]">
        <p className="text-[0.92rem] font-semibold leading-tight tracking-[-0.03em] text-[#111]">
          {hook}
        </p>
        <p className="mt-[0.35rem] text-xs leading-[1.45] text-[#111]/72">{line}</p>
      </div>
    )
  }

  return (
    <>
      <p
        className="pointer-events-none absolute inset-x-0 top-[12%] z-[2] px-[6.7cqw] text-center text-[7.1cqw] font-extrabold leading-tight tracking-[-0.03em] text-balance text-white"
        style={{
          textShadow:
            '-1px -1px 0 rgb(0 0 0 / 0.72), 1px -1px 0 rgb(0 0 0 / 0.72), -1px 1px 0 rgb(0 0 0 / 0.72), 1px 1px 0 rgb(0 0 0 / 0.72), 0 8px 18px rgb(0 0 0 / 0.28)',
        }}
      >
        {hook}
      </p>
      <p
        className="pointer-events-none absolute inset-x-0 bottom-[16%] z-[2] px-[6.7cqw] text-center text-[5.6cqw] font-extrabold leading-[1.3] tracking-[-0.03em] text-balance text-white"
        style={{
          textShadow:
            '-1px -1px 0 rgb(0 0 0 / 0.72), 1px -1px 0 rgb(0 0 0 / 0.72), -1px 1px 0 rgb(0 0 0 / 0.72), 1px 1px 0 rgb(0 0 0 / 0.72), 0 8px 18px rgb(0 0 0 / 0.28)',
        }}
      >
        {line}
      </p>
    </>
  )
}
