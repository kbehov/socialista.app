/* Landing page design tokens — Linear minimalism × Apple precision
   8px rhythm. Type scale is editorial, not dashboard-dense. */

export const landingSection = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

export const landingSectionY = "py-20 sm:py-24 lg:py-28";

export const landingContentGap = "mt-12 sm:mt-16";

/** Default landing section title — Geist, bold, 40px+ */
export const landingH1 =
  "text-[clamp(2.5rem,5.25vw,3.5rem)] font-bold leading-[1.06] tracking-[-0.04em] text-balance";

export const landingH2 =
  "text-[clamp(2.5rem,5.25vw,3.5rem)] font-bold leading-[1.06] tracking-[-0.04em] text-balance";

export const landingH3 =
  "text-lg font-semibold leading-[1.3] tracking-[-0.02em]";

export const landingBody =
  "max-w-xl text-base leading-[1.65] text-pretty text-muted-foreground";

export const landingBodySm = "text-sm leading-[1.5] text-muted-foreground";

export const landingLabel =
  "text-sm font-medium tracking-[-0.01em] text-muted-foreground";

export const landingMockupLabel =
  "text-[0.625rem] font-medium text-muted-foreground";

export const landingSectionAlt =
  "bg-[color-mix(in_oklch,var(--surface-0)_50%,var(--background))]";

export const landingNavLink =
  "relative text-sm font-medium tracking-[-0.01em] text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground after:absolute after:inset-x-0 after:-bottom-[0.15rem] after:h-px after:bg-current after:origin-center after:scale-x-0 after:transition-transform after:duration-150 after:ease-out hover:after:scale-x-100";

export const landingCard =
  "rounded-[calc(var(--radius)+6px)] border border-border bg-background transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const landingCardHover =
  "hover:border-[color-mix(in_oklch,var(--foreground)_12%,var(--border))] hover:shadow-[var(--shadow-sm)]";

export const landingMediaCard =
  "relative overflow-hidden rounded-[calc(var(--radius)+4px)] border border-border bg-surface-0 shadow-[var(--shadow-xs)]";

export const landingMockupCard =
  "overflow-hidden rounded-[calc(var(--radius)-2px)] border border-border bg-surface-0";

export const landingCtaPrimary =
  "h-11 gap-2 rounded-full px-6 text-sm font-medium shadow-none";

export const landingCtaSecondary =
  "h-11 gap-2 rounded-full border-border/80 bg-background px-6 text-sm font-medium shadow-none hover:bg-muted/40";

export const landingCtaGhost =
  "h-11 rounded-full px-4 text-sm font-medium text-muted-foreground hover:text-foreground";
