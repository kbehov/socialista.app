'use client'

export function StudioHero() {
  return (
    <header className="space-y-4 sm:space-y-5">
      <div className="flex items-center">
        <span className="inline-flex h-6 items-center rounded-full bg-foreground/[0.035] px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-border/45">
          Image studio
        </span>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        <h1 className="text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.035em] text-foreground sm:text-[2.375rem]">
          Generate images
        </h1>
        <p className="max-w-lg text-pretty text-[15px] leading-[1.6] tracking-[-0.012em] text-muted-foreground">
          Describe the mood, style, and scene — then generate visuals ready for your channels.
        </p>
      </div>
    </header>
  )
}
