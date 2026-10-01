import { BRAND_COLORS_MAX } from '@socialista/types'
import { z } from 'zod'

export const brandContextSchema = z.object({
  name: z
    .string()
    .describe(
      'Official brand or trading name as it appears on the site. No tagline, slogan, or legal suffix unless that is the public name.',
    ),
  description: z
    .string()
    .describe(
      '2–4 factual sentences of positioning: what they offer, who it is for, and how they sound. No hype, no invented claims, no statistics that are not in the source. Max 480 characters.',
    ),
  industry: z
    .string()
    .describe('Short industry or category, e.g. "DTC skincare" or "B2B payroll software". Empty string if unknown.'),
  targetAudience: z
    .string()
    .describe('Who they sell to, in one short phrase. Empty string if unknown.'),
  tone: z
    .string()
    .describe('Voice in a few words, e.g. "warm, expert, unhurried". Empty string if unknown.'),
  keyProducts: z
    .array(z.string())
    .max(8)
    .describe('Hero products or services named on the site. Empty array if unknown.'),
  colors: z
    .array(z.string())
    .max(BRAND_COLORS_MAX)
    .describe(
      'Brand hex colors like #0A84FF only when they appear in the provided palette or are clearly stated. Never invent a palette.',
    ),
})

export type BrandContextGenerated = z.infer<typeof brandContextSchema>
