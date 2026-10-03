import { formatProductPrice } from '@/lib/pricing'
import type { PolarProduct } from '@socialista/types'
import { createElement } from 'react'

import { absoluteUrl, SITE_CONFIG } from './base'

export type JsonLdNode = Record<string, unknown>

export type FaqEntry = {
  question: string
  answer: string
}

export type BreadcrumbEntry = {
  name: string
  path: string
}

const ORGANIZATION_ID = `${SITE_CONFIG.url}/#organization`
const APP_ID = `${SITE_CONFIG.url}/#app`

function nodeId(path: string, fragment: string) {
  return `${absoluteUrl(path)}#${fragment}`
}

export function organizationJsonLd(): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: absoluteUrl(SITE_CONFIG.logoPath),
    email: SITE_CONFIG.email,
  }
}

/** Numeric schema.org Offers from live Polar products. Skips custom / contact-us plans. */
export function softwareApplicationJsonLd(products?: readonly PolarProduct[]): JsonLdNode {
  const offers =
    products && products.length > 0
      ? products.flatMap(product => {
          const pricing = formatProductPrice(product)
          const price = product.prices.find(entry => entry.priceAmount != null && entry.priceAmount > 0)
          const amount =
            price?.priceAmount != null ? (price.priceAmount / 100).toFixed(2) : pricing.isFree ? '0.00' : null
          if (amount == null) return []
          return [
            {
              '@type': 'Offer',
              name: product.name,
              price: amount,
              priceCurrency: price?.priceCurrency?.toUpperCase() ?? 'USD',
              availability: 'https://schema.org/InStock',
              url: SITE_CONFIG.url,
            },
          ]
        })
      : undefined

  return {
    '@type': 'SoftwareApplication',
    '@id': APP_ID,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: SITE_CONFIG.description,
    publisher: { '@id': ORGANIZATION_ID },
    ...(offers && offers.length > 0 ? { offers } : {}),
  }
}

export function webPageJsonLd({
  name,
  description,
  path,
}: {
  name: string
  description: string
  path: string
}): JsonLdNode {
  return {
    '@type': 'WebPage',
    '@id': nodeId(path, 'webpage'),
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { '@id': ORGANIZATION_ID },
    about: { '@id': APP_ID },
    inLanguage: 'en',
  }
}

export function breadcrumbJsonLd(items: readonly BreadcrumbEntry[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export type HowToStepEntry = {
  name: string
  text: string
}

export function howToJsonLd({
  name,
  description,
  steps,
  path,
}: {
  name: string
  description: string
  steps: readonly HowToStepEntry[]
  path: string
}): JsonLdNode {
  return {
    '@type': 'HowTo',
    '@id': nodeId(path, 'howto'),
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }
}

export type ItemListEntry = {
  name: string
  path: string
}

export function itemListJsonLd({
  name,
  path,
  items,
}: {
  name: string
  path: string
  items: readonly ItemListEntry[]
}): JsonLdNode {
  return {
    '@type': 'ItemList',
    '@id': nodeId(path, 'itemlist'),
    name,
    url: absoluteUrl(path),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  }
}

export function faqPageJsonLd(faqs: readonly FaqEntry[], path: string): JsonLdNode {
  return {
    '@type': 'FAQPage',
    '@id': nodeId(path, 'faq'),
    url: absoluteUrl(path),
    mainEntity: faqs.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

function jsonLdPayload(data: JsonLdNode | readonly JsonLdNode[]) {
  if (Array.isArray(data)) {
    return { '@context': 'https://schema.org', '@graph': data }
  }
  return { '@context': 'https://schema.org', ...data }
}

/** JSON-LD script. `<` is escaped so the payload cannot break out of the script tag. */
export function JsonLd({ data }: { data: JsonLdNode | readonly JsonLdNode[] }) {
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(jsonLdPayload(data)).replace(/</g, '\\u003c'),
    },
  })
}
