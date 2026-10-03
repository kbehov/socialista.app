/* Landing page design tokens — Linear minimalism × Apple precision
   8px rhythm. Type scale is editorial: hero display, section titles one step down. */

export const landingSection = 'mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8'

/** Pricing grid — wider track so plan cards breathe */
export const landingSectionPricing = 'mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-12 xl:px-14'

/** Marketing footer — full marketing width */
export const landingFooter =
  'mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-16'

export const landingFooterColumnTitle =
  'text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--landing-muted)]'

export const landingFooterLink =
  'inline-block rounded-sm text-[0.8125rem] leading-[1.45] tracking-[-0.01em] text-[color-mix(in_srgb,var(--landing-ink)_70%,var(--landing-muted))] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-[var(--landing-ink)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--landing-ink)]'

export const landingFooterLinkOnDark =
  'inline-block rounded-sm text-[0.8125rem] leading-[1.45] tracking-[-0.01em] text-white/70 outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white'

export const landingSectionY = 'py-24 sm:py-28 lg:py-32'

/** Trust / catalog bands — tighter than primary feature sections */
export const landingSupportingSectionY = 'py-14 sm:py-16 lg:py-[4.5rem]'

/** Warm hairline between landing story sections */
export const landingSectionDivider = 'landing-section-divider'

export const landingContentGap = 'mt-12 sm:mt-14 lg:mt-16'

export const landingSupportingContentGap = 'mt-8 sm:mt-9'

/** Single-line supporting headline (models, integrations, etc.) */
export const landingSupportingTitle =
  'mx-auto max-w-[36rem] text-balance text-center text-base font-medium leading-[1.45] tracking-[-0.025em] text-[var(--landing-ink)] sm:text-[1.125rem] sm:leading-[1.5]'

/** Centered section lead — one rhythm across product blocks */
/** Small uppercase kicker above section titles */
export const landingEyebrow = 'text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--landing-muted)]'

export const landingSectionLead =
  'mx-auto max-w-2xl text-pretty text-[0.9375rem] leading-[1.6] text-[var(--landing-muted)] sm:text-base sm:leading-[1.65]'

/** Frosted surface on light sections — pairs with dark mockup glass */
export const landingGlassLight =
  'border border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] bg-[color-mix(in_srgb,white_82%,var(--landing-canvas))] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.92),0_1px_2px_color-mix(in_oklch,var(--landing-ink)_3%,transparent),0_16px_40px_-32px_color-mix(in_oklch,var(--landing-ink)_8%,transparent)] backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-[color-mix(in_srgb,white_58%,var(--landing-canvas))]'

/** Inset panel for diagrams and trust strips on white sections */
export const landingInsetPanel =
  'rounded-[var(--landing-panel-radius)] border border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] bg-[var(--landing-surface-muted)] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.9)]'

/** Workflow mockup shells — inverted surface */
export const landingWorkflowPanel =
  'relative overflow-hidden rounded-[var(--landing-media-radius)] border border-background/10 bg-foreground text-background shadow-[0_1px_2px_color-mix(in_oklch,var(--landing-ink)_5%,transparent)]'

/** Scheduling calendar — dark panel, clean edges */
export const landingWorkflowPanelDark =
  'relative overflow-hidden rounded-[var(--landing-media-radius)] bg-[var(--landing-section-dark)] outline outline-1 outline-[oklch(0_0_0/0.1)]'

/** Full-bleed dark landing bands (scheduling, influencers, …) */
export const landingSectionDark =
  'border-white/10 bg-[var(--landing-section-dark)] text-white [border-top-color:color-mix(in_srgb,white_10%,transparent)]'

export const landingWorkflowInsetCard =
  'rounded-[var(--landing-inset-radius)] border border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] bg-[color-mix(in_srgb,var(--landing-stone)_14%,white)]'

export const landingWorkflowInsetCardDark =
  'rounded-[var(--landing-inset-radius)] border border-white/[0.08] bg-white/[0.03]'

/** Shared glass on dark media mockups */
export const landingGlass =
  'border border-white/18 bg-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_12px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl'

export const landingGlassBadge = `${landingGlass} h-auto rounded-xl px-2 py-0.5 text-[0.6875rem] font-medium leading-4 tracking-[-0.01em] text-white/90 shadow-none hover:bg-white/[0.12] hover:text-white`

/** Subtle lift on dark media cards — see `.landing-media-hover` in globals.css */
export const landingMediaCardHover = 'landing-media-hover'

export const landingHeroDisplay =
  'text-balance font-semibold text-6xl leading-[0.98] tracking-[-0.05em] text-[var(--landing-ink)] sm:leading-[0.95]'

/** Serif accent — hero headline and every section title accent */
export const landingHeroTitleAccent =
  'font-serif text-[1.02em] font-normal italic tracking-[-0.02em] text-[var(--landing-ink)]'

export const landingSectionTitleAccentSerif = landingHeroTitleAccent

export const landingHeroLead =
  'mx-auto max-w-xl text-pretty text-sm leading-[1.6] text-[var(--landing-muted)] sm:text-[1.0625rem] sm:leading-[1.65]'

export const landingFeatureCaptionTitle =
  'text-[1.125rem] font-semibold leading-snug tracking-[-0.025em] text-[var(--landing-ink)] sm:text-[1.25rem]'

export const landingFeatureCaptionTitleOnDark =
  'text-[1.125rem] font-semibold leading-snug tracking-[-0.025em] text-white sm:text-[1.25rem]'

export const landingFeatureCaptionBody =
  'mt-2 text-[0.8125rem] leading-[1.55] text-[var(--landing-muted)] sm:text-[0.875rem] sm:leading-6'

/** Pricing tiers stay paper-white even when OS / app theme is dark */
export const landingPricingCardSurface =
  'bg-white text-[var(--landing-ink)] dark:bg-white dark:text-[var(--landing-ink)]'

/** Dark pricing tiers on the landing section — matches feature media panels */
export const landingPricingCardDark =
  'bg-[var(--landing-section-dark)] text-white dark:bg-[var(--landing-section-dark)] dark:text-white'

export const landingMediaPanel =
  'relative overflow-hidden rounded-[var(--landing-media-radius)] bg-[var(--landing-section-dark)] outline outline-1 outline-[oklch(0_0_0/0.1)]'

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

export const landingH3 = 'text-[1.0625rem] font-semibold leading-[1.35] tracking-[-0.02em] sm:text-lg'

export const landingBody =
  'max-w-112 text-[0.875rem] leading-[1.6] text-pretty text-muted-foreground sm:text-[0.9375rem]'

export const landingBodySm = 'text-[0.9375rem] leading-[1.65] text-pretty text-muted-foreground'

export const landingLabel = 'text-[0.8125rem] font-medium tracking-[-0.01em] text-muted-foreground'

export const landingSectionAlt = 'bg-[var(--landing-surface-muted)]'

/** Keyboard ring for text links and chips. Buttons already ring via `Button`. */
export const landingFocusRing =
  'rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--landing-ink)]'

export const landingFocusRingOnDark =
  'rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white'

/** 1px image edge. Pure black on light, pure white on dark — never a tinted neutral. */
export const landingImageOutline = 'outline outline-1 -outline-offset-1 outline-[oklch(0_0_0/0.1)]'

export const landingImageOutlineOnDark = 'outline outline-1 -outline-offset-1 outline-[oklch(1_0_0/0.1)]'

export const landingNavLink =
  'relative rounded-sm text-sm font-medium tracking-[-0.01em] text-[var(--landing-muted)] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-[var(--landing-ink)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--landing-ink)] after:absolute after:inset-x-0 after:-bottom-[0.15rem] after:h-px after:bg-current after:origin-center after:scale-x-0 after:transition-transform after:duration-150 after:ease-[cubic-bezier(0.2,0,0,1)] hover:after:scale-x-100'

export const landingMediaCard =
  'relative overflow-hidden rounded-[calc(var(--radius)+4px)] border border-border bg-surface-0 shadow-[var(--shadow-xs)]'

export const landingCtaPress =
  'transition-[transform,background-color,color,border-color,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100'

export const landingCtaPrimary = `h-11 gap-2 rounded-full px-6 text-sm font-medium shadow-none bg-[var(--landing-charcoal)] text-white hover:bg-[color-mix(in_oklch,var(--landing-charcoal),white_10%)] ${landingCtaPress}`

/** Hero, final CTA, pricing fallback */
export const landingCtaPrimaryLg = `h-12 gap-2 rounded-full px-7 text-[0.9375rem] font-medium shadow-none bg-[var(--landing-charcoal)] text-white hover:bg-[color-mix(in_oklch,var(--landing-charcoal),white_10%)] ${landingCtaPress}`

/** Sticky header primary */
export const landingCtaPrimaryCompact = `h-10 gap-1.5 rounded-full px-6 text-sm font-medium shadow-none bg-[var(--landing-charcoal)] text-white hover:bg-[color-mix(in_oklch,var(--landing-charcoal),white_10%)] ${landingCtaPress}`

export const landingCtaGoogle = `h-12 gap-2 rounded-full border border-[color-mix(in_srgb,var(--landing-stone)_85%,transparent)] bg-[color-mix(in_srgb,white_88%,var(--landing-canvas))] px-7 text-[0.9375rem] font-medium text-[var(--landing-ink)] shadow-none hover:bg-[color-mix(in_srgb,white_72%,var(--landing-canvas))] ${landingCtaPress}`

export const landingCtaGoogleCompact = `h-10 gap-2 rounded-full border border-[color-mix(in_srgb,var(--landing-stone)_85%,transparent)] bg-[color-mix(in_srgb,white_88%,var(--landing-canvas))] px-5 text-sm font-medium text-[var(--landing-ink)] shadow-none hover:bg-[color-mix(in_srgb,white_72%,var(--landing-canvas))] ${landingCtaPress}`

export const landingCtaGoogleInverted = `border-[color-mix(in_srgb,var(--landing-canvas)_35%,transparent)] bg-[color-mix(in_srgb,var(--landing-canvas)_12%,transparent)] text-[color-mix(in_srgb,var(--landing-canvas)_96%,white)] hover:bg-[color-mix(in_srgb,var(--landing-canvas)_18%,transparent)]`

export const landingCtaPrimaryInverted =
  'bg-[color-mix(in_srgb,var(--landing-canvas)_96%,white)] text-[var(--landing-charcoal)] hover:bg-[color-mix(in_srgb,var(--landing-canvas)_88%,white)]'

export const landingCtaSecondary = `h-11 gap-2 rounded-full border-border/80 bg-background px-6 text-sm font-medium shadow-none hover:bg-muted/40 ${landingCtaPress}`

export const landingCtaGhost = `h-11 rounded-full px-4 text-sm font-medium text-muted-foreground hover:text-foreground ${landingCtaPress}`

/** Brand accent washes — --accent-orange & --guest-accent from globals.css */
/** Radial spotlight behind the hero h1 (sits under the headline in the stack). */
export const landingHeroHeadingGlow =
  'bg-[radial-gradient(ellipse_78%_54%_at_50%_58%,color-mix(in_oklch,var(--landing-ink)_5%,transparent),transparent_70%),radial-gradient(ellipse_52%_40%_at_50%_72%,color-mix(in_oklch,var(--landing-ink)_3%,transparent),transparent_74%),radial-gradient(ellipse_88%_42%_at_50%_48%,color-mix(in_oklch,var(--accent-orange)_4%,transparent),transparent_78%)]'

export const landingInfluencerGlow =
  'bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--accent-orange)_8%,transparent)_0%,transparent_50%),radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--foreground)_3%,transparent)_0%,transparent_72%)]'

export const landingFinalCtaGlow =
  'bg-[radial-gradient(ellipse_55%_85%_at_18%_50%,color-mix(in_oklch,white_9%,transparent),transparent_56%),radial-gradient(ellipse_48%_62%_at_88%_16%,color-mix(in_oklch,white_7%,transparent),transparent_52%),radial-gradient(ellipse_42%_58%_at_70%_78%,color-mix(in_oklch,var(--accent-orange)_8%,transparent),transparent_50%)]'

export const landingAccentUnderline = 'text-[color-mix(in_oklch,var(--accent-orange)_88%,var(--foreground))]'

export const landingBentoTintOrange = 'bg-[color-mix(in_oklch,var(--accent-orange)_13%,var(--background))]'

export const landingBentoTintOrangeSoft = 'bg-[color-mix(in_oklch,var(--accent-orange)_7%,var(--background))]'

export const landingBentoTintSubtle = 'bg-accent-orange-subtle'

export const landingBentoTintNeutral = 'bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))]'

export const landingBentoTintGuest = 'bg-[color-mix(in_oklch,var(--guest-accent)_14%,var(--background))]'
