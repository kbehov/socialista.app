import { describe, expect, it } from 'vitest'
import {
  assembleStaticAdImagePrompt,
  buildStaticAdCreativeBrief,
  sanitizeStaticAdModelPrompt,
} from './static-ad-prompts.js'

const COMPACT = `Mode: Screenshot/UI — 1:1 editorial webpage, no browser chrome.
Scene: Generic Bulgarian fashion-wellness magazine page, full-bleed square. Top band: oversized generic masthead on white, thin black nav, large centered two-line headline. Lower half: vertical split — left Image 1 bottle large among houseplant leaves, label unobstructed; right one generic adult woman in a real bedroom taking a casual phone-mirror photo, fully clothed, matching same-instant reflection. Bright editorial white/black/greens, soft daylight. Bottle is the hero silhouette.
Copy: Bulgarian editorial only; keep Image 1 pack English unchanged.
masthead "РЕДАКЦИЯ" huge black Didone capitals, centered
nav "МОДА  КРАСОТА  ЗДРАВЕ  КУЛТУРА  ЛАЙФСТАЙЛ" small white geometric sans on black bar
headline "Гарциния и мангостин: какво пише на етикета" large black editorial serif, two centered lines
No other added text.
Lock: Exact Image 1 product (one bottle, primary mark visible). Recreate Image 2 grid and type hierarchy, recolor to Image 1 pack palette — not its name, product, logo, or brand colors.`

const LEGACY = `Concept: Screenshot/UI editorial page.
Scene: A magazine webpage with the product.
Composition: Square crop, product large.
Light & grade: Bright editorial daylight.
Typography: headline "Test"
Preserve: Exact Image 1 product.
Constraints: No competitor branding.`

describe('sanitizeStaticAdModelPrompt', () => {
  it('accepts compact Mode/Scene/Copy/Lock output', () => {
    expect(sanitizeStaticAdModelPrompt(COMPACT)).toContain('Mode:')
  })

  it('still accepts legacy seven-section skills', () => {
    expect(sanitizeStaticAdModelPrompt(LEGACY)).toContain('Concept:')
  })

  it('rejects empty and unstructured output', () => {
    expect(() => sanitizeStaticAdModelPrompt('')).toThrow(/empty/)
    expect(() => sanitizeStaticAdModelPrompt('just a paragraph')).toThrow(/invalid format/)
  })
})

describe('assembleStaticAdImagePrompt', () => {
  it('prefixes a short lock instead of a second essay', () => {
    const withRef = assembleStaticAdImagePrompt(COMPACT, true)
    const withoutRef = assembleStaticAdImagePrompt(COMPACT, false)
    expect(withRef.startsWith('Exact product from Image 1.')).toBe(true)
    expect(withRef).toContain(COMPACT)
    expect(withRef).toContain("Recolor to Image 1's pack palette")
    expect(withoutRef).toContain('not a generic AI product shot')
    expect(withRef).not.toMatch(/claim-safe/i)
    expect(withRef.split(/\s+/).length).toBeLessThan(280)
  })
})

describe('buildStaticAdCreativeBrief', () => {
  it('asks template recreations to follow the product palette and skip claim-safety', () => {
    const brief = buildStaticAdCreativeBrief({
      hasReferenceImage: true,
      language: 'en',
      aspectRatio: '1:1',
    })
    expect(brief).toMatch(/product palette/i)
    expect(brief).toMatch(/scroll-stopping hook/i)
    expect(brief).not.toMatch(/claim-safe/i)
  })
})
