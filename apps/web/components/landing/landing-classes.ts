/* Landing page design tokens — Linear minimalism × Apple precision
   8px rhythm. Type scale is editorial: hero display, section titles one step down. */

export const landingSection = 'mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8'

/** Pricing grid — wider track so plan cards breathe */
export const landingSectionPricing =
  'mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-12 xl:px-14'

export const landingSectionY = 'py-20 sm:py-24 lg:py-28'

/** Warm hairline between landing story sections */
export const landingSectionDivider = 'landing-section-divider'

export const landingContentGap = 'mt-10 sm:mt-12 lg:mt-14'

/** Centered section lead — one rhythm across product blocks */
export const landingSectionLead =
  'mx-auto max-w-2xl text-pretty text-[1.0625rem] leading-7 text-[var(--landing-muted)] sm:text-lg sm:leading-8'

export const landingHeroEyebrow =
  'text-sm font-semibold tracking-[-0.015em] text-[var(--landing-orange)]'

export const landingHeroLead =
  'mx-auto max-w-2xl text-pretty text-[1.0625rem] leading-7 text-[var(--landing-muted)] sm:text-xl sm:leading-8'

export const landingFeatureCaptionTitle =
  'font-serif text-[1.25rem] italic leading-snug tracking-[-0.02em] text-[var(--landing-ink)] sm:text-[1.375rem]'

export const landingFeatureCaptionBody =
  'mt-2 text-[0.9375rem] leading-6 text-[var(--landing-muted)]'

export const landingMediaPanel =
  'relative overflow-hidden rounded-[var(--landing-media-radius)] bg-[#0c0c0c] outline outline-1 outline-[oklch(0_0_0/0.1)]'

export const landingCtaStack = 'flex flex-col justify-center gap-3 sm:flex-row sm:items-center'

/** Hero display — Geist, tight tracking, 36–60px. Phrase-wraps in the heading, not mid-clause. */
export const landingH1 =
  'text-[clamp(2.25rem,1.05rem+4.4vw,3.75rem)] font-bold leading-[1.14] tracking-[-0.032em] sm:leading-[1.08] sm:tracking-[-0.042em]'

/** Section titles — one step below hero so the page has a real hierarchy */
export const landingH2 =
  'text-[clamp(1.875rem,3.6vw,2.625rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-balance'

/** Primary landing section headlines (UGC, influencers, channels, etc.) */
export const landingSectionTitle =
  'text-balance text-[clamp(2.125rem,4.5vw,3.375rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--landing-ink)]'

export const landingSectionTitleAccent =
  'font-serif text-[1.02em] font-normal italic tracking-[-0.02em]'

export const landingH3 = 'text-[1.0625rem] font-semibold leading-[1.35] tracking-[-0.02em] sm:text-lg'

export const landingBody = 'max-w-112 text-[15px] leading-[1.6] text-pretty text-muted-foreground'

export const landingBodySm = 'text-[0.9375rem] leading-[1.65] text-pretty text-muted-foreground'

export const landingLabel = 'text-[0.8125rem] font-medium tracking-[-0.01em] text-muted-foreground'

export const landingEyebrow = 'text-[0.75rem] font-medium uppercase tracking-[0.08em] text-muted-foreground'

export const landingSectionAlt =
  'bg-[color-mix(in_srgb,var(--landing-stone)_22%,var(--landing-canvas))]'

export const landingNavLink =
  'relative text-sm font-medium tracking-[-0.01em] text-[var(--landing-muted)] transition-colors duration-150 ease-out hover:text-[var(--landing-ink)] after:absolute after:inset-x-0 after:-bottom-[0.15rem] after:h-px after:bg-current after:origin-center after:scale-x-0 after:transition-transform after:duration-150 after:ease-out hover:after:scale-x-100'

export const landingMediaCard =
  'relative overflow-hidden rounded-[calc(var(--radius)+4px)] border border-border bg-surface-0 shadow-[var(--shadow-xs)]'

export const landingCtaPrimary =
  'h-11 gap-2 rounded-full px-6 text-sm font-medium shadow-none transition-[transform,background-color,color,border-color,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96]'

export const landingCtaSecondary =
  'h-11 gap-2 rounded-full border-border/80 bg-background px-6 text-sm font-medium shadow-none hover:bg-muted/40'

export const landingCtaGhost = 'h-11 rounded-full px-4 text-sm font-medium text-muted-foreground hover:text-foreground'

/** Brand accent washes — --accent-orange & --guest-accent from globals.css */
/** Radial spotlight behind the hero h1 (sits under the headline in the stack). */
export const landingHeroHeadingGlow =
  'bg-[radial-gradient(ellipse_75%_52%_at_50%_58%,color-mix(in_oklch,var(--accent-orange)_10%,transparent),transparent_68%),radial-gradient(ellipse_50%_38%_at_50%_72%,color-mix(in_oklch,var(--accent-orange)_6%,transparent),transparent_72%),radial-gradient(ellipse_90%_45%_at_50%_50%,color-mix(in_oklch,var(--guest-accent)_4%,transparent),transparent_75%)]'

export const landingInfluencerGlow =
  'bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--accent-orange)_8%,transparent)_0%,transparent_50%),radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--foreground)_3%,transparent)_0%,transparent_72%)]'

export const landingFinalCtaGlow =
  'bg-[radial-gradient(ellipse_50%_80%_at_15%_50%,color-mix(in_oklch,var(--background)_10%,transparent),transparent_55%),radial-gradient(ellipse_45%_65%_at_88%_18%,color-mix(in_oklch,var(--accent-orange)_20%,transparent),transparent_50%),radial-gradient(ellipse_40%_55%_at_72%_75%,color-mix(in_oklch,var(--guest-accent)_14%,transparent),transparent_48%)]'

export const landingAccentUnderline =
  'text-[color-mix(in_oklch,var(--accent-orange)_88%,var(--foreground))]'

export const landingBentoTintOrange =
  'bg-[color-mix(in_oklch,var(--accent-orange)_13%,var(--background))]'

export const landingBentoTintOrangeSoft =
  'bg-[color-mix(in_oklch,var(--accent-orange)_7%,var(--background))]'

export const landingBentoTintSubtle = 'bg-accent-orange-subtle'

export const landingBentoTintNeutral =
  'bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))]'

export const landingBentoTintGuest =
  'bg-[color-mix(in_oklch,var(--guest-accent)_14%,var(--background))]'
