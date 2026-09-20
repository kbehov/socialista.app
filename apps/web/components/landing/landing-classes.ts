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

/** Shared glass on dark media mockups */
export const landingGlass =
  'border border-white/18 bg-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_12px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl'

export const landingGlassBadge =
  `${landingGlass} h-auto rounded-xl px-2 py-0.5 text-[0.6875rem] font-medium leading-4 tracking-[-0.01em] text-white/90 shadow-none hover:bg-white/[0.12] hover:text-white`

/** Subtle lift on dark media cards — see `.landing-media-hover` in globals.css */
export const landingMediaCardHover = 'landing-media-hover'

export const landingHeroDisplay =
  'text-balance font-semibold text-[clamp(2.875rem,6.8vw,6.4rem)] leading-[0.96] tracking-[-0.05em] text-[var(--landing-ink)] sm:leading-[0.94]'

export const landingHeroLead =
  'mx-auto max-w-2xl text-pretty text-[1.0625rem] leading-7 text-[var(--landing-muted)] sm:text-lg sm:leading-8'

export const landingFeatureCaptionTitle =
  'font-serif text-[1.25rem] italic leading-snug tracking-[-0.02em] text-[var(--landing-ink)] sm:text-[1.375rem]'

export const landingFeatureCaptionBody =
  'mt-2 text-[0.9375rem] leading-6 text-[var(--landing-muted)]'

/** Pricing tiers stay paper-white even when OS / app theme is dark */
export const landingPricingCardSurface =
  'bg-white text-[var(--landing-ink)] dark:bg-white dark:text-[var(--landing-ink)]'

/** Dark pricing tiers on the landing section — matches feature media panels */
export const landingPricingCardDark =
  'bg-[#0c0c0c] text-white dark:bg-[#0c0c0c] dark:text-white'

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

export const landingCtaPress =
  'transition-[transform,background-color,color,border-color,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96]'

export const landingCtaPrimary =
  `h-11 gap-2 rounded-full px-6 text-sm font-medium shadow-none bg-[var(--landing-charcoal)] text-white hover:bg-[color-mix(in_oklch,var(--landing-charcoal),white_10%)] ${landingCtaPress}`

/** Hero, final CTA, pricing fallback */
export const landingCtaPrimaryLg =
  `h-12 gap-2 rounded-full px-7 text-[0.9375rem] font-medium shadow-none bg-[var(--landing-charcoal)] text-white hover:bg-[color-mix(in_oklch,var(--landing-charcoal),white_10%)] ${landingCtaPress}`

/** Sticky header primary */
export const landingCtaPrimaryCompact =
  `h-10 gap-1.5 rounded-full px-6 text-sm font-medium shadow-none bg-[var(--landing-charcoal)] text-white hover:bg-[color-mix(in_oklch,var(--landing-charcoal),white_10%)] ${landingCtaPress}`

export const landingCtaGoogle =
  `h-12 gap-2 rounded-full border border-[color-mix(in_srgb,var(--landing-stone)_85%,transparent)] bg-[color-mix(in_srgb,white_88%,var(--landing-canvas))] px-7 text-[0.9375rem] font-medium text-[var(--landing-ink)] shadow-none hover:bg-[color-mix(in_srgb,white_72%,var(--landing-canvas))] ${landingCtaPress}`

export const landingCtaGoogleCompact =
  `h-10 gap-2 rounded-full border border-[color-mix(in_srgb,var(--landing-stone)_85%,transparent)] bg-[color-mix(in_srgb,white_88%,var(--landing-canvas))] px-5 text-sm font-medium text-[var(--landing-ink)] shadow-none hover:bg-[color-mix(in_srgb,white_72%,var(--landing-canvas))] ${landingCtaPress}`

export const landingCtaGoogleInverted =
  `border-[color-mix(in_srgb,var(--landing-canvas)_35%,transparent)] bg-[color-mix(in_srgb,var(--landing-canvas)_12%,transparent)] text-[color-mix(in_srgb,var(--landing-canvas)_96%,white)] hover:bg-[color-mix(in_srgb,var(--landing-canvas)_18%,transparent)]`

export const landingCtaPrimaryInverted =
  'bg-[color-mix(in_srgb,var(--landing-canvas)_96%,white)] text-[var(--landing-charcoal)] hover:bg-[color-mix(in_srgb,var(--landing-canvas)_88%,white)]'

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
