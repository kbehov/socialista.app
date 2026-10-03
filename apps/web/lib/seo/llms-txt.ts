import { ABOUT_PAGE } from '@/components/landing/about-content'
import { COMPARE_CHECKED_LABEL, COMPARE_COMPETITORS, comparePath } from '@/components/landing/compare'
import { LANDING_CHANNELS } from '@/components/landing/content'
import { FEATURE_CATEGORIES, FEATURES, featurePath, featuresByCategory } from '@/components/landing/features'
import { INDUSTRIES, industryPath } from '@/components/landing/industries'
import type { LegalDocumentMeta } from '@/components/landing/legal-document'
import { PRICING_FAQ_ITEMS, PRICING_PAGE } from '@/components/landing/pricing-content'
import { PRIVACY_POLICY_DOCUMENT } from '@/components/landing/privacy-policy-content'
import { TERMS_OF_SERVICE_DOCUMENT } from '@/components/landing/terms-of-service-content'

import { absoluteUrl, SITE_CONFIG } from './base'

const CHANNELS = new Intl.ListFormat('en', { type: 'conjunction' }).format(
  LANDING_CHANNELS.map(channel => channel.label),
)

const FEATURES_PAGE_SUMMARY =
  'Eight guides: AI influencers, UGC video, slideshows, static Meta ads, images, short video, scheduling, and organic analytics.'

function withAbsoluteLinks(markdown: string): string {
  return markdown.replace(/\]\((\/[^)]*)\)/g, (_match, path: string) => `](${absoluteUrl(path)})`)
}

function fileItem(name: string, path: string, notes: string): string {
  return `- [${name}](${absoluteUrl(path)}): ${withAbsoluteLinks(notes)}`
}

function section(title: string, items: readonly string[]): string {
  return [`## ${title}`, '', ...items].join('\n')
}

function heading(level: 2 | 3 | 4, title: string): string {
  return `${'#'.repeat(level)} ${title}`
}

function paragraphs(...blocks: readonly (string | readonly string[])[]): string {
  return blocks
    .flatMap(block => (typeof block === 'string' ? [block] : [...block]))
    .map(block => withAbsoluteLinks(block))
    .join('\n\n')
}

function faqList(items: readonly { question: string; answer: string }[]): string {
  return items
    .map(item => `**${withAbsoluteLinks(item.question)}**\n\n${withAbsoluteLinks(item.answer)}`)
    .join('\n\n')
}

function bulletList(items: readonly string[]): string {
  return items.map(item => `- ${withAbsoluteLinks(item)}`).join('\n')
}

function legalMarkdown(doc: LegalDocumentMeta, sectionLevel: 3 | 4): string {
  const parts = [
    withAbsoluteLinks(doc.description),
    '',
    `Effective ${doc.effectiveDate}. Last updated ${doc.lastUpdated}.`,
    '',
    ...doc.intro.map(paragraph => withAbsoluteLinks(paragraph)),
  ]

  for (const legalSection of doc.sections) {
    parts.push('', heading(sectionLevel, legalSection.title), '')
    for (const block of legalSection.blocks) {
      if (block.type === 'paragraph') {
        parts.push(withAbsoluteLinks(block.text), '')
      } else {
        parts.push(bulletList(block.items), '')
      }
    }
  }

  return parts.join('\n').replace(/\n{3,}/g, '\n\n')
}

/** Curated `/llms.txt` index — small enough to fit in context; detail lives behind the links. */
export function buildLlmsTxt(): string {
  const createItems = featuresByCategory('create').map(feature =>
    fileItem(feature.name, featurePath(feature.slug), feature.summary),
  )
  const publishItems = featuresByCategory('publish').map(feature =>
    fileItem(feature.name, featurePath(feature.slug), feature.summary),
  )
  const industryItems = INDUSTRIES.map(industry =>
    fileItem(industry.name, industryPath(industry.slug), industry.summary),
  )
  const compareItems = COMPARE_COMPETITORS.map(competitor =>
    fileItem(`Socialista vs ${competitor.name}`, comparePath(competitor.slug), competitor.difference),
  )

  return [
    `# ${SITE_CONFIG.name}`,
    '',
    `> ${SITE_CONFIG.description}`,
    '',
    paragraphs(
      `${SITE_CONFIG.name} is a web studio at ${SITE_CONFIG.url}. Save a brand and a product, generate UGC-style video, static ads, slideshows, images, and short clips with a reusable AI creator, then schedule a caption per connected account.`,
      `Publishes to ${CHANNELS}. Start free, no credit card. Contact ${SITE_CONFIG.email}.`,
      'This file is an index for AI agents. Follow a link for one topic, or read the full markdown dump when you need the public site in one request. Do not cite dashboard, API, or account URLs — those are private.',
      [
        '- Create: AI influencers, talking-head UGC with the product in frame, faceless slideshows, static Meta ads, images, and short video.',
        '- Publish: one caption per connected account; queue and post from a calendar.',
        '- Measure: organic reach and engagement on connected accounts.',
        '- Not an ads manager. Paid campaigns stay in Meta Ads Manager or the native ads tool.',
      ].join('\n'),
    ),
    '',
    section('Docs', [
      fileItem(
        'Full markdown',
        '/llms-full.txt',
        'Single-file dump of the public product, feature, industry, comparison, pricing, and legal pages.',
      ),
    ]),
    '',
    section('Product', [
      fileItem('Home', '/', 'Product overview: realistic AI UGC ads, then publish from the same studio.'),
      fileItem('About', '/about', ABOUT_PAGE.metaDescription),
      fileItem(
        'Pricing',
        '/pricing',
        'Free to start, no card. Live plans list credits, seats, and connected accounts at checkout.',
      ),
      fileItem('Features', '/features', FEATURES_PAGE_SUMMARY),
    ]),
    '',
    section(FEATURE_CATEGORIES[0].label, createItems),
    '',
    section(FEATURE_CATEGORIES[1].label, publishItems),
    '',
    section('Industries', [
      fileItem(
        'Industries',
        '/industries',
        'Playbooks for ecommerce, mobile apps, SaaS, dropshipping, agencies, creators, and founders.',
      ),
      ...industryItems,
    ]),
    '',
    section('Comparisons', [
      fileItem(
        'Compare',
        '/compare',
        `Public comparisons vs UGC, ads, and scheduling tools. Facts checked ${COMPARE_CHECKED_LABEL}.`,
      ),
      ...compareItems,
    ]),
    '',
    section('Optional', [
      fileItem('Privacy Policy', '/privacy', PRIVACY_POLICY_DOCUMENT.description),
      fileItem('Terms of Service', '/terms', TERMS_OF_SERVICE_DOCUMENT.description),
      fileItem('Sitemap', '/sitemap.xml', 'Indexable HTML URLs for the public marketing site.'),
    ]),
    '',
  ].join('\n')
}

/** Expanded `/llms-full.txt` companion so an agent can load the public site without parsing HTML. */
export function buildLlmsFullTxt(): string {
  const featureBlocks = FEATURES.map(feature =>
    [
      heading(3, feature.name),
      '',
      `[Open the guide](${absoluteUrl(featurePath(feature.slug))})`,
      '',
      withAbsoluteLinks(feature.description),
      '',
      heading(4, feature.essay.heading),
      '',
      paragraphs(feature.essay.paragraphs),
      '',
      heading(4, feature.limitsHeading),
      '',
      bulletList(feature.limits.map(limit => `**${limit.title}.** ${limit.description}`)),
      '',
      heading(4, 'FAQ'),
      '',
      faqList(feature.faqs),
    ].join('\n'),
  )

  const industryBlocks = INDUSTRIES.map(industry =>
    [
      heading(3, industry.name),
      '',
      `[${industry.name}](${absoluteUrl(industryPath(industry.slug))}) — ${industry.audience}`,
      '',
      withAbsoluteLinks(industry.description),
    ].join('\n'),
  )

  const compareBlocks = COMPARE_COMPETITORS.map(competitor =>
    [
      heading(3, `Socialista vs ${competitor.name}`),
      '',
      `[Full comparison](${absoluteUrl(comparePath(competitor.slug))})`,
      '',
      withAbsoluteLinks(competitor.difference),
      '',
      withAbsoluteLinks(competitor.verdict),
      '',
      '**Choose Socialista when:**',
      '',
      bulletList(competitor.bestForSocialista),
      '',
      `**Choose ${competitor.name} when:**`,
      '',
      bulletList(competitor.bestForThem),
    ].join('\n'),
  )

  const included = PRICING_PAGE.included.groups.map(group =>
    [`**${group.title}**`, '', bulletList(group.items)].join('\n'),
  )

  const billing = PRICING_PAGE.billing.steps.map(step => `**${step.name}.** ${step.text}`)

  return [
    `# ${SITE_CONFIG.name}`,
    '',
    `> ${SITE_CONFIG.description}`,
    '',
    paragraphs(
      `Canonical site: ${SITE_CONFIG.url}. Contact: ${SITE_CONFIG.email}.`,
      `Publishes to ${CHANNELS}. Start free, no credit card. Checkout shows live credits, seats, and connected-account limits — this file does not invent a price.`,
      'Socialista is not an ads manager. Paid campaigns stay in Meta Ads Manager or the native ads tool. Analytics on this product are organic reach and engagement for connected accounts.',
      `Index: ${absoluteUrl('/llms.txt')}.`,
    ),
    '',
    heading(2, 'About'),
    '',
    paragraphs(
      `${ABOUT_PAGE.statement.lead} ${ABOUT_PAGE.statement.rest}`,
      ABOUT_PAGE.about.paragraphs,
      ABOUT_PAGE.who.description,
    ),
    '',
    heading(2, 'Features'),
    '',
    FEATURE_CATEGORIES.map(category => `**${category.label}.** ${category.description}`).join('\n\n'),
    '',
    featureBlocks.join('\n\n'),
    '',
    heading(2, 'Industries'),
    '',
    industryBlocks.join('\n\n'),
    '',
    heading(2, 'Comparisons'),
    '',
    `Public product facts checked ${COMPARE_CHECKED_LABEL}. Each comparison names its source URL. If a competitor page moved, treat that page as the live source.`,
    '',
    compareBlocks.join('\n\n'),
    '',
    heading(2, 'Pricing'),
    '',
    paragraphs(PRICING_PAGE.hero.description, PRICING_PAGE.included.description, PRICING_PAGE.billing.description),
    '',
    included.join('\n\n'),
    '',
    heading(3, PRICING_PAGE.billing.title),
    '',
    paragraphs(billing),
    '',
    heading(3, 'Pricing FAQ'),
    '',
    faqList(PRICING_FAQ_ITEMS),
    '',
    heading(2, 'Privacy Policy'),
    '',
    legalMarkdown(PRIVACY_POLICY_DOCUMENT, 3),
    '',
    heading(2, 'Terms of Service'),
    '',
    legalMarkdown(TERMS_OF_SERVICE_DOCUMENT, 3),
    '',
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}

export function llmsTxtResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
