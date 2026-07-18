import type { StaticAdAspectRatio } from './types'

export type StaticAdFormatPreset = {
  id: string
  label: string
  description: string
  prompt: string
  aspectRatio: StaticAdAspectRatio
  trending: boolean
}

/**
 * Ready-to-use creative directions for common Meta performance formats.
 * Prompts are written to match the conversion-first static-ad planner.
 */
export const STATIC_AD_FORMAT_PRESETS = [
  {
    id: 'ugc-hold',
    label: 'UGC hold',
    description: 'Creator holding the product to camera',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      'UGC aesthetic, real creator holding the product toward the camera in a natural setting that fits the product niche, slightly messy authentic background, casual phone-camera look, product label readable, strong conversion headline and clear Shop now CTA, Meta Stories/feed performance creative — not studio billboard',
  },
  {
    id: 'ugc-fitness',
    label: 'Fitness UGC',
    description: 'Gym / workout influencer hold',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      'UGC aesthetic, fitness influencer holding the product in hand in a gym or home workout space, slightly messy authentic background, natural phone selfie energy, sweat-adjacent realism, strong conversion headline and clear CTA, conversion-optimized for sales, Meta feed/Stories performance creative',
  },
  {
    id: 'ugc-selfie',
    label: 'Selfie UGC',
    description: 'First-person iPhone selfie',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      'Authentic UGC iPhone selfie, first-person POV, creator holding the product close to camera, soft window light, slightly messy real room background, native Meta ad look, punchy conversion headline and Shop now CTA, product packaging clear and readable',
  },
  {
    id: 'unboxing',
    label: 'Unboxing',
    description: 'First-impression package reveal',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'Unboxing reveal moment, hands opening the package on a real desk or bed, genuine first-impression energy, product clearly visible as it emerges, natural indoor light, authentic UGC Meta ad, conversion headline plus Learn more or Shop now CTA',
  },
  {
    id: 'demo-use',
    label: 'Demo in use',
    description: 'Hands using / pouring / applying',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'Product demo in action — hands using, pouring, applying, or interacting with the product in a believable real setting, freeze the most satisfying mid-action moment, product packaging readable, tight social crop, conversion headline and clear CTA, Meta feed performance creative',
  },
  {
    id: 'flat-lay',
    label: 'Flat lay',
    description: 'Styled top-down kit shot',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Clean flat lay of the product with a few niche-true props on a tactile surface, top-down view, soft diffused light, product as hero, tight feed crop, elegant or bold conversion headline matching the niche, optional CTA, Meta feed creative — not empty catalog spread',
  },
  {
    id: 'lifestyle-ritual',
    label: 'Lifestyle ritual',
    description: 'Product in a daily routine',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Lifestyle ritual moment with the product in a real daily routine scene, natural light, lived-in but desirable, product clearly readable, intimate social crop, desire-driven conversion headline, clear CTA, Meta feed performance creative',
  },
  {
    id: 'product-hero',
    label: 'Product hero',
    description: 'Bold pack-forward studio sell',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Bold product-hero Meta ad, exact product packing the frame with one strong set piece and Strong integration, high mobile contrast, conversion headline and Shop now CTA, lean UI — no badge clutter unless on-pack facts help, not gradient pedestal billboard',
  },
  {
    id: 'reaction-hook',
    label: 'Reaction hook',
    description: 'Scroll-stopping surprise face',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      'Scroll-stopping reaction hook, creator mid-reaction pointing at or holding the product, high contrast vertical Stories energy, authentic UGC phone look, oversized conversion headline and clear CTA, product visible and readable, Meta performance creative',
  },
  {
    id: 'direct-response',
    label: 'Direct response',
    description: 'Big headline + product + CTA',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Direct-response Meta feed ad, product large and clear, SCREAM or niche-correct bold headline that sells in under 6 words, optional short subline only if it clarifies value, strong Shop now CTA, high contrast thumbnail silhouette, conversion-first — lean, no decorative badge spam',
  },
  {
    id: 'testimonial-ugc',
    label: 'Talking head',
    description: 'Trust-building creator frame',
    trending: false,
    aspectRatio: '9:16' as const,
    prompt:
      'Talking-head UGC style, confident creator facing camera with the product in frame, bright real environment, authentic phone video still energy, conversion headline that builds desire without inventing claims, clear CTA, Meta Stories/feed performance creative',
  },
  {
    id: 'before-after-safe',
    label: 'Problem → solution',
    description: 'Visual tension then product',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Problem-to-solution Meta ad: left or background suggests the everyday frustration visually without fake medical before/after claims, product is the clear solution hero, tight social crop, conversion headline plus CTA, high contrast, claim-safe',
  },
] as const satisfies readonly StaticAdFormatPreset[]

export type StaticAdFormatPresetId = (typeof STATIC_AD_FORMAT_PRESETS)[number]['id']
