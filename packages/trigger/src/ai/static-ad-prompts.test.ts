import { describe, expect, it } from 'vitest'
import {
  assembleStaticAdImagePrompt,
  buildStaticAdCreativeBrief,
  buildStaticAdRecreateCritiqueTurn,
  buildStaticAdTemplateEditRequest,
  sanitizeStaticAdModelPrompts,
  STATIC_AD_CREATIVE_DELIMITER,
} from './static-ad-prompts.js'

const BLUEPRINT = {
  format: 'graphic' as const,
  layout: 'Left third oversized number, product on the right.',
  typeHierarchy: 'Heavy headline top band, small CTA pill bottom right.',
  palette: [
    { hex: '#111111', role: 'type' },
    { hex: '#F4F1EA', role: 'background' },
  ],
  hookStyle: 'curiosity gap',
  sceneJob: 'Product sits beside a stat.',
  aspectRatioHint: '1:1' as const,
  analyzedAt: new Date('2026-01-01T00:00:00.000Z'),
  version: 1,
}

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
    expect(withRef).toContain('Edit Image 2 in place')
    expect(withRef).toContain('Do not recolor the layout')
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
    expect(prompt).toContain('Edit Image 3 in place')
  })
})

describe('buildStaticAdCreativeBrief', () => {
  it('asks template edits to keep the original ad and skip claim-safety', () => {
    const brief = buildStaticAdCreativeBrief({
      images: [
        { url: 'https://cdn.example.com/product.webp', role: 'product' },
        { url: 'https://cdn.example.com/template.webp', role: 'template' },
      ],
      language: 'en',
      aspectRatio: '1:1',
    })
    expect(brief).toMatch(/do not recolor/i)
    expect(brief).toMatch(/replace lines that name the template product/i)
    expect(brief).toMatch(/@image1/)
    expect(brief).toMatch(/ad template to edit in place/i)
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
    expect(brief).toMatch(/Swap the person only when a person reference is attached/)
    expect(brief).toMatch(/not limited to one product/)
  })

  it('asks for N copies of the same template edit', () => {
    const brief = buildStaticAdCreativeBrief({
      images: [
        { url: 'https://cdn.example.com/product.webp', role: 'product' },
        { url: 'https://cdn.example.com/template.webp', role: 'template' },
      ],
      language: 'en',
      aspectRatio: '1:1',
      count: 3,
    })
    expect(brief).toMatch(/Creative count: 3 attempts of the SAME template edit/)
    expect(brief).toMatch(/same concept, person, colors, layout/)
    expect(brief).toMatch(/Do not invent a new scene/)
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

  it('injects the template blueprint as layout ground truth', () => {
    const brief = buildStaticAdCreativeBrief({
      images: [
        { url: 'https://cdn.example.com/product.webp', role: 'product' },
        { url: 'https://cdn.example.com/template.webp', role: 'template' },
      ],
      language: 'en',
      aspectRatio: '1:1',
      templateBlueprint: BLUEPRINT,
    })
    expect(brief).toMatch(/Template blueprint/)
    expect(brief).toMatch(/Left third oversized number/)
    expect(brief).toMatch(/curiosity gap/)
    expect(brief).toContain('#111111')
    expect(brief).toMatch(/translate the existing headline/i)
    expect(brief).toMatch(/colors to keep/i)
  })

  it('quotes structured ad copy as verbatim', () => {
    const brief = buildStaticAdCreativeBrief({
      images: [{ url: 'https://cdn.example.com/product.webp', role: 'product' }],
      adCopy: { headline: 'Stop the scroll', cta: 'Shop' },
    })
    expect(brief).toMatch(/Required on-image copy/)
    expect(brief).toContain('"Stop the scroll"')
    expect(brief).toContain('"Shop"')
  })

  it('ignores a blueprint when no template image is attached', () => {
    const brief = buildStaticAdCreativeBrief({
      images: [{ url: 'https://cdn.example.com/product.webp', role: 'product' }],
      templateBlueprint: BLUEPRINT,
    })
    expect(brief).not.toMatch(/Template blueprint/)
  })
})

describe('buildStaticAdRecreateCritiqueTurn', () => {
  it('asks for the same number of blocks and includes the blueprint', () => {
    const turn = buildStaticAdRecreateCritiqueTurn({
      drafts: [COMPACT, COMPACT_TWO],
      blueprint: BLUEPRINT,
      count: 2,
      notes: 'keep the stat layout',
      adCopy: { headline: 'Exact line' },
    })
    expect(turn).toContain(STATIC_AD_CREATIVE_DELIMITER)
    expect(turn).toMatch(/Return 2 Mode\/Scene\/Copy\/Lock blocks/)
    expect(turn).toMatch(/curiosity gap/)
    expect(turn).toContain('keep the stat layout')
    expect(turn).toContain('"Exact line"')
    expect(turn).toContain('Screenshot/UI')
    expect(turn).toContain('UGC')
  })
})

describe('buildStaticAdTemplateEditRequest', () => {
  it('keeps the template and only swaps the product and language', () => {
    const request = buildStaticAdTemplateEditRequest({
      images: [
        { url: 'https://cdn.example.com/paste.webp', role: 'product' },
        { url: 'https://cdn.example.com/meme.webp', role: 'template' },
      ],
      language: 'bg',
      prompt: 'change the product only, use @image1, and the language to Bulgarian',
    })
    expect(request).toContain('@image2')
    expect(request).not.toContain('@image1')
    expect(request).toContain('Edit Image 1 in place')
    expect(request).toContain('exact product from Image 2')
    expect(request).toMatch(/Keep the person already in the template/)
    expect(request).toMatch(/Do not recolor the layout/)
    expect(request).toMatch(/in Bulgarian/)
    expect(request).toMatch(/Replace lines that name the template product/)
    expect(request).toMatch(/Keep and translate lines that are the concept/)
    expect(request).toContain('change the product only')
  })

  it('uses supplied copy instead of a translation', () => {
    const request = buildStaticAdTemplateEditRequest({
      images: [{ url: 'https://cdn.example.com/meme.webp', role: 'template' }],
      language: 'bg',
      adCopy: { headline: 'Точно този ред' },
    })
    expect(request).toContain('"Точно този ред"')
    expect(request).not.toMatch(/Replace lines that name the template product/)
  })

  it('rewrites template features from the new product info', () => {
    const request = buildStaticAdTemplateEditRequest({
      images: [
        { url: 'https://cdn.example.com/serum.webp', role: 'product' },
        { url: 'https://cdn.example.com/coffee-ad.webp', role: 'template' },
      ],
      language: 'en',
      products: [
        {
          image: 'Image 2',
          name: 'Glow Serum',
          description: 'Vitamin C serum for dull skin. Morning use.',
        },
      ],
    })
    expect(request).toContain('Glow Serum')
    expect(request).toContain('Vitamin C serum for dull skin')
    expect(request).toMatch(/Do not use the template product's claims/)
    expect(request).toMatch(/same slots/)
  })
})
