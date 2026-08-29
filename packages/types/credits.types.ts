/** $10 = 1000 credits. Stored AI amounts are credits, not USD. */
export const CREDITS_PER_USD = 100

/** Typical text-style generation (slideshow plan, video script, skill, captions). */
export const DEFAULT_GENERATION_CREDIT_COST = 2

export function usdToCredits(usd: number): number {
  return Math.round(usd * CREDITS_PER_USD * 10) / 10
}
