import { load } from 'cheerio'
import { fetch } from 'undici'
import { BROWSER_USER_AGENT } from '@/utils/http-client.js'

interface ProductData {
  name?: string
  description?: string
  image?: string[]
  price?: string | number
  currency?: string
  availability?: string
  sku?: string
  brand?: string
  url: string
}

export async function extractProductFromUrl(url: string): Promise<ProductData | null> {
  const res = await fetch(url, {
    headers: {
      // many stores block requests without a browser-like UA
      'User-Agent': BROWSER_USER_AGENT,
    },
    redirect: 'follow',
  })

  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

  const html = await res.text()
  const $ = load(html)

  const ldJsonBlocks: Record<string, unknown>[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).text()) as unknown
      if (parsed && typeof parsed === 'object') {
        ldJsonBlocks.push(parsed as Record<string, unknown>)
      }
    } catch {
      // some sites have malformed/multiple JSON objects concatenated - skip silently
    }
  })

  // flatten @graph arrays (common in Yoast/WooCommerce SEO output)
  const flatBlocks = ldJsonBlocks.flatMap(block => {
    const graph = block['@graph']
    return Array.isArray(graph) ? (graph as Record<string, unknown>[]) : [block]
  })

  const productNode = flatBlocks.find(node => {
    const type = node['@type']
    return type === 'Product' || (Array.isArray(type) && type.includes('Product'))
  })

  if (!productNode) return fallbackToMetaTags($, url)

  const offerValue = productNode.offers
  const offer = (
    Array.isArray(offerValue) ? offerValue[0] : offerValue
  ) as Record<string, unknown> | undefined
  const priceSpec = offer?.priceSpecification as Record<string, unknown> | undefined
  const rawPrice = offer?.price ?? priceSpec?.price
  const brand = productNode.brand
  const image = productNode.image

  return {
    name: typeof productNode.name === 'string' ? productNode.name : undefined,
    description: typeof productNode.description === 'string' ? productNode.description : undefined,
    image: Array.isArray(image)
      ? image.filter((item): item is string => typeof item === 'string')
      : typeof image === 'string'
        ? [image]
        : undefined,
    price: normalizeExtractedPrice(rawPrice),
    currency:
      (typeof offer?.priceCurrency === 'string' ? offer.priceCurrency : undefined) ??
      (typeof priceSpec?.priceCurrency === 'string' ? priceSpec.priceCurrency : undefined),
    availability: typeof offer?.availability === 'string' ? offer.availability : undefined,
    sku: typeof productNode.sku === 'string' ? productNode.sku : undefined,
    brand:
      typeof brand === 'string'
        ? brand
        : brand && typeof brand === 'object' && typeof (brand as Record<string, unknown>).name === 'string'
          ? ((brand as Record<string, unknown>).name as string)
          : undefined,
    url,
  }
}
function normalizeExtractedPrice(price: unknown): string | number | undefined {
  if (price === undefined || price === null) return undefined
  if (typeof price === 'number' && Number.isFinite(price)) return price
  if (typeof price === 'string' && price.trim()) return price.trim()
  return undefined
}

function fallbackToMetaTags($: ReturnType<typeof load>, url: string): ProductData {
  const get = (name: string) =>
    $(`meta[property="${name}"]`).attr('content') ?? $(`meta[name="${name}"]`).attr('content')

  return {
    name: get('og:title') ?? $('title').text(),
    description: get('og:description'),
    image: get('og:image') ? [get('og:image')!] : undefined,
    price: normalizeExtractedPrice(get('product:price:amount') ?? get('og:price:amount')),
    currency: get('product:price:currency') ?? get('og:price:currency'),
    url,
  }
}
