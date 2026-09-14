/* Landing page design tokens — Linear minimalism × Apple precision
   8px rhythm. Type scale is editorial: hero display, section titles one step down. */

export const landingSection = 'mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8'

export const landingSectionY = 'py-20 sm:py-24 lg:py-28'

export const landingContentGap = 'mt-10 sm:mt-14'

/** Hero display — Geist, tight tracking, 36–60px. Phrase-wraps in the heading, not mid-clause. */
export const landingH1 =
  'text-[clamp(2.25rem,1.05rem+4.4vw,3.75rem)] font-bold leading-[1.14] tracking-[-0.032em] sm:leading-[1.08] sm:tracking-[-0.042em]'

/** Section titles — one step below hero so the page has a real hierarchy */
export const landingH2 =
  'text-[clamp(1.875rem,3.6vw,2.625rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-balance'

export const landingH3 = 'text-[1.0625rem] font-semibold leading-[1.35] tracking-[-0.02em] sm:text-lg'

export const landingBody = 'max-w-112 text-[15px] leading-snug text-pretty text-muted-foreground'

export const landingBodySm = 'text-[0.9375rem] leading-[1.65] text-pretty text-muted-foreground'

export const landingLabel = 'text-[0.8125rem] font-medium tracking-[-0.01em] text-muted-foreground'

export const landingEyebrow = 'text-[0.75rem] font-medium uppercase tracking-[0.08em] text-muted-foreground'

export const landingSectionAlt = 'bg-[color-mix(in_oklch,var(--surface-0)_50%,var(--background))]'

export const landingNavLink =
  'relative text-sm font-medium tracking-[-0.01em] text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground after:absolute after:inset-x-0 after:-bottom-[0.15rem] after:h-px after:bg-current after:origin-center after:scale-x-0 after:transition-transform after:duration-150 after:ease-out hover:after:scale-x-100'

export const landingCard =
  'rounded-[calc(var(--radius)+6px)] border border-border bg-background transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]'

export const landingCardHover =
  'hover:border-[color-mix(in_oklch,var(--foreground)_12%,var(--border))] hover:shadow-[var(--shadow-sm)]'

export const landingMediaCard =
  'relative overflow-hidden rounded-[calc(var(--radius)+4px)] border border-border bg-surface-0 shadow-[var(--shadow-xs)]'

export const landingCtaPrimary = 'h-11 gap-2 rounded-full px-6 text-sm font-medium shadow-none'

export const landingCtaSecondary =
  'h-11 gap-2 rounded-full border-border/80 bg-background px-6 text-sm font-medium shadow-none hover:bg-muted/40'

export const landingCtaGhost = 'h-11 rounded-full px-4 text-sm font-medium text-muted-foreground hover:text-foreground'
