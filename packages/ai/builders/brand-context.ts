import type { SiteBrandContextInput } from '@socialista/types'

const MAX_TEXT = 12_000
const MAX_JSON_LD = 4_000
const MAX_HEADINGS = 20

function clip(value: string | undefined, max: number): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed
}

export function buildBrandContextUserPrompt(site: SiteBrandContextInput): string {
  const lines: string[] = [`Source URL: ${site.url}`]

  const title = clip(site.title, 200)
  if (title) lines.push(`Title: ${title}`)

  const siteName = clip(site.siteName, 120)
  if (siteName) lines.push(`Site name: ${siteName}`)

  const meta = clip(site.metaDescription, 400)
  if (meta) lines.push(`Meta description: ${meta}`)

  const headings = (site.headings ?? [])
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, MAX_HEADINGS)
  if (headings.length > 0) {
    lines.push(`Headings:\n${headings.map(item => `- ${item}`).join('\n')}`)
  }

  if (site.logoUrl?.trim()) lines.push(`Detected logo URL: ${site.logoUrl.trim()}`)

  const colors = (site.colors ?? []).filter(Boolean)
  if (colors.length > 0) lines.push(`Detected colors: ${colors.join(', ')}`)

  const jsonLd = clip(site.jsonLd, MAX_JSON_LD)
  if (jsonLd) lines.push(`JSON-LD (truncated):\n${jsonLd}`)

  const text = clip(site.text, MAX_TEXT) ?? ''
  lines.push(`Page text (truncated):\n${text || '(no body text extracted)'}`)

  return `Extract structured brand context from this website scrape. Prefer JSON-LD and meta over marketing copy in the body.

${lines.join('\n\n')}`
}
