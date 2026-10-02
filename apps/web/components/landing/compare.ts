/** Public comparison facts. Checked 2026-10-02 against each source URL. */

export const COMPARE_CHECKED_ON = '2026-10-02'
export const COMPARE_CHECKED_LABEL = 'October 2, 2026'

export const SOCIALISTA_PRICING =
  'Free to start. Paid plans are shown at checkout.'

export type CompareCell = 'yes' | 'no' | 'partial' | 'unpublished'

export const COMPARE_CELL_LABEL: Record<CompareCell, string> = {
  yes: 'Yes',
  no: 'No',
  partial: 'Partial',
  unpublished: 'Not listed',
}

export const COMPARE_GROUPS = [
  { id: 'create', label: 'Create' },
  { id: 'publish', label: 'Publish' },
  { id: 'workspace', label: 'Workspace' },
] as const

export type CompareGroupId = (typeof COMPARE_GROUPS)[number]['id']

export type CompareFeature = {
  id: string
  group: CompareGroupId
  label: string
  socialista: CompareCell
  /** Limit on the Socialista cell. Only set when the cell is partial. */
  socialistaNote?: string
}

export const COMPARE_FEATURES = [
  {
    id: 'aiUgc',
    group: 'create',
    label: 'AI UGC video',
    socialista: 'yes',
  },
  {
    id: 'creatorLibrary',
    group: 'create',
    label: 'AI creator library',
    socialista: 'yes',
  },
  {
    id: 'customCreator',
    group: 'create',
    label: 'A creator you own',
    socialista: 'yes',
  },
  {
    id: 'productInFrame',
    group: 'create',
    label: 'Product in the frame',
    socialista: 'yes',
  },
  {
    id: 'staticAds',
    group: 'create',
    label: 'Static ads',
    socialista: 'yes',
  },
  {
    id: 'slideshows',
    group: 'create',
    label: 'Slideshows',
    socialista: 'yes',
  },
  {
    id: 'aiImages',
    group: 'create',
    label: 'AI images',
    socialista: 'yes',
  },
  {
    id: 'editor',
    group: 'create',
    label: 'Captions and video editing',
    socialista: 'yes',
  },
  {
    id: 'languages',
    group: 'create',
    label: 'More than one language',
    socialista: 'partial',
    socialistaNote: '13 languages for UGC voice. About 20 languages for ad copy.',
  },
  {
    id: 'urlToAd',
    group: 'create',
    label: 'Product URL to a finished ad',
    socialista: 'partial',
    socialistaNote:
      'A product URL can go on the brief. Socialista does not turn that page into an ad by itself.',
  },
  {
    id: 'organicPublish',
    group: 'publish',
    label: 'Post to Instagram, TikTok, Facebook, Threads, LinkedIn, and X',
    socialista: 'yes',
  },
  {
    id: 'schedule',
    group: 'publish',
    label: 'Schedule posts',
    socialista: 'yes',
  },
  {
    id: 'analytics',
    group: 'publish',
    label: 'Analytics for connected accounts',
    socialista: 'yes',
  },
  {
    id: 'adLauncher',
    group: 'publish',
    label: 'Launch ads into ad accounts',
    socialista: 'no',
  },
  {
    id: 'competitorResearch',
    group: 'publish',
    label: 'Competitor ad research',
    socialista: 'no',
  },
  {
    id: 'inbox',
    group: 'publish',
    label: 'Community inbox',
    socialista: 'no',
  },
  {
    id: 'freeStart',
    group: 'workspace',
    label: 'Start free',
    socialista: 'yes',
  },
  {
    id: 'team',
    group: 'workspace',
    label: 'Team workspace',
    socialista: 'yes',
  },
] as const satisfies readonly CompareFeature[]

export type CompareFeatureId = (typeof COMPARE_FEATURES)[number]['id']

export type CompareSource = {
  label: string
  url: string
}

export type CompareFaq = {
  question: string
  answer: string
}

export type CompareCompetitor = {
  slug: string
  name: string
  /** One line on the hub card. */
  summary: string
  /** One sentence under the page title. */
  difference: string
  bestForSocialista: string
  bestForThem: string
  cells: Record<CompareFeatureId, CompareCell>
  notes?: Partial<Record<CompareFeatureId, string>>
  pricing: {
    summary: string
    sourceLabel: string
    sourceUrl: string
  }
  sources: readonly CompareSource[]
  faqs: readonly CompareFaq[]
}

const ARCADS_FEATURES = 'https://www.arcads.ai/features/ai-ugc-video'
const MAKEUGC_PRICING = 'https://makeugc.ai/pricing'
const BUFFER_PRICING = 'https://buffer.com/pricing'
const SUPERSCALE_PRICING = 'https://superscale.ai/pricing'
const HEYGEN_PRICING = 'https://www.heygen.com/pricing'
const HEYGEN_FAQ = 'https://www.heygen.com/faq'
const CREATIFY_PRICING = 'https://creatify.ai/pricing'
const CREATIFY_URL = 'https://creatify.ai/features/url-to-video'

export const COMPARE_COMPETITORS = [
  {
    slug: 'arcads',
    name: 'Arcads',
    summary: 'Talking-actor UGC ads. The price is not on their site.',
    difference:
      'Arcads makes talking-actor ads with a large actor library. Socialista makes the ad and posts it to your channels.',
    bestForSocialista:
      'You want the UGC ad, then a scheduled post on Instagram, TikTok, Facebook, Threads, LinkedIn, or X.',
    bestForThem:
      'You want 1,000+ AI actors, emotion control, and translation in more than 30 languages, and you already have a place to publish.',
    cells: {
      aiUgc: 'yes',
      creatorLibrary: 'yes',
      customCreator: 'yes',
      productInFrame: 'unpublished',
      staticAds: 'unpublished',
      slideshows: 'unpublished',
      aiImages: 'yes',
      editor: 'yes',
      languages: 'yes',
      urlToAd: 'unpublished',
      organicPublish: 'unpublished',
      schedule: 'unpublished',
      analytics: 'unpublished',
      adLauncher: 'unpublished',
      competitorResearch: 'unpublished',
      inbox: 'unpublished',
      freeStart: 'unpublished',
      team: 'partial',
    },
    notes: {
      creatorLibrary: 'Their feature page says 1,000+ AI actors.',
      customCreator: 'You can create your own AI avatar.',
      aiImages: 'Their feature page includes an AI photoshoot from a photo.',
      editor: 'B-roll, music, captions, and transitions.',
      languages: 'Translation in more than 30 languages.',
      team: 'Their Create workflow is described for a team. Seat limits are not published.',
    },
    pricing: {
      summary:
        'Not published. The Arcads pricing page was unavailable when we checked, so this page does not repeat prices from other sites.',
      sourceLabel: 'Arcads AI UGC video',
      sourceUrl: ARCADS_FEATURES,
    },
    sources: [{ label: 'Arcads AI UGC video', url: ARCADS_FEATURES }],
    faqs: [
      {
        question: 'Does Arcads publish a price?',
        answer:
          'Not on the pages we checked. arcads.ai/pricing did not list plans on October 2, 2026. Socialista lets you start free, and paid plans are shown at checkout.',
      },
      {
        question: 'Can Arcads post the ad for you?',
        answer:
          'Their public feature page describes talking-actor ads, captions, and translation. It does not say Arcads publishes or schedules organic posts.',
      },
      {
        question: 'When is Arcads the better fit?',
        answer:
          'When you want a large actor library and emotion control, and publishing already lives in another tool. When you want the creative and the post in one studio, use Socialista.',
      },
    ],
  },
  {
    slug: 'makeugc',
    name: 'MakeUGC',
    summary: 'AI UGC and image models, from $59 a month.',
    difference:
      'MakeUGC sells generation credits for AI UGC and images. Socialista generates the creative and publishes it.',
    bestForSocialista:
      'You want the video, the still, and the post in one workspace, and you want to start free.',
    bestForThem:
      'You want MakeUGC’s model lineup and monthly credits, and you will publish the file yourself.',
    cells: {
      aiUgc: 'yes',
      creatorLibrary: 'yes',
      customCreator: 'unpublished',
      productInFrame: 'unpublished',
      staticAds: 'unpublished',
      slideshows: 'unpublished',
      aiImages: 'partial',
      editor: 'unpublished',
      languages: 'unpublished',
      urlToAd: 'unpublished',
      organicPublish: 'unpublished',
      schedule: 'unpublished',
      analytics: 'unpublished',
      adLauncher: 'unpublished',
      competitorResearch: 'unpublished',
      inbox: 'unpublished',
      freeStart: 'partial',
      team: 'unpublished',
    },
    notes: {
      creatorLibrary: 'The product is built around AI creators. A public avatar count is not on the pricing page.',
      aiImages: 'Image models are listed on the pricing page. It does not say every plan includes them.',
      freeStart: 'A $1 introductory offer is advertised. It is not a free plan.',
    },
    pricing: {
      summary:
        'Startup is $59 a month for 500 credits. Growth is $79 for 1,000. Pro is $149 for 2,000. API access is a separate plan from $99 a month. Unused credits do not roll over.',
      sourceLabel: 'MakeUGC pricing',
      sourceUrl: MAKEUGC_PRICING,
    },
    sources: [{ label: 'MakeUGC pricing', url: MAKEUGC_PRICING }],
    faqs: [
      {
        question: 'How much does MakeUGC cost?',
        answer:
          'On October 2, 2026 the pricing page listed Startup at $59 a month (500 credits), Growth at $79 (1,000), and Pro at $149 (2,000). API plans start at $99 a month and are sold separately. Credits refresh each cycle and do not roll over.',
      },
      {
        question: 'Is product-in-hand on every MakeUGC plan?',
        answer:
          'The pricing page does not say. A third-party review from August 2026 said product-in-hand starts on Pro. Treat that as a report, not as MakeUGC’s own claim.',
      },
      {
        question: 'Can MakeUGC schedule the post?',
        answer:
          'The pricing page describes video generation, image models, and credits. It does not describe posting or scheduling to Instagram, TikTok, or the other channels Socialista connects.',
      },
    ],
  },
  {
    slug: 'buffer',
    name: 'Buffer',
    summary: 'Schedule and measure posts. It does not generate the ads.',
    difference:
      'Buffer publishes and measures social posts. Socialista makes the UGC, stills, and slideshows, then publishes them.',
    bestForSocialista: 'You still need to make the UGC, the static ad, or the slideshow.',
    bestForThem:
      'The creative already exists, and you need a scheduler, analytics, and a community inbox.',
    cells: {
      aiUgc: 'no',
      creatorLibrary: 'no',
      customCreator: 'no',
      productInFrame: 'no',
      staticAds: 'no',
      slideshows: 'no',
      aiImages: 'no',
      editor: 'no',
      languages: 'unpublished',
      urlToAd: 'no',
      organicPublish: 'yes',
      schedule: 'yes',
      analytics: 'yes',
      adLauncher: 'no',
      competitorResearch: 'no',
      inbox: 'yes',
      freeStart: 'yes',
      team: 'yes',
    },
    notes: {
      slideshows: 'Buffer can schedule posts you already made. It does not generate slideshows.',
      aiImages: 'The AI assistant writes and rewrites copy. It does not generate images.',
      organicPublish: 'Publishing is the product. The free plan includes 3 channels.',
      analytics: 'Free includes 30 days of history. Paid plans include unlimited history.',
      freeStart: 'Free covers 3 channels and 10 scheduled posts per channel.',
      team: 'The Team plan includes unlimited users. Essentials is one user.',
    },
    pricing: {
      summary:
        'Free for 3 channels and 10 scheduled posts per channel. Essentials starts at $6 per channel per month. Team starts at $12 per channel per month. Buffer last updated these prices in November 2025.',
      sourceLabel: 'Buffer pricing',
      sourceUrl: BUFFER_PRICING,
    },
    sources: [{ label: 'Buffer pricing', url: BUFFER_PRICING }],
    faqs: [
      {
        question: 'Does Buffer make UGC ads?',
        answer:
          'No. Buffer is a publishing, analytics, and engagement suite. It includes an AI assistant for writing. It does not generate UGC video, static ads, slideshows, or AI creators.',
      },
      {
        question: 'How does Buffer pricing work?',
        answer:
          'You pay per channel. The free plan covers 3 channels. Essentials starts at $6 per channel per month, and Team starts at $12. The per-channel rate drops after 10 channels. Buffer says these prices were last updated in November 2025.',
      },
      {
        question: 'When is Buffer the better choice?',
        answer:
          'When the creative is already done and you need a community inbox plus scheduling across many channels. When you still need to make the ad, Socialista covers creation and posting.',
      },
    ],
  },
  {
    slug: 'superscale',
    name: 'Superscale',
    summary: 'An ad agent for competitor research and creatives, from $99 a month.',
    difference:
      'Superscale researches ads and generates creatives for paid social. Socialista generates the creative and posts it to your organic channels.',
    bestForSocialista: 'You want to make the ad and post it to your own channels.',
    bestForThem:
      'You want an agent that studies competitor ads and works from a Meta Ads account.',
    cells: {
      aiUgc: 'yes',
      creatorLibrary: 'yes',
      customCreator: 'unpublished',
      productInFrame: 'yes',
      staticAds: 'yes',
      slideshows: 'unpublished',
      aiImages: 'unpublished',
      editor: 'unpublished',
      languages: 'unpublished',
      urlToAd: 'unpublished',
      organicPublish: 'unpublished',
      schedule: 'unpublished',
      analytics: 'unpublished',
      adLauncher: 'partial',
      competitorResearch: 'yes',
      inbox: 'unpublished',
      freeStart: 'partial',
      team: 'unpublished',
    },
    notes: {
      aiUgc: 'Speaking AI UGC with realistic creators, named on the pricing page.',
      productInFrame: 'Product demos and app walkthroughs are listed formats.',
      staticAds: 'Static ads and CTA screens are listed formats.',
      adLauncher:
        'The pricing page describes a Meta Ads connection for analysis and new campaigns. TikTok and Google ad accounts are not stated there.',
      competitorResearch: 'The product analyzes competitors and benchmarks ads.',
      freeStart: 'New accounts get trial credits and can start a 5-day trial. There is no ongoing free plan on the pricing page.',
    },
    pricing: {
      summary:
        'Plans start at $99 a month, after trial credits and a 5-day trial. Older prices quoted in reviews are not repeated here.',
      sourceLabel: 'Superscale pricing',
      sourceUrl: SUPERSCALE_PRICING,
    },
    sources: [{ label: 'Superscale pricing', url: SUPERSCALE_PRICING }],
    faqs: [
      {
        question: 'What does Superscale cost?',
        answer:
          'The pricing page says you can start with trial credits, then a 5-day trial, then a plan from $99 a month. This page does not use older prices from reviews that disagree with that page.',
      },
      {
        question: 'Does Superscale post to your TikTok profile?',
        answer:
          'The pricing page does not say it publishes or schedules organic posts. It does describe connecting a Meta Ads account to analyze campaigns and generate creatives.',
      },
      {
        question: 'What is Superscale for?',
        answer:
          'Researching competitor ads and producing speaking UGC, product demos, and static ads for paid social. Socialista is the better fit when the next step is an organic post.',
      },
    ],
  },
  {
    slug: 'heygen',
    name: 'HeyGen',
    summary: 'Avatar video and translation, with a free plan.',
    difference:
      'HeyGen turns a script into avatar video and translates it. Socialista makes short social creative and posts it.',
    bestForSocialista: 'You are making short social ads and posting them from the same studio.',
    bestForThem:
      'You need a digital twin, longer avatar videos, or translation across 175+ languages.',
    cells: {
      aiUgc: 'partial',
      creatorLibrary: 'yes',
      customCreator: 'yes',
      productInFrame: 'unpublished',
      staticAds: 'unpublished',
      slideshows: 'unpublished',
      aiImages: 'partial',
      editor: 'unpublished',
      languages: 'yes',
      urlToAd: 'unpublished',
      organicPublish: 'unpublished',
      schedule: 'unpublished',
      analytics: 'unpublished',
      adLauncher: 'unpublished',
      competitorResearch: 'unpublished',
      inbox: 'unpublished',
      freeStart: 'yes',
      team: 'yes',
    },
    notes: {
      aiUgc: 'Talking avatars, not a UGC ad studio with your product in frame.',
      creatorLibrary: 'The pricing page includes 500+ stock video avatars.',
      customCreator: 'Custom video avatars and digital twins are on paid plans.',
      aiImages: 'Photo avatars, not a static-ad or image studio.',
      languages: 'The HeyGen FAQ lists 175+ languages.',
      freeStart: 'Free includes 3 videos a month, up to 1 minute, with no card.',
      team: 'Business is $149 a month plus $20 per extra seat, with workspace collaboration.',
    },
    pricing: {
      summary:
        'Free covers 3 videos a month. Creator is $29 a month. Pro starts at $49 a month. Business is $149 a month plus $20 per extra seat.',
      sourceLabel: 'HeyGen pricing',
      sourceUrl: HEYGEN_PRICING,
    },
    sources: [
      { label: 'HeyGen pricing', url: HEYGEN_PRICING },
      { label: 'HeyGen FAQ', url: HEYGEN_FAQ },
    ],
    faqs: [
      {
        question: 'How much is HeyGen?',
        answer:
          'HeyGen’s pricing page lists a free plan with 3 videos a month, Creator at $29 a month, Pro from $49 a month, and Business at $149 a month plus $20 per extra seat.',
      },
      {
        question: 'Is HeyGen a UGC ad tool?',
        answer:
          'It is an avatar video tool: stock avatars, a digital twin, and translation. The pages we checked do not describe product-in-frame UGC ads, slideshows, or posting to connected social accounts.',
      },
      {
        question: 'When should I pick HeyGen?',
        answer:
          'When you need a long-form avatar of a real person and wide translation. When you need a short ad and an organic post together, use Socialista.',
      },
    ],
  },
  {
    slug: 'creatify',
    name: 'Creatify',
    summary: 'Paste a product URL and get a video ad. The free export has a watermark.',
    difference:
      'Creatify turns a product URL into a video ad. Socialista makes the creative and schedules it to connected accounts.',
    bestForSocialista: 'You want the file scheduled to connected accounts, not only exported.',
    bestForThem:
      'You want to paste a product URL and get a video ad, or on Pro launch it into Meta, TikTok, or AppLovin.',
    cells: {
      aiUgc: 'yes',
      creatorLibrary: 'yes',
      customCreator: 'partial',
      productInFrame: 'yes',
      staticAds: 'yes',
      slideshows: 'unpublished',
      aiImages: 'yes',
      editor: 'yes',
      languages: 'yes',
      urlToAd: 'yes',
      organicPublish: 'no',
      schedule: 'no',
      analytics: 'no',
      adLauncher: 'partial',
      competitorResearch: 'partial',
      inbox: 'no',
      freeStart: 'yes',
      team: 'partial',
    },
    notes: {
      creatorLibrary: '300 AI actors on Starter. 1,500 on Pro.',
      customCreator: '3 custom avatars on Pro. Starter does not include them.',
      staticAds: 'The free plan includes image ads. Exports on Free include a watermark.',
      editor: 'A built-in editor for trim, cut, and captions.',
      languages: '75+ languages on paid plans.',
      urlToAd: 'Paste a product URL. Creatify pulls the page and returns a video ad.',
      organicPublish: 'Export sizes for TikTok, Instagram, Facebook, and YouTube. No connected-account posting.',
      schedule: 'No scheduler for connected accounts.',
      adLauncher: 'Meta, TikTok, and AppLovin launching is on Pro, not Starter.',
      competitorResearch: 'The competitor ad tracker is on Pro.',
      freeStart: '10 credits a month. Exports include a watermark.',
      team: 'Starter is 1 seat. Pro includes up to 5 seats, with 2 included.',
    },
    pricing: {
      summary:
        'Free is 10 credits a month, and exports include a watermark. Starter is $39 a month for 100 credits. Pro starts at $99 a month for 300 credits.',
      sourceLabel: 'Creatify pricing',
      sourceUrl: CREATIFY_PRICING,
    },
    sources: [
      { label: 'Creatify pricing', url: CREATIFY_PRICING },
      { label: 'Creatify URL to video', url: CREATIFY_URL },
    ],
    faqs: [
      {
        question: 'How much is Creatify?',
        answer:
          'The pricing page lists a free plan with 10 credits and a watermark, Starter at $39 a month for 100 credits, and Pro from $99 a month for 300 credits. The ad launcher and competitor tracker are on Pro.',
      },
      {
        question: 'Does Creatify publish the ad?',
        answer:
          'It exports video sized for TikTok, Instagram, Facebook, and YouTube. It does not schedule posts to accounts you connect. Socialista does.',
      },
      {
        question: 'What does Creatify do that Socialista does not?',
        answer:
          'Paste a product URL and get a finished video ad. On Pro, it also tracks competitor ads and can launch into Meta, TikTok, and AppLovin. Socialista does not launch into ad accounts.',
      },
    ],
  },
] as const satisfies readonly CompareCompetitor[]

export type CompareSlug = (typeof COMPARE_COMPETITORS)[number]['slug']

export function getCompareCompetitor(slug: string) {
  return COMPARE_COMPETITORS.find(competitor => competitor.slug === slug)
}

export function comparePath(slug: string) {
  return `/compare/${slug}`
}
