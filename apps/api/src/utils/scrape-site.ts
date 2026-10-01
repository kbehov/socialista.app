import { fetchPublicHtml, normalizeHttpUrl, SiteScrapeError } from '@/utils/safe-fetch.js'
import { BRAND_COLORS_MAX, type SiteBrandContextInput } from '@socialista/types'
import { load, type CheerioAPI } from 'cheerio'

const MAX_TEXT = 12_000
const MAX_JSON_LD = 4_000
const MAX_HEADINGS = 20
const CSS_BRAND_COLOR_RE =
  /--(?:[a-z0-9-]*(?:brand|primary|accent|theme|color-primary)[a-z0-9-]*)\s*:\s*(#[0-9a-f]{3,8})/gi
const ABOUT_PATH_RE = /(^|\/)(about|about-us|our-story|our-company|who-we-are|company)(\/|$)/i
const ABOUT_LABEL_RE = /\b(about us|our story|who we are|our company)\b/i
const JSON_LD_TYPES = new Set(['organization', 'localbusiness', 'website', 'brand', 'corporation', 'store'])

const HEX_NORMALIZE_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export { SiteScrapeError, normalizeHttpUrl }

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeHexColor(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase()
  if (!HEX_NORMALIZE_RE.test(trimmed)) return undefined
  if (trimmed.length === 4) {
    const r = trimmed[1]
    const g = trimmed[2]
    const b = trimmed[3]
    if (!r || !g || !b) return undefined
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return trimmed
}

function uniqueColors(values: string[]): string[] {
  const seen = new Set<string>()
  const colors: string[] = []
  for (const value of values) {
    const hex = normalizeHexColor(value)
    if (!hex || seen.has(hex)) continue
    seen.add(hex)
    colors.push(hex)
    if (colors.length >= BRAND_COLORS_MAX) break
  }
  return colors
}

function absoluteUrl(value: string | undefined, base: string): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed || trimmed.startsWith('data:')) return undefined
  try {
    const url = new URL(trimmed, base)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

function meta($: CheerioAPI, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const content =
      $(`meta[property="${key}"]`).attr('content') ??
      $(`meta[name="${key}"]`).attr('content') ??
      $(`meta[itemprop="${key}"]`).attr('content')
    const trimmed = content?.trim()
    if (trimmed) return trimmed
  }
  return undefined
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return value as Record<string, unknown>
}

function asTypeList(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  return []
}

function walkJsonLd(node: unknown, acc: Record<string, unknown>[]): void {
  if (Array.isArray(node)) {
    for (const item of node) walkJsonLd(item, acc)
    return
  }

  const record = asRecord(node)
  if (!record) return

  const graph = record['@graph']
  if (Array.isArray(graph)) {
    for (const item of graph) walkJsonLd(item, acc)
  }

  const types = asTypeList(record['@type']).map(type => type.toLowerCase())
  if (types.some(type => JSON_LD_TYPES.has(type))) {
    acc.push(record)
  }
}

function jsonLdString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  const record = asRecord(value)
  if (!record) return undefined
  if (typeof record.url === 'string') return record.url.trim()
  if (typeof record.contentUrl === 'string') return record.contentUrl.trim()
  if (typeof record.name === 'string') return record.name.trim()
  return undefined
}

function collectJsonLd($: CheerioAPI): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text().trim()
    if (!raw) return
    try {
      walkJsonLd(JSON.parse(raw), nodes)
    } catch {
      // Malformed JSON-LD is common; skip the block.
    }
  })
  return nodes
}

function extractLogo($: CheerioAPI, pageUrl: string, jsonLd: Record<string, unknown>[]): string | undefined {
  for (const node of jsonLd) {
    const logo = absoluteUrl(jsonLdString(node.logo), pageUrl)
    if (logo) return logo
    const image = absoluteUrl(jsonLdString(node.image), pageUrl)
    if (image) return image
  }

  const appleIcon = $('link[rel="apple-touch-icon"]').attr('href')
  const apple = absoluteUrl(appleIcon, pageUrl)
  if (apple) return apple

  const ogImage = absoluteUrl(meta($, 'og:image', 'og:image:url', 'twitter:image'), pageUrl)
  if (ogImage) return ogImage

  const icon = $('link[rel="icon"][type="image/png"], link[rel="icon"][type="image/svg+xml"], link[rel="shortcut icon"]')
    .filter((_, el) => {
      const sizes = $(el).attr('sizes')?.trim()
      if (!sizes || sizes === 'any') return true
      const width = Number.parseInt(sizes.split('x')[0] ?? '', 10)
      return !Number.isFinite(width) || width >= 32
    })
    .first()
    .attr('href')

  return absoluteUrl(icon, pageUrl)
}

function extractColors($: CheerioAPI): string[] {
  const found: string[] = []
  const theme = meta($, 'theme-color', 'msapplication-TileColor')
  if (theme) found.push(theme)

  $('style').each((_, el) => {
    const css = $(el).text()
    CSS_BRAND_COLOR_RE.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = CSS_BRAND_COLOR_RE.exec(css))) {
      const color = match[1]
      if (color) found.push(color)
    }
  })

  return uniqueColors(found)
}

function extractHeadings($: CheerioAPI): string[] {
  const headings: string[] = []
  const seen = new Set<string>()
  $('h1, h2').each((_, el) => {
    const text = collapseWhitespace($(el).text())
    if (!text || seen.has(text)) return
    seen.add(text)
    headings.push(text)
    if (headings.length >= MAX_HEADINGS) return false
  })
  return headings
}

function extractText($: CheerioAPI): string {
  const clone = load($.html())
  clone('script, style, noscript, iframe, svg, canvas, template, [hidden], [aria-hidden="true"]').remove()
  clone('nav, footer, aside, form').remove()

  const main = clone('main, [role="main"], article').first()
  const root = main.length > 0 ? main : clone('body')
  return collapseWhitespace(root.text()).slice(0, MAX_TEXT)
}

function findAboutUrl($: CheerioAPI, pageUrl: string): string | undefined {
  const origin = new URL(pageUrl).origin
  let found: string | undefined

  $('a[href]').each((_, el) => {
    if (found) return false
    const href = $(el).attr('href')
    if (!href) return
    const absolute = absoluteUrl(href, pageUrl)
    if (!absolute) return
    try {
      const url = new URL(absolute)
      if (url.origin !== origin) return
      if (url.pathname === new URL(pageUrl).pathname) return
      const label = collapseWhitespace($(el).text())
      if (ABOUT_PATH_RE.test(url.pathname) || ABOUT_LABEL_RE.test(label)) {
        found = url.toString()
      }
    } catch {
      // skip invalid hrefs
    }
  })

  return found
}

function parsePage(html: string, pageUrl: string): SiteBrandContextInput {
  const $ = load(html)
  const jsonLd = collectJsonLd($)
  const jsonLdName = jsonLd.map(node => jsonLdString(node.name)).find(Boolean)
  const jsonLdDescription = jsonLd.map(node => jsonLdString(node.description)).find(Boolean)

  const title = collapseWhitespace($('title').first().text())
  const siteName = meta($, 'og:site_name', 'application-name') ?? jsonLdName
  const metaDescription = meta($, 'og:description', 'description', 'twitter:description') ?? jsonLdDescription

  const jsonLdPayload = jsonLd.length > 0 ? JSON.stringify(jsonLd).slice(0, MAX_JSON_LD) : undefined
  const logoUrl = extractLogo($, pageUrl, jsonLd)
  const colors = extractColors($)

  return {
    url: pageUrl,
    ...(title ? { title } : {}),
    ...(metaDescription ? { metaDescription } : {}),
    ...(siteName ? { siteName } : {}),
    headings: extractHeadings($),
    text: extractText($),
    ...(jsonLdPayload ? { jsonLd: jsonLdPayload } : {}),
    ...(logoUrl ? { logoUrl } : {}),
    ...(colors.length > 0 ? { colors } : {}),
  }
}

function mergeSiteContext(home: SiteBrandContextInput, about: SiteBrandContextInput): SiteBrandContextInput {
  const headings = [...home.headings ?? [], ...about.headings ?? []]
  const seen = new Set<string>()
  const mergedHeadings: string[] = []
  for (const heading of headings) {
    if (seen.has(heading)) continue
    seen.add(heading)
    mergedHeadings.push(heading)
    if (mergedHeadings.length >= MAX_HEADINGS) break
  }

  const text = [home.text, about.text].filter(Boolean).join(' ').slice(0, MAX_TEXT)
  const jsonLd = [home.jsonLd, about.jsonLd].filter(Boolean).join('\n').slice(0, MAX_JSON_LD) || undefined
  const colors = uniqueColors([...(home.colors ?? []), ...(about.colors ?? [])])

  return {
    url: home.url,
    title: home.title ?? about.title,
    metaDescription: home.metaDescription ?? about.metaDescription,
    siteName: home.siteName ?? about.siteName,
    headings: mergedHeadings,
    text,
    ...(jsonLd ? { jsonLd } : {}),
    logoUrl: home.logoUrl ?? about.logoUrl,
    ...(colors.length > 0 ? { colors } : {}),
  }
}

export async function scrapeSiteContext(url: string): Promise<SiteBrandContextInput> {
  const home = await fetchPublicHtml(url)
  const $ = load(home.html)
  const parsedHome = parsePage(home.html, home.url)

  const aboutUrl = parsedHome.text.length < 4_000 ? findAboutUrl($, home.url) : undefined
  if (!aboutUrl) return parsedHome

  try {
    const about = await fetchPublicHtml(aboutUrl)
    return mergeSiteContext(parsedHome, parsePage(about.html, about.url))
  } catch {
    return parsedHome
  }
}
