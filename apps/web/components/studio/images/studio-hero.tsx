'use client'

export function StudioHero() {
  return (
    <header className="mx-auto max-w-xl space-y-4 text-center sm:space-y-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
        Image studio
      </p>

      <div className="space-y-3 sm:space-y-3.5">
        <h1 className="font-serif text-balance text-[2.25rem] font-medium leading-[1.08] tracking-[-0.02em] text-foreground sm:text-[2.75rem] sm:leading-[1.05]">
          Imagine it. Create it.
        </h1>
        <p className="mx-auto max-w-md text-pretty text-[15px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
          Describe the mood, style, and scene — generate visuals ready for your channels.
        </p>
      </div>
    </header>
  )
}
