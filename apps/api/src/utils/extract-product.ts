import { load } from 'cheerio'
import { fetch } from 'undici'

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
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
    redirect: 'follow',
  })

  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

  const html = await res.text()
  const $ = load(html)

  const ldJsonBlocks: any[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).text())
      ldJsonBlocks.push(parsed)
    } catch {
      // some sites have malformed/multiple JSON objects concatenated - skip silently
    }
  })

  // flatten @graph arrays (common in Yoast/WooCommerce SEO output)
  const flatBlocks = ldJsonBlocks.flatMap(block => (Array.isArray(block['@graph']) ? block['@graph'] : [block]))

  const productNode = flatBlocks.find(
    node => node['@type'] === 'Product' || (Array.isArray(node['@type']) && node['@type'].includes('Product')),
  )

  if (!productNode) return fallbackToMetaTags($, url) // see step 3

  const offer = Array.isArray(productNode.offers) ? productNode.offers[0] : productNode.offers
  const rawPrice = offer?.price ?? offer?.priceSpecification?.price

  return {
    name: productNode.name,
    description: productNode.description,
    image: Array.isArray(productNode.image) ? productNode.image : productNode.image ? [productNode.image] : undefined,
    price: normalizeExtractedPrice(rawPrice),
    currency: offer?.priceCurrency ?? offer?.priceSpecification?.priceCurrency,
    availability: offer?.availability,
    sku: productNode.sku,
    brand: typeof productNode.brand === 'string' ? productNode.brand : productNode.brand?.name,
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
