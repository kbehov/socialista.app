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
  'text-sm font-medium tracking-[-0.02em] text-[var(--landing-muted)]'

/** Frosted surface on light sections — pairs with dark mockup glass */
export const landingGlassLight =
  'border border-[color-mix(in_srgb,var(--landing-ink)_7%,transparent)] bg-[color-mix(in_srgb,white_70%,var(--landing-canvas))] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.88),0_1px_2px_color-mix(in_oklch,var(--landing-ink)_4%,transparent),0_20px_44px_-28px_color-mix(in_oklch,var(--landing-ink)_12%,transparent)] backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-[color-mix(in_srgb,white_52%,var(--landing-canvas))]'

/** Light workflow mockup shells — flat, no wash gradients */
export const landingWorkflowPanel =
  'relative overflow-hidden rounded-[var(--landing-media-radius)] border border-[color-mix(in_srgb,var(--landing-ink)_7%,transparent)] bg-white shadow-[0_1px_2px_color-mix(in_oklch,var(--landing-ink)_5%,transparent)]'

/** Scheduling calendar — dark panel, clean edges */
export const landingWorkflowPanelDark =
  'relative overflow-hidden rounded-[var(--landing-media-radius)] bg-[#0c0c0c] outline outline-1 outline-[oklch(0_0_0/0.1)]'

/** Full-bleed dark landing bands (scheduling, influencers, …) */
export const landingSectionDark =
  'border-white/10 bg-[#0c0c0c] text-white [border-top-color:color-mix(in_srgb,white_10%,transparent)]'

export const landingWorkflowInsetCard =
  'rounded-[0.875rem] border border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] bg-[color-mix(in_srgb,var(--landing-stone)_14%,white)]'

export const landingWorkflowInsetCardDark =
  'rounded-[0.875rem] border border-white/[0.08] bg-white/[0.03]'

/** Shared glass on dark media mockups */
export const landingGlass =
  'border border-white/18 bg-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_12px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl'

export const landingGlassBadge =
  `${landingGlass} h-auto rounded-xl px-2 py-0.5 text-[0.6875rem] font-medium leading-4 tracking-[-0.01em] text-white/90 shadow-none hover:bg-white/[0.12] hover:text-white`

/** Subtle lift on dark media cards — see `.landing-media-hover` in globals.css */
export const landingMediaCardHover = 'landing-media-hover'

export const landingHeroDisplay =
  'text-balance font-semibold text-[clamp(2.875rem,6.8vw,6.4rem)] leading-[0.96] tracking-[-0.05em] text-[var(--landing-ink)] sm:leading-[0.94]'

/** Serif accent — hero headline and odd-index story sections */
export const landingHeroTitleAccent =
  'font-serif text-[1.02em] font-normal italic tracking-[-0.02em] text-[var(--landing-ink)]'

export const landingSectionTitleAccentSerif = landingHeroTitleAccent

export const landingHeroLead =
  'mx-auto max-w-2xl text-pretty text-[1.0625rem] leading-7 text-[var(--landing-muted)] sm:text-lg sm:leading-8'

export const landingFeatureCaptionTitle =
  'text-[1.125rem] font-semibold leading-snug tracking-[-0.025em] text-[var(--landing-ink)] sm:text-[1.25rem]'

export const landingFeatureCaptionTitleOnDark =
  'text-[1.125rem] font-semibold leading-snug tracking-[-0.025em] text-white sm:text-[1.25rem]'

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

/** Sans continuation — pairs with semibold section title (even-index story sections) */
export const landingSectionTitleAccent =
  'font-normal tracking-[-0.045em] text-[color-mix(in_srgb,var(--landing-ink)_68%,var(--landing-muted))]'

/**
 * Home page story order after the hero (1 = UGC, 2 = influencers, …).
 * Odd `storyIndex` → serif accent; even → sans. Keeps editorial rhythm consistent.
 */
export const LANDING_STORY_INDEX = {
  ugcAds: 1,
  influencers: 2,
  channels: 3,
  staticAds: 4,
  slideshows: 5,
  imageTemplates: 6,
  videos: 7,
  publish: 8,
  scheduling: 9,
  analytics: 10,
  features: 11,
  pricing: 12,
  faq: 13,
  getStarted: 14,
} as const

export type LandingStoryIndex =
  (typeof LANDING_STORY_INDEX)[keyof typeof LANDING_STORY_INDEX]

export function landingAccentToneForStory(storyIndex: LandingStoryIndex): 'serif' | 'sans' {
  return storyIndex % 2 === 1 ? 'serif' : 'sans'
}

export const landingH3 = 'text-[1.0625rem] font-semibold leading-[1.35] tracking-[-0.02em] sm:text-lg'

export const landingBody = 'max-w-112 text-[15px] leading-[1.6] text-pretty text-muted-foreground'

export const landingBodySm = 'text-[0.9375rem] leading-[1.65] text-pretty text-muted-foreground'

export const landingLabel = 'text-[0.8125rem] font-medium tracking-[-0.01em] text-muted-foreground'

export const landingEyebrow =
  'text-[0.8125rem] font-medium tracking-[-0.02em] text-[var(--landing-muted)]'

export const landingSectionAlt =
  'bg-[color-mix(in_srgb,var(--landing-stone)_18%,var(--landing-canvas))]'

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
  'bg-[radial-gradient(ellipse_78%_54%_at_50%_58%,color-mix(in_oklch,var(--landing-ink)_5%,transparent),transparent_70%),radial-gradient(ellipse_52%_40%_at_50%_72%,color-mix(in_oklch,var(--landing-ink)_3%,transparent),transparent_74%),radial-gradient(ellipse_88%_42%_at_50%_48%,color-mix(in_oklch,var(--accent-orange)_4%,transparent),transparent_78%)]'

export const landingInfluencerGlow =
  'bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--accent-orange)_8%,transparent)_0%,transparent_50%),radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--foreground)_3%,transparent)_0%,transparent_72%)]'

export const landingFinalCtaGlow =
  'bg-[radial-gradient(ellipse_55%_85%_at_18%_50%,color-mix(in_oklch,white_9%,transparent),transparent_56%),radial-gradient(ellipse_48%_62%_at_88%_16%,color-mix(in_oklch,white_7%,transparent),transparent_52%),radial-gradient(ellipse_42%_58%_at_70%_78%,color-mix(in_oklch,var(--accent-orange)_8%,transparent),transparent_50%)]'

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
