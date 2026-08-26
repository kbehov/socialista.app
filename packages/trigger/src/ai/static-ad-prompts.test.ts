import { describe, expect, it } from 'vitest'
import {
  assembleStaticAdImagePrompt,
  buildStaticAdCreativeBrief,
  sanitizeStaticAdModelPrompts,
  STATIC_AD_CREATIVE_DELIMITER,
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

const COMPACT_TWO = `Mode: UGC — 9:16 iPhone hold, real bathroom.
Scene: Arm's-length phone still, slightly messy vanity. Person from Image 2 holds Image 1 product shoved toward lens, label readable. Available overhead light, mild grain, real skin.
Copy: English. headline "I stopped buying the expensive one" bold white sans, upper third. CTA "Shop now" small lower third. No other added text.
Lock: Exact product from Image 1. Exact person from Image 2. Phone-photo authentic, not a campaign studio shot.`

const COMPACT_THREE = `Mode: Demo/Unboxing — 1:1 cut-seal close-up.
Scene: Overhead phone still of Image 1 box on a kitchen table. Hands from Image 2 slice the seal. Overhead kitchen light, cardboard dust.
Copy: English. headline "Don't skip this part" bold white sans, upper third. No other added text.
Lock: Exact product from Image 1. Exact person from Image 2.`

describe('sanitizeStaticAdModelPrompts', () => {
  it('accepts compact Mode/Scene/Copy/Lock output as a single block', () => {
    const result = sanitizeStaticAdModelPrompts(COMPACT)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('Mode:')
  })

  it('still accepts legacy seven-section skills as a single block', () => {
    const result = sanitizeStaticAdModelPrompts(LEGACY)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('Concept:')
  })

  it('splits delimited creatives and keeps valid blocks up to expectedCount', () => {
    const raw = [COMPACT, COMPACT_TWO, COMPACT_THREE].join(
      `\n${STATIC_AD_CREATIVE_DELIMITER}\n`,
    )
    const result = sanitizeStaticAdModelPrompts(raw, 3)
    expect(result).toHaveLength(3)
    expect(result[0]).toContain('Screenshot/UI')
    expect(result[1]).toContain('UGC')
    expect(result[2]).toContain('Demo/Unboxing')
  })

  it('drops invalid blocks and returns remaining valid ones', () => {
    const raw = [COMPACT, 'just a paragraph', COMPACT_TWO].join(
      `\n${STATIC_AD_CREATIVE_DELIMITER}\n`,
    )
    const result = sanitizeStaticAdModelPrompts(raw, 3)
    expect(result).toHaveLength(2)
    expect(result[0]).toContain('Screenshot/UI')
    expect(result[1]).toContain('UGC')
  })

  it('caps at expectedCount when the planner returns extra blocks', () => {
    const raw = [COMPACT, COMPACT_TWO, COMPACT_THREE].join(
      `\n${STATIC_AD_CREATIVE_DELIMITER}\n`,
    )
    const result = sanitizeStaticAdModelPrompts(raw, 2)
    expect(result).toHaveLength(2)
  })

  it('rejects empty and unstructured output', () => {
    expect(() => sanitizeStaticAdModelPrompts('')).toThrow(/empty/)
    expect(() => sanitizeStaticAdModelPrompts('just a paragraph')).toThrow(
      /invalid format/,
    )
  })
})

describe('assembleStaticAdImagePrompt', () => {
  const product = {
    url: 'https://cdn.example.com/product.webp',
    role: 'product' as const,
  }
  const template = {
    url: 'https://cdn.example.com/template.webp',
    role: 'template' as const,
  }
  const person = {
    url: 'https://cdn.example.com/creator.webp',
    role: 'influencer' as const,
  }

  it('prefixes a short lock instead of a second essay', () => {
    const withRef = assembleStaticAdImagePrompt(COMPACT, [product, template])
    const withoutRef = assembleStaticAdImagePrompt(COMPACT, [product])
    expect(withRef.startsWith('Exact product identity from Image 1.')).toBe(
      true,
    )
    expect(withRef).toContain(COMPACT)
    expect(withRef).toContain("Recolor to the user's pack palette")
    expect(withoutRef).toContain('Exact product identity from Image 1.')
    expect(withRef).not.toMatch(/claim-safe/i)
    expect(withRef.split(/\s+/).length).toBeLessThan(280)
  })

  it('locks people and products onto a template', () => {
    const prompt = assembleStaticAdImagePrompt(COMPACT, [
      person,
      product,
      template,
    ])
    expect(prompt).toContain('Exact person identity from Image 1.')
    expect(prompt).toContain('Exact product identity from Image 2.')
    expect(prompt).toContain('Recreate Image 3 layout')
  })
})

describe('buildStaticAdCreativeBrief', () => {
  it('asks template recreations to follow the product palette and skip claim-safety', () => {
    const brief = buildStaticAdCreativeBrief({
      images: [
        { url: 'https://cdn.example.com/product.webp', role: 'product' },
        { url: 'https://cdn.example.com/template.webp', role: 'template' },
      ],
      language: 'en',
      aspectRatio: '1:1',
    })
    expect(brief).toMatch(/product palette/i)
    expect(brief).toMatch(/scroll-stopping hook/i)
    expect(brief).toMatch(/@image1/)
    expect(brief).toMatch(/ad template to recreate/i)
    expect(brief).not.toMatch(/claim-safe/i)
    expect(brief).not.toContain(STATIC_AD_CREATIVE_DELIMITER)
    expect(brief).not.toMatch(/Creative count/)
  })

  it('lists mixed influencer, product, and template refs for role matching', () => {
    const brief = buildStaticAdCreativeBrief({
      images: [
        {
          url: 'https://cdn.example.com/maya.webp',
          role: 'influencer',
          label: 'Maya',
        },
        {
          url: 'https://cdn.example.com/serum.webp',
          role: 'product',
          label: 'Serum',
        },
        {
          url: 'https://cdn.example.com/ad.webp',
          role: 'template',
          label: 'Skincare hold',
        },
      ],
      prompt: 'the creator from @image1 holding the product from @image2',
      language: 'en',
      aspectRatio: '9:16',
    })
    expect(brief).toMatch(/person \/ influencer/)
    expect(brief).toMatch(/Maya/)
    expect(brief).toMatch(/Serum/)
    expect(brief).toMatch(/Substitute the user's influencer/)
    expect(brief).toMatch(/not limited to one product/)
  })

  it('asks for N template recreations with the same layout and different hooks', () => {
    const brief = buildStaticAdCreativeBrief({
      images: [
        { url: 'https://cdn.example.com/product.webp', role: 'product' },
        { url: 'https://cdn.example.com/template.webp', role: 'template' },
      ],
      language: 'en',
      aspectRatio: '1:1',
      count: 3,
    })
    expect(brief).toMatch(
      /Creative count: 3 DISTINCT recreations of the template/,
    )
    expect(brief).toMatch(/same layout, type hierarchy, and lighting mood/)
    expect(brief).toMatch(/Never the same headline twice/)
    expect(brief).toContain(STATIC_AD_CREATIVE_DELIMITER)
    expect(brief).toMatch(/write 3 SHORT image-edit prompts/)
  })

  it('varies within one requested format and only spreads modes when notes have no signal', () => {
    const brief = buildStaticAdCreativeBrief({
      images: [
        { url: 'https://cdn.example.com/product.webp', role: 'product' },
      ],
      prompt: 'unboxing on a kitchen table',
      language: 'en',
      aspectRatio: '1:1',
      count: 3,
    })
    expect(brief).toMatch(/Creative count: 3 DISTINCT ad creatives/)
    expect(brief).toMatch(/keep every creative in that mode and vary within it/)
    expect(brief).toMatch(/Only when the notes give no format signal/)
    expect(brief).toContain(STATIC_AD_CREATIVE_DELIMITER)
    expect(brief).not.toMatch(/recreations of the template/)
  })
})
