import {
  BRAND_COLORS_MAX,
  BRAND_DESCRIPTION_MAX,
  BRAND_INDUSTRY_MAX,
  BRAND_NAME_MAX,
  type ExtractBrandResponse,
  type SiteBrandContextInput,
} from '@socialista/types'
import { generateObject } from 'ai'

import { buildBrandContextUserPrompt } from '../builders/brand-context.js'
import { BRAND_CONTEXT_SYSTEM } from '../prompts/brand-context.js'
import { brandContextSchema } from '../schemas/brand-context.js'

const BRAND_CONTEXT_MODEL = 'openai/gpt-4o-mini'
const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

function clamp(value: string, max: number): string {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return trimmed.slice(0, max).trim()
}

function normalizeHexColor(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase()
  if (!HEX_COLOR_RE.test(trimmed)) return undefined
  if (trimmed.length === 4) {
    const r = trimmed[1]
    const g = trimmed[2]
    const b = trimmed[3]
    if (!r || !g || !b) return undefined
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return trimmed
}

function uniqueColors(...groups: Array<string[] | undefined>): string[] {
  const seen = new Set<string>()
  const colors: string[] = []

  for (const group of groups) {
    if (!group) continue
    for (const item of group) {
      const hex = normalizeHexColor(item)
      if (!hex || seen.has(hex)) continue
      seen.add(hex)
      colors.push(hex)
      if (colors.length >= BRAND_COLORS_MAX) return colors
    }
  }

  return colors
}

function composeDescription(input: {
  description: string
  targetAudience: string
  tone: string
  keyProducts: string[]
}): string {
  const description = clamp(input.description, BRAND_DESCRIPTION_MAX)
  const extras: string[] = []

  const audience = input.targetAudience.trim()
  if (audience && !description.toLowerCase().includes(audience.toLowerCase().slice(0, 24))) {
    extras.push(`Audience: ${audience}`)
  }

  const tone = input.tone.trim()
  if (tone && !description.toLowerCase().includes(tone.toLowerCase())) {
    extras.push(`Voice: ${tone}`)
  }

  const products = input.keyProducts.map(item => item.trim()).filter(Boolean).slice(0, 5)
  if (products.length > 0) {
    extras.push(`Offers: ${products.join(', ')}`)
  }

  if (extras.length === 0) return description

  const suffix = extras.join(' ')
  if (!description) return clamp(suffix, BRAND_DESCRIPTION_MAX)
  return clamp(`${description} ${suffix}`, BRAND_DESCRIPTION_MAX)
}

function fallbackName(site: SiteBrandContextInput): string {
  const siteName = site.siteName?.trim()
  if (siteName) return clamp(siteName, BRAND_NAME_MAX)

  const title = site.title?.trim()
  if (!title) return ''

  const withoutSiteTail = title.split(/\s+[|\-–—•·]\s+/)[0]?.trim() ?? title
  return clamp(withoutSiteTail || title, BRAND_NAME_MAX)
}

function originFromUrl(value: string): string | undefined {
  try {
    return new URL(value).origin
  } catch {
    return undefined
  }
}

export async function extractBrandContext(
  site: SiteBrandContextInput,
  options?: { model?: string },
): Promise<ExtractBrandResponse> {
  if (!site.url.trim()) {
    throw new Error('Website URL is required')
  }

  const hasContent = Boolean(
    site.text.trim() || site.title?.trim() || site.metaDescription?.trim() || site.jsonLd?.trim(),
  )
  if (!hasContent) {
    throw new Error('That page did not contain enough content to build a brand')
  }

  const result = await generateObject({
    model: options?.model?.trim() || BRAND_CONTEXT_MODEL,
    schema: brandContextSchema,
    system: BRAND_CONTEXT_SYSTEM,
    temperature: 0.2,
    prompt: buildBrandContextUserPrompt(site),
  })

  const generated = result.object
  const name = clamp(generated.name, BRAND_NAME_MAX) || fallbackName(site)
  const website = originFromUrl(site.url.trim()) || site.url.trim()
  const logo = site.logoUrl?.trim() || undefined

  return {
    name,
    description: composeDescription({
      description: generated.description,
      targetAudience: generated.targetAudience,
      tone: generated.tone,
      keyProducts: generated.keyProducts ?? [],
    }),
    industry: clamp(generated.industry, BRAND_INDUSTRY_MAX),
    website,
    ...(logo ? { logo } : {}),
    colors: uniqueColors(site.colors?.length ? site.colors : generated.colors ?? []),
  }
}
