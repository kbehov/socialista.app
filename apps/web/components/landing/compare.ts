/** Public comparison facts. Checked 2026-10-02 against each source URL. */

export const COMPARE_CHECKED_ON = '2026-10-02'
export const COMPARE_CHECKED_LABEL = 'October 2, 2026'

export const SOCIALISTA_PRICING =
  'Free to start, no card. Paid plans list credits, seats, and connected accounts at checkout. Prices are live there — this site does not invent a number.'

export type CompareCell = 'yes' | 'no' | 'partial' | 'unpublished'

export const COMPARE_CELL_LABEL: Record<CompareCell, string> = {
  yes: 'Yes',
  no: 'No',
  partial: 'Partial',
  unpublished: 'Not listed',
}

export const COMPARE_CELL_HELP: Record<CompareCell, string> = {
  yes: 'Stated on a public page, or shipped in Socialista.',
  no: 'The product is not this. A public page says so, or the category makes it obvious.',
  partial: 'It exists with a limit. Read the note.',
  unpublished: 'The page we checked did not mention it. That is not a claim it is missing.',
}

export const COMPARE_GROUPS = [
  { id: 'create', label: 'Create' },
  { id: 'publish', label: 'Publish' },
  { id: 'workspace', label: 'Workspace' },
] as const

export type CompareGroupId = (typeof COMPARE_GROUPS)[number]['id']

export const COMPARE_LANES = [
  {
    id: 'make',
    label: 'Make the creative',
    description:
      'Talking-head UGC, avatars, and URL-to-video tools. The file is the product. Publishing, if it exists, is usually an export or an ad-account push.',
  },
  {
    id: 'paid',
    label: 'Research and launch ads',
    description:
      'Tools built around competitor ads, scores, and paid social. The next step is a campaign, not a post on your profile.',
  },
  {
    id: 'post',
    label: 'Schedule and post',
    description:
      'Calendars, queues, and template suites. Strong when the creative already exists, or when volume from templates is the job.',
  },
] as const

export type CompareLaneId = (typeof COMPARE_LANES)[number]['id']

export type CompareFeature = {
  id: string
  group: CompareGroupId
  label: string
  /** One line under the row label. What this row actually means. */
  hint: string
  socialista: CompareCell
  /** Limit or detail on the Socialista cell. */
  socialistaNote?: string
}

export const COMPARE_FEATURES = [
  {
    id: 'aiUgc',
    group: 'create',
    label: 'AI UGC video',
    hint: 'A talking-head clip that looks like a real creator shot it on a phone.',
    socialista: 'yes',
    socialistaNote: 'Talking-head UGC with a creator you pick or own, and the product in frame.',
  },
  {
    id: 'creatorLibrary',
    group: 'create',
    label: 'AI creator library',
    hint: 'A roster of AI people you can pick instead of booking talent.',
    socialista: 'yes',
    socialistaNote: 'A library of photoreal creators, plus ones you save in the workspace.',
  },
  {
    id: 'customCreator',
    group: 'create',
    label: 'A creator you own',
    hint: 'A face you define once and reuse, not a one-off stock actor.',
    socialista: 'yes',
    socialistaNote: 'Create a persona, save it, and reuse it on UGC, stills, and ads.',
  },
  {
    id: 'productInFrame',
    group: 'create',
    label: 'Product in the frame',
    hint: 'The actual product appears in the shot, not only as a later cutaway.',
    socialista: 'yes',
    socialistaNote: 'Drop a product photo onto the brief. The creator can hold or show it.',
  },
  {
    id: 'staticAds',
    group: 'create',
    label: 'Static ads',
    hint: 'Single-image ads sized for feeds and paid social.',
    socialista: 'yes',
    socialistaNote: 'Layouts built for Meta-style static ads, from a product photo.',
  },
  {
    id: 'slideshows',
    group: 'create',
    label: 'Slideshows',
    hint: 'Multi-slide carousels and short Reels made from stills.',
    socialista: 'yes',
    socialistaNote: 'Faceless slideshows and carousels, then a caption per channel.',
  },
  {
    id: 'aiImages',
    group: 'create',
    label: 'AI images',
    hint: 'Stills generated in the same studio, not only video.',
    socialista: 'yes',
    socialistaNote: 'Product stills and social images from the same brand and creator context.',
  },
  {
    id: 'editor',
    group: 'create',
    label: 'Captions and video editing',
    hint: 'Trim, caption, and tidy the clip without exporting to another editor first.',
    socialista: 'yes',
    socialistaNote: 'Captions, trim, remix, and export from the studio.',
  },
  {
    id: 'brandContext',
    group: 'create',
    label: 'Learns your brand and products',
    hint: 'Saved logo, products, and tone so Thursday does not start from a blank prompt.',
    socialista: 'yes',
    socialistaNote: 'Brand, product, and skill context live in the workspace and feed generation.',
  },
  {
    id: 'languages',
    group: 'create',
    label: 'More than one language',
    hint: 'Voice or copy in languages other than English.',
    socialista: 'partial',
    socialistaNote: '13 languages for UGC voice. About 20 languages for ad copy.',
  },
  {
    id: 'urlToAd',
    group: 'create',
    label: 'Product URL to a finished ad',
    hint: 'Paste a product page and get a finished ad back, without writing a brief.',
    socialista: 'partial',
    socialistaNote:
      'A product URL can go on the brief. Socialista does not scrape that page into an ad by itself.',
  },
  {
    id: 'bulkGenerate',
    group: 'create',
    label: 'Generate variations in bulk',
    hint: 'Produce many variants in one run, not one clip at a time.',
    socialista: 'partial',
    socialistaNote:
      'You can remix a clip into a new variant. There is no generate-N-ads control on the public pages.',
  },
  {
    id: 'organicPublish',
    group: 'publish',
    label: 'Post to connected social accounts',
    hint: 'Connect profiles and publish without downloading the file first.',
    socialista: 'yes',
    socialistaNote: 'Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
  },
  {
    id: 'schedule',
    group: 'publish',
    label: 'Schedule posts',
    hint: 'Queue a post for a future time on accounts you connect.',
    socialista: 'yes',
    socialistaNote: 'Draft, queue, and publish from the same studio that made the file.',
  },
  {
    id: 'contentCalendar',
    group: 'publish',
    label: 'Content calendar view',
    hint: 'See the week of posts in one view, not a list of timestamps.',
    socialista: 'yes',
    socialistaNote: 'A week calendar of the posts you generated and queued.',
  },
  {
    id: 'analytics',
    group: 'publish',
    label: 'Analytics for connected accounts',
    hint: 'Reach and engagement on the profiles you posted to, beside the posts themselves.',
    socialista: 'yes',
    socialistaNote: 'Organic reach and engagement on connected accounts. Not ads-manager ROAS.',
  },
  {
    id: 'adLauncher',
    group: 'publish',
    label: 'Launch ads into ad accounts',
    hint: 'Push the file into Meta, TikTok, or Google campaigns from the same app.',
    socialista: 'no',
    socialistaNote: 'Paid campaigns stay in the ads manager. Socialista is organic publishing.',
  },
  {
    id: 'competitorResearch',
    group: 'publish',
    label: 'Competitor ad research',
    hint: 'Scan other brands’ ads to brief new creatives.',
    socialista: 'no',
    socialistaNote: 'No ad library or competitor scanner. Bring your own references.',
  },
  {
    id: 'inbox',
    group: 'publish',
    label: 'Community inbox',
    hint: 'Reply to comments and DMs without opening the native apps.',
    socialista: 'no',
    socialistaNote: 'No comment or DM inbox. Replies stay in Instagram, TikTok, and the rest.',
  },
  {
    id: 'freeStart',
    group: 'workspace',
    label: 'Start free',
    hint: 'Use it without paying, or without putting a card on file.',
    socialista: 'yes',
    socialistaNote: 'No card. Studio limits apply until you upgrade.',
  },
  {
    id: 'team',
    group: 'workspace',
    label: 'Team workspace',
    hint: 'More than one person sharing brands, files, and posts.',
    socialista: 'yes',
    socialistaNote: 'Shared brands, products, creatives, and publishing. Seats are on the plan.',
  },
  {
    id: 'apiAccess',
    group: 'workspace',
    label: 'Public API',
    hint: 'Generate or publish from your own stack, not only the web app.',
    socialista: 'no',
    socialistaNote: 'No public API. The product is the studio in the browser.',
  },
] as const satisfies readonly CompareFeature[]

export type CompareFeatureId = (typeof COMPARE_FEATURES)[number]['id']

/** Four rows that sort the field on the hub. */
export const COMPARE_SNAPSHOT_IDS = [
  'aiUgc',
  'organicPublish',
  'freeStart',
  'adLauncher',
] as const satisfies readonly CompareFeatureId[]

export type CompareSource = {
  label: string
  url: string
}

export type CompareFaq = {
  question: string
  answer: string
}

export type CompareStat = {
  value: string
  label: string
}

export type ComparePlan = {
  name: string
  price: string
  detail: string
}

export type CompareScenario = {
  title: string
  pick: 'us' | 'them'
  body: string
}

export const COMPARE_HUB = {
  eyebrow: 'Compare',
  title: 'Which tool does',
  titleAccent: 'the next job.',
  description:
    'Eight tools people already have open when they need a social ad. We put what they publish — features, prices, limits — next to what Socialista ships.',
  intro: [
    'Most of these products are good at one step: the talking-head file, the avatar, the URL-to-video, the competitor scan, or the calendar. Socialista is the studio that makes the UGC, the still, and the slideshow, then posts to Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
    'We only score what a public page states. “Not listed” means we did not find it — not that it is missing. Prices are dated October 2, 2026. Each comparison links the page we used.',
  ],
  startHere: [
    {
      id: 'make',
      title: 'I still have to make the ad',
      note: 'Talking UGC, avatars, and URL-to-video. Arcads, MakeUGC, HeyGen, Creatify.',
    },
    {
      id: 'paid',
      title: 'I run paid social',
      note: 'Competitor ads, scores, and ad-account launches. Superscale and AdCreative.ai.',
    },
    {
      id: 'post',
      title: 'The creative already exists',
      note: 'Queues, inboxes, and template suites. Buffer and Predis.ai.',
    },
  ],
  snapshotLead:
    'Four questions that sort the field. Talking UGC, organic posting, a free start, and whether the tool launches into ad accounts.',
  methodologyTitle: 'How these pages are scored',
  methodology: [
    {
      title: 'Public pages only',
      body: 'Every cell cites a pricing page, a feature page, or the product itself. We do not copy prices from review blogs when they disagree with the vendor.',
    },
    {
      title: 'Not listed is not a no',
      body: 'If the page we checked did not mention a feature, the cell is a dash. The vendor may still ship it. Follow the source link.',
    },
    {
      title: 'Socialista is scored as shipped',
      body: 'Our column is what the studio does today: creation, scheduling, and organic analytics. We mark no where we do not have an inbox, an ad launcher, or a public API.',
    },
  ],
  faqs: [
    {
      question: 'What is Socialista, in one sentence?',
      answer:
        'A studio that makes talking-creator UGC, static ads, slideshows, and images, then schedules them to Instagram, TikTok, Facebook, Threads, LinkedIn, and X. It is not an ads manager, not a community inbox, and not a public API.',
    },
    {
      question: 'Which of these is the closest alternative?',
      answer:
        'For talking UGC, Arcads, MakeUGC, and Creatify. For posting what you already made, Buffer. For template volume plus a calendar, Predis.ai. For paid-social research, Superscale or AdCreative.ai. For a digital twin and translation, HeyGen. None of them is a full substitute for make-then-post in one workspace.',
    },
    {
      question: 'Does Socialista replace Buffer?',
      answer:
        'Not if you need a community inbox, Google Business Profile, or a scheduler for creatives you already finished elsewhere. Socialista is the better fit when the file does not exist yet and the next step is an organic post on accounts you connect.',
    },
    {
      question: 'Why are some prices “not listed”?',
      answer:
        'Because the vendor did not publish them on the page we checked. Arcads is the example. We would rather leave the cell empty than repeat a number from another website.',
    },
    {
      question: 'When was this checked?',
      answer:
        'October 2, 2026. Each comparison names the source URL. If a pricing page moved, treat that page as the live source.',
    },
  ],
} as const

export type CompareCompetitor = {
  slug: string
  name: string
  lane: CompareLaneId
  /** Short tag on the hub card. */
  category: string
  /** One line on the hub card. */
  summary: string
  metaTitle: string
  metaDescription: string
  title: string
  titleAccent: string
  /** One sentence under the page title. */
  difference: string
  overview: readonly string[]
  /** Two or three sentences under the verdict heading. */
  verdict: string
  bestForSocialista: readonly string[]
  bestForThem: readonly string[]
  howWeWork: readonly string[]
  howTheyWork: readonly string[]
  weWinOn: readonly string[]
  theyWinOn: readonly string[]
  scenarios: readonly CompareScenario[]
  stats: readonly CompareStat[]
  cells: Record<CompareFeatureId, CompareCell>
  notes?: Partial<Record<CompareFeatureId, string>>
  pricing: {
    summary: string
    short: string
    sourceLabel: string
    sourceUrl: string
    plans?: readonly ComparePlan[]
  }
  sources: readonly CompareSource[]
  faqs: readonly CompareFaq[]
  relatedFeatureSlugs: readonly string[]
}

const ARCADS_FEATURES = 'https://www.arcads.ai/features/ai-ugc-video'
const MAKEUGC_PRICING = 'https://makeugc.ai/pricing'
const BUFFER_PRICING = 'https://buffer.com/pricing'
const SUPERSCALE_PRICING = 'https://superscale.ai/pricing'
const HEYGEN_PRICING = 'https://www.heygen.com/pricing'
const HEYGEN_FAQ = 'https://www.heygen.com/faq'
const CREATIFY_PRICING = 'https://creatify.ai/pricing'
const CREATIFY_URL = 'https://creatify.ai/features/url-to-video'
const PREDIS_PRICING = 'https://predis.ai/pricing/'
const PREDIS_FEATURES = 'https://predis.ai/ai-for-social-media/'
const ADCREATIVE_HOME = 'https://www.adcreative.ai/'

export const COMPARE_COMPETITORS = [
  {
    slug: 'arcads',
    name: 'Arcads',
    lane: 'make',
    category: 'UGC ad studio',
    summary: 'Talking-actor UGC with 1,000+ AI actors. Public price is not on their site.',
    metaTitle: 'Socialista vs Arcads — AI UGC ads compared',
    metaDescription:
      'Arcads is a talking-actor UGC studio with 1,000+ AI actors. Socialista makes the ad and posts it to Instagram, TikTok, and more. Facts checked October 2, 2026.',
    title: 'Arcads for the actor.',
    titleAccent: 'Socialista for the post.',
    difference:
      'Arcads is built around a large talking-actor library. Socialista makes the UGC, then schedules it to accounts you connect.',
    overview: [
      'Arcads is a UGC ad studio. The job it advertises is a talking actor: pick from 1,000+ AI people, steer emotion, add B-roll and captions, and translate into more than 30 languages. You can also create your own AI avatar. That is a strong product if the clip is the whole deliverable.',
      'Socialista starts one step later in the week. You still pick or own a creator, and you can put the product in the frame. Then the same studio writes a caption, queues the post, and publishes to Instagram, TikTok, Facebook, Threads, LinkedIn, and X. Arcads’ public feature page does not describe that posting step. Their pricing page was unavailable when we checked, so this comparison does not invent a number.',
    ],
    verdict:
      'Pick Arcads when the actor library, emotion control, and translation are the job, and publishing already lives in Buffer, native apps, or an ads manager. Pick Socialista when the next step after the clip is a scheduled organic post, and you want to start without a card.',
    bestForSocialista: [
      'You need the talking UGC and the scheduled post in one workspace.',
      'You want a creator you can reuse on stills and static ads, not only on the clip.',
      'You want to start free and see paid plans at checkout.',
    ],
    bestForThem: [
      'The actor roster is the buying reason: 1,000+ AI people, plus a custom avatar.',
      'You need emotion control and translation in more than 30 languages.',
      'Someone else already owns scheduling, or you only deliver files.',
    ],
    howWeWork: [
      'Pick a library creator or save one you own. Drop the product on the brief.',
      'Generate the talking UGC, a still, or a slideshow from the same brand context.',
      'Connect channels, write a caption, and queue the week. Read organic analytics beside the posts.',
    ],
    howTheyWork: [
      'Pick an AI actor from a large library, or create an avatar.',
      'Generate a talking-head ad. Add B-roll, music, captions, and transitions.',
      'Translate the result. Export the file into whatever you already use to publish.',
    ],
    weWinOn: [
      'Organic posting and a week calendar',
      'Product, brand, and a creator you reuse',
      'Stills, slideshows, and static ads in the same studio',
      'A free start with no card',
    ],
    theyWinOn: [
      '1,000+ AI actors on the feature page',
      'Emotion control on the performance',
      'Translation in more than 30 languages',
      'A custom AI avatar workflow',
    ],
    scenarios: [
      {
        title: 'You have to post Reels this week, and you do not have a creator booked',
        pick: 'us',
        body: 'Make the talking clip in Socialista and schedule it to Instagram and TikTok from the same tab. Arcads will still leave you with a file to upload.',
      },
      {
        title: 'You already have a scheduler, and you want the widest actor roster',
        pick: 'them',
        body: 'Arcads’ feature page leads with 1,000+ AI actors and emotion control. That is the reason to open it. Socialista’s library is built for reuse inside one workspace, not for that catalog size.',
      },
      {
        title: 'You need the same face on a UGC clip and a static ad',
        pick: 'us',
        body: 'Save the creator in Socialista and bring them onto stills and Meta-style static ads. Arcads’ public page is about the talking-actor video, not a full stills studio.',
      },
    ],
    stats: [
      { value: 'Not listed', label: 'Public price on their site' },
      { value: '1,000+', label: 'AI actors on the feature page' },
      { value: '30+', label: 'Languages for translation' },
      { value: 'Free', label: 'Socialista start, no card' },
    ],
    cells: {
      aiUgc: 'yes',
      creatorLibrary: 'yes',
      customCreator: 'yes',
      productInFrame: 'unpublished',
      staticAds: 'unpublished',
      slideshows: 'unpublished',
      aiImages: 'yes',
      editor: 'yes',
      brandContext: 'unpublished',
      languages: 'yes',
      urlToAd: 'unpublished',
      bulkGenerate: 'unpublished',
      organicPublish: 'unpublished',
      schedule: 'unpublished',
      contentCalendar: 'unpublished',
      analytics: 'unpublished',
      adLauncher: 'unpublished',
      competitorResearch: 'unpublished',
      inbox: 'unpublished',
      freeStart: 'unpublished',
      team: 'partial',
      apiAccess: 'unpublished',
    },
    notes: {
      creatorLibrary: 'Their feature page says 1,000+ AI actors.',
      customCreator: 'You can create your own AI avatar.',
      aiImages: 'Their feature page includes an AI photoshoot from a photo.',
      editor: 'B-roll, music, captions, and transitions.',
      languages: 'Translation in more than 30 languages.',
      team: 'The Create workflow is described for a team. Seat limits are not published.',
    },
    pricing: {
      summary:
        'Not published. arcads.ai/pricing did not list plans on October 2, 2026, so this page does not repeat prices from other sites. Socialista lets you start free, with paid plans at checkout.',
      short: 'Price not published',
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
          'Their public feature page describes talking-actor ads, captions, and translation. It does not say Arcads publishes or schedules organic posts to connected accounts. Socialista does, on Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
      },
      {
        question: 'Does Arcads have a free plan?',
        answer:
          'The pages we checked do not list a free plan or a public trial. Socialista lets you start free, with no card.',
      },
      {
        question: 'How big is the Arcads actor library?',
        answer:
          'The AI UGC feature page says 1,000+ AI actors, and you can create your own avatar. Socialista is built around a reusable creator in your workspace, not around matching that catalog size.',
      },
      {
        question: 'Who should pick Arcads over Socialista?',
        answer:
          'Teams that already have a place to publish, and who are buying a large actor library, emotion control, and translation in more than 30 languages. If the clip still has to become a scheduled post, use Socialista.',
      },
      {
        question: 'Does Socialista translate as widely as Arcads?',
        answer:
          'No. Socialista currently covers 13 languages for UGC voice and about 20 for ad copy. Arcads’ feature page lists translation in more than 30 languages. If language coverage is the buying reason, Arcads is the closer fit.',
      },
    ],
    relatedFeatureSlugs: ['ai-ugc-video', 'ai-influencers', 'social-scheduling'],
  },
  {
    slug: 'makeugc',
    name: 'MakeUGC',
    lane: 'make',
    category: 'UGC generator',
    summary: 'AI UGC and image models sold as monthly credits, from $59 a month.',
    metaTitle: 'Socialista vs MakeUGC — UGC credits compared',
    metaDescription:
      'MakeUGC sells UGC and image credits from $59 a month. Socialista generates the creative and publishes it. Startup is 500 credits; unused credits do not roll over.',
    title: 'Credits for a file.',
    titleAccent: 'A studio for the post.',
    difference:
      'MakeUGC sells generation credits for AI UGC and images. Socialista generates the creative, then publishes it to connected accounts.',
    overview: [
      'MakeUGC is a generation counter. You pick models, spend credits, and export the file. Startup is $59 a month for 500 credits. Growth is $79 for 1,000. Pro is $149 for 2,000. Unused credits do not roll over. A $1 introductory offer is advertised — it is not a free plan. API access is a separate plan from $99 a month.',
      'That is a clean product if you already have a place to post, or if you are wiring generation into your own stack. Socialista is a worse API and a better week: the UGC, the still, the slideshow, then a scheduled post on Instagram, TikTok, Facebook, Threads, LinkedIn, and X, with a free start and no card.',
    ],
    verdict:
      'MakeUGC is the better pick when you want a model lineup, monthly credits, and an API, and you will publish the file yourself. Socialista is the better pick when the file still has to become a scheduled post, and you do not want to start on a $59 plan.',
    bestForSocialista: [
      'You want the video, the still, and the post in one workspace.',
      'You want to start free, not on a $1 intro or a $59 plan.',
      'You do not need a public API. You need Thursday’s Reel to go out.',
    ],
    bestForThem: [
      'You are buying credits and a model list, not a publisher.',
      'You want the separate API plan, from $99 a month.',
      'Someone else already owns scheduling and analytics.',
    ],
    howWeWork: [
      'Start free. Pick a creator, add the product, generate the UGC or still.',
      'Remix a clip when you need a variant. Queue the post on connected accounts.',
      'Read organic analytics on those accounts. Upgrade when credits and seats run out.',
    ],
    howTheyWork: [
      'Choose a plan. Credits refresh each cycle and do not roll over.',
      'Pick models, generate UGC or images, export the file.',
      'If you need an API, buy that plan separately from $99 a month.',
    ],
    weWinOn: [
      'A free start with no card',
      'Organic posting and a calendar',
      'Brand and product context in the workspace',
      'UGC, stills, and slideshows together',
    ],
    theyWinOn: [
      'A public API from $99 a month',
      'A credit ladder you can map to volume',
      'Image models listed on the pricing page',
      'A product shaped for teams who only generate',
    ],
    scenarios: [
      {
        title: 'You generate ads for clients and publish in their tools',
        pick: 'them',
        body: 'MakeUGC’s job is the file. An API plan exists if you want generation inside your own stack. Socialista’s publisher is for accounts you connect yourself.',
      },
      {
        title: 'You are a founder who still has to post this week',
        pick: 'us',
        body: 'Start in Socialista without a card, make the talking clip, and schedule it. MakeUGC’s public pricing starts at $59 a month and does not describe posting.',
      },
      {
        title: 'You burn through variations and need a documented credit ladder',
        pick: 'them',
        body: '500 / 1,000 / 2,000 credits a month is easy to budget. Socialista shows credits on the live plan card at checkout, and remix exists, but there is no generate-N control on our public pages.',
      },
    ],
    stats: [
      { value: '$59/mo', label: 'Startup · 500 credits' },
      { value: '$149/mo', label: 'Pro · 2,000 credits' },
      { value: '$1 intro', label: 'Not a free plan' },
      { value: '$99/mo', label: 'API plan, sold separately' },
    ],
    cells: {
      aiUgc: 'yes',
      creatorLibrary: 'yes',
      customCreator: 'unpublished',
      productInFrame: 'unpublished',
      staticAds: 'unpublished',
      slideshows: 'unpublished',
      aiImages: 'partial',
      editor: 'unpublished',
      brandContext: 'unpublished',
      languages: 'unpublished',
      urlToAd: 'unpublished',
      bulkGenerate: 'unpublished',
      organicPublish: 'unpublished',
      schedule: 'unpublished',
      contentCalendar: 'unpublished',
      analytics: 'unpublished',
      adLauncher: 'unpublished',
      competitorResearch: 'unpublished',
      inbox: 'unpublished',
      freeStart: 'partial',
      team: 'unpublished',
      apiAccess: 'yes',
    },
    notes: {
      creatorLibrary:
        'The product is built around AI creators. A public avatar count is not on the pricing page.',
      aiImages: 'Image models are listed on the pricing page. It does not say every plan includes them.',
      freeStart: 'A $1 introductory offer is advertised. It is not a free plan.',
      apiAccess: 'API access is a separate plan from $99 a month.',
    },
    pricing: {
      summary:
        'Startup is $59 a month for 500 credits. Growth is $79 for 1,000. Pro is $149 for 2,000. API access is a separate plan from $99 a month. Unused credits do not roll over. The $1 intro offer is not a free plan.',
      short: 'From $59/mo · $1 intro offer',
      sourceLabel: 'MakeUGC pricing',
      sourceUrl: MAKEUGC_PRICING,
      plans: [
        { name: 'Intro', price: '$1', detail: 'Introductory offer. Not an ongoing free plan.' },
        { name: 'Startup', price: '$59/mo', detail: '500 credits. Unused credits do not roll over.' },
        { name: 'Growth', price: '$79/mo', detail: '1,000 credits per cycle.' },
        { name: 'Pro', price: '$149/mo', detail: '2,000 credits per cycle.' },
        { name: 'API', price: 'From $99/mo', detail: 'Sold separately from the app plans.' },
      ],
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
          'The pricing page does not say. A third-party review from August 2026 said product-in-hand starts on Pro. Treat that as a report, not as MakeUGC’s own claim. Socialista includes product-in-frame in the UGC studio.',
      },
      {
        question: 'Can MakeUGC schedule the post?',
        answer:
          'The pricing page describes video generation, image models, and credits. It does not describe posting or scheduling to Instagram, TikTok, or the other channels Socialista connects.',
      },
      {
        question: 'Does MakeUGC have a public API?',
        answer:
          'Yes. API access is a separate plan from $99 a month. Socialista does not publish a public API. If you need generation inside your own software, MakeUGC is the closer fit.',
      },
      {
        question: 'Does MakeUGC have a free plan?',
        answer:
          'No ongoing free plan is listed. A $1 introductory offer is advertised. Socialista lets you start free, with no card.',
      },
      {
        question: 'Do unused MakeUGC credits roll over?',
        answer:
          'No. The pricing page says unused credits do not roll over. Socialista credits reset each billing period on paid plans, as shown at checkout.',
      },
    ],
    relatedFeatureSlugs: ['ai-ugc-video', 'ai-images', 'social-scheduling'],
  },
  {
    slug: 'buffer',
    name: 'Buffer',
    lane: 'post',
    category: 'Scheduler',
    summary: 'Schedule, measure, and reply. It does not generate the UGC, stills, or slideshows.',
    metaTitle: 'Socialista vs Buffer — create and post, or just post',
    metaDescription:
      'Buffer schedules and measures social posts from $0, then $6 per channel. Socialista makes the UGC, stills, and slideshows, then publishes them. Compared October 2026.',
    title: 'Buffer for the queue.',
    titleAccent: 'Socialista for the creative.',
    difference:
      'Buffer publishes and measures social posts. Socialista makes the UGC, stills, and slideshows, then publishes them.',
    overview: [
      'Buffer is a publishing suite. The free plan covers 3 channels and 10 scheduled posts per channel. Essentials starts at $6 per channel per month. Team starts at $12. You get a calendar, analytics (30 days of history on free, unlimited on paid), and a community inbox on paid plans. An AI assistant helps with copy. It does not generate UGC video, static ads, slideshows, or AI creators. Buffer last updated these prices in November 2025.',
      'If the creative is already done — a shoot, a designer, another AI tool — Buffer is the obvious place to queue it. Socialista is the other shape: make the talking clip or the still in the same workspace that will post it. We do not have a community inbox. Replies stay in the native apps. That is a real gap if engagement is half the job.',
    ],
    verdict:
      'Buffer wins when the creative is already done and you need a scheduler, analytics, and a community inbox. Socialista wins when you still have to make the UGC, the static ad, or the slideshow before anything can go out.',
    bestForSocialista: [
      'The file does not exist yet. You still need a talking creator or a still.',
      'You want one workspace for brand, product, generation, and the week calendar.',
      'You post to Instagram, TikTok, Facebook, Threads, LinkedIn, and X, and you can live without an inbox.',
    ],
    bestForThem: [
      'The creative already exists. You need a queue, not a studio.',
      'You need a community inbox for comments and replies.',
      'You want per-channel pricing you can grow one profile at a time.',
    ],
    howWeWork: [
      'Generate the UGC, still, or slideshow from a saved creator and product.',
      'Write a caption per connected account. Queue the week.',
      'Read organic reach and engagement beside those posts.',
    ],
    howTheyWork: [
      'Connect channels. The free plan includes 3.',
      'Drop in posts you already made. Schedule them on a calendar.',
      'Reply from the inbox on paid plans. Read analytics — 30 days on free, unlimited on paid.',
    ],
    weWinOn: [
      'Talking UGC, stills, slideshows, static ads',
      'A creator and product library',
      'Make-then-post in one tab',
      'Threads, in the same publisher as the rest',
    ],
    theyWinOn: [
      'A community inbox on paid plans',
      'Per-channel pricing from $6',
      'A mature calendar and queue',
      'Analytics history, unlimited on paid',
    ],
    scenarios: [
      {
        title: 'You already shoot or design everything, and you need a queue',
        pick: 'them',
        body: 'Buffer is the product for that week. Socialista would be an extra studio you do not need.',
      },
      {
        title: 'You have nothing to schedule because nothing is made',
        pick: 'us',
        body: 'A calendar of empty slots is not the bottleneck. Socialista makes the talking clip or the still, then fills the week.',
      },
      {
        title: 'You spend the afternoon in comments and DMs',
        pick: 'them',
        body: 'Buffer’s inbox is a reason to pay. Socialista does not have one. Keep Buffer, or keep the native apps, for replies.',
      },
    ],
    stats: [
      { value: 'Free', label: '3 channels, 10 posts each' },
      { value: '$6', label: 'Per channel / month on Essentials' },
      { value: '$12', label: 'Per channel / month on Team' },
      { value: 'Inbox', label: 'Community replies on paid plans' },
    ],
    cells: {
      aiUgc: 'no',
      creatorLibrary: 'no',
      customCreator: 'no',
      productInFrame: 'no',
      staticAds: 'no',
      slideshows: 'no',
      aiImages: 'no',
      editor: 'no',
      brandContext: 'no',
      languages: 'unpublished',
      urlToAd: 'no',
      bulkGenerate: 'no',
      organicPublish: 'yes',
      schedule: 'yes',
      contentCalendar: 'yes',
      analytics: 'yes',
      adLauncher: 'no',
      competitorResearch: 'no',
      inbox: 'yes',
      freeStart: 'yes',
      team: 'yes',
      apiAccess: 'unpublished',
    },
    notes: {
      slideshows: 'Buffer can schedule posts you already made. It does not generate slideshows.',
      aiImages: 'The AI assistant writes and rewrites copy. It does not generate images.',
      brandContext:
        'Buffer stores channels and copy. It does not learn a brand or product library for generation.',
      contentCalendar: 'A calendar of scheduled posts is the product.',
      organicPublish: 'Publishing is the product. The free plan includes 3 channels.',
      analytics: 'Free includes 30 days of history. Paid plans include unlimited history.',
      freeStart: 'Free covers 3 channels and 10 scheduled posts per channel.',
      team: 'The Team plan includes unlimited users. Essentials is one user.',
    },
    pricing: {
      summary:
        'Free for 3 channels and 10 scheduled posts per channel. Essentials starts at $6 per channel per month. Team starts at $12 per channel per month. The per-channel rate drops after 10 channels. Buffer last updated these prices in November 2025.',
      short: 'Free · from $6 per channel / mo',
      sourceLabel: 'Buffer pricing',
      sourceUrl: BUFFER_PRICING,
      plans: [
        { name: 'Free', price: '$0', detail: '3 channels. 10 scheduled posts per channel. 30 days of analytics.' },
        { name: 'Essentials', price: 'From $6 / channel', detail: 'One user. Unlimited analytics history. Inbox.' },
        { name: 'Team', price: 'From $12 / channel', detail: 'Unlimited users. Inbox and collaboration.' },
      ],
    },
    sources: [{ label: 'Buffer pricing', url: BUFFER_PRICING }],
    faqs: [
      {
        question: 'Does Buffer make UGC ads?',
        answer:
          'No. Buffer is a publishing, analytics, and engagement suite. It includes an AI assistant for writing. It does not generate UGC video, static ads, slideshows, or AI creators. That is the Socialista studio.',
      },
      {
        question: 'How does Buffer pricing work?',
        answer:
          'You pay per channel. The free plan covers 3 channels. Essentials starts at $6 per channel per month, and Team starts at $12. The per-channel rate drops after 10 channels. Buffer says these prices were last updated in November 2025.',
      },
      {
        question: 'Does Buffer have a content calendar?',
        answer:
          'Yes. Scheduling and a calendar of queued posts are the product. Socialista also has a week calendar, after you generate the creative in the same studio.',
      },
      {
        question: 'Does Socialista have a community inbox?',
        answer:
          'No. That is a Buffer strength on paid plans. Socialista publishes and measures organic posts. Replies stay in Instagram, TikTok, and the other native apps.',
      },
      {
        question: 'Can I use both?',
        answer:
          'Yes. Some teams generate in Socialista, export, and still queue extra channels in Buffer. If the channels Socialista connects are the whole mix, you can stay in one studio.',
      },
      {
        question: 'When is Buffer the better choice?',
        answer:
          'When the creative is already done and you need a community inbox plus scheduling across many channels, with per-channel pricing. When you still need to make the ad, Socialista covers creation and posting.',
      },
    ],
    relatedFeatureSlugs: ['social-scheduling', 'social-analytics', 'ai-ugc-video'],
  },
  {
    slug: 'superscale',
    name: 'Superscale',
    lane: 'paid',
    category: 'Paid social agent',
    summary: 'An ad agent for competitor research and creatives, from $99 a month after a trial.',
    metaTitle: 'Socialista vs Superscale — organic studio or paid-social agent',
    metaDescription:
      'Superscale researches competitor ads and generates paid-social creatives from $99 a month. Socialista makes organic UGC and posts it. Compared October 2, 2026.',
    title: 'Superscale for paid social.',
    titleAccent: 'Socialista for the profile.',
    difference:
      'Superscale researches ads and generates creatives for paid social. Socialista generates the creative and posts it to your organic channels.',
    overview: [
      'Superscale is an agent for paid social. The pricing page describes speaking AI UGC, product demos, static ads, and competitor analysis. You connect a Meta Ads account to study campaigns and generate new ones. Plans start at $99 a month after trial credits and a 5-day trial. There is no ongoing free plan. TikTok and Google ad accounts are not stated on that pricing page.',
      'Socialista does not connect to an ads manager and does not scrape competitor ads. The destination is a connected profile: make the talking UGC or the still, schedule it, read organic analytics. If your week is “what are competitors running, then launch a campaign,” Superscale is the closer tool. If your week is “we still have to post to the grid,” it is not.',
    ],
    verdict:
      'Superscale is built around competitor ads and a Meta Ads account. Socialista is built around making the creative and posting it to your own organic channels. They solve different next steps — use both only if you run paid and organic as separate motions.',
    bestForSocialista: [
      'The destination is Instagram, TikTok, or another connected profile, not an ad set.',
      'You want to start free and make talking UGC with a creator you own.',
      'You do not need a competitor ad scanner to brief the next clip.',
    ],
    bestForThem: [
      'You want an agent that studies competitor ads.',
      'You already think in Meta Ads campaigns, not in organic posts.',
      'A 5-day trial into a $99 plan matches how you buy software.',
    ],
    howWeWork: [
      'Create or pick a creator. Put the product in frame. Generate the clip or still.',
      'Schedule to connected organic accounts. No ads-manager connection.',
      'Measure reach and engagement on those accounts.',
    ],
    howTheyWork: [
      'Start with trial credits, then a 5-day trial, then a plan from $99 a month.',
      'Connect a Meta Ads account. Analyze competitors and existing campaigns.',
      'Generate speaking UGC, product demos, and static ads aimed at paid social.',
    ],
    weWinOn: [
      'Organic posting to six networks',
      'A free start with no card',
      'A creator you reuse on stills and ads',
      'A calendar for the profile, not the ad account',
    ],
    theyWinOn: [
      'Competitor ad research',
      'A Meta Ads connection for analysis',
      'Product demos and CTA screens as named formats',
      'An agent shaped for paid teams',
    ],
    scenarios: [
      {
        title: 'You need to see what competitors are running before you brief a creator',
        pick: 'them',
        body: 'That scanner is Superscale’s product. Socialista has you bring your own references.',
      },
      {
        title: 'You need three organic posts on the grid this week',
        pick: 'us',
        body: 'Superscale’s pricing page does not describe organic posting. Socialista is the studio that makes the clip and queues it.',
      },
      {
        title: 'You run Meta prospecting and organic as two separate motions',
        pick: 'us',
        body: 'Keep Superscale (or your ads manager) for paid. Use Socialista for the profile. They are not substitutes.',
      },
    ],
    stats: [
      { value: '$99/mo', label: 'Plans start after the trial' },
      { value: '5-day', label: 'Trial after trial credits' },
      { value: 'Meta Ads', label: 'Account connection for analysis' },
      { value: 'No', label: 'Organic posting on the pricing page' },
    ],
    cells: {
      aiUgc: 'yes',
      creatorLibrary: 'yes',
      customCreator: 'unpublished',
      productInFrame: 'yes',
      staticAds: 'yes',
      slideshows: 'unpublished',
      aiImages: 'unpublished',
      editor: 'unpublished',
      brandContext: 'unpublished',
      languages: 'unpublished',
      urlToAd: 'unpublished',
      bulkGenerate: 'unpublished',
      organicPublish: 'unpublished',
      schedule: 'unpublished',
      contentCalendar: 'unpublished',
      analytics: 'unpublished',
      adLauncher: 'partial',
      competitorResearch: 'yes',
      inbox: 'unpublished',
      freeStart: 'partial',
      team: 'unpublished',
      apiAccess: 'unpublished',
    },
    notes: {
      aiUgc: 'Speaking AI UGC with realistic creators, named on the pricing page.',
      productInFrame: 'Product demos and app walkthroughs are listed formats.',
      staticAds: 'Static ads and CTA screens are listed formats.',
      adLauncher:
        'The pricing page describes a Meta Ads connection for analysis and new campaigns. TikTok and Google ad accounts are not stated there.',
      competitorResearch: 'The product analyzes competitors and benchmarks ads.',
      freeStart:
        'New accounts get trial credits and can start a 5-day trial. There is no ongoing free plan on the pricing page.',
    },
    pricing: {
      summary:
        'Plans start at $99 a month, after trial credits and a 5-day trial. There is no ongoing free plan. Older prices quoted in reviews are not repeated here.',
      short: 'From $99/mo · 5-day trial',
      sourceLabel: 'Superscale pricing',
      sourceUrl: SUPERSCALE_PRICING,
      plans: [
        { name: 'Trial', price: 'Credits + 5 days', detail: 'Trial credits, then a 5-day trial. No ongoing free plan.' },
        { name: 'Paid', price: 'From $99/mo', detail: 'Speaking UGC, product demos, static ads, competitor analysis.' },
      ],
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
          'The pricing page does not say it publishes or schedules organic posts. It does describe connecting a Meta Ads account to analyze campaigns and generate creatives. Socialista schedules organic posts, including TikTok.',
      },
      {
        question: 'Does Superscale have a free plan?',
        answer:
          'No ongoing free plan is listed. New accounts get trial credits, then a 5-day trial, then a paid plan. Socialista lets you start free.',
      },
      {
        question: 'Does Socialista research competitor ads?',
        answer:
          'No. That is a Superscale strength. Socialista is an organic studio. Bring your own references, or keep a research tool beside it.',
      },
      {
        question: 'Does Superscale launch TikTok or Google ads?',
        answer:
          'The pricing page we checked describes a Meta Ads connection. TikTok and Google ad accounts are not stated there. Do not assume them from this comparison.',
      },
      {
        question: 'What is Superscale for?',
        answer:
          'Researching competitor ads and producing speaking UGC, product demos, and static ads for paid social. Socialista is the better fit when the next step is an organic post.',
      },
    ],
    relatedFeatureSlugs: ['ai-ugc-video', 'ai-meta-ads', 'social-scheduling'],
  },
  {
    slug: 'heygen',
    name: 'HeyGen',
    lane: 'make',
    category: 'Avatar video',
    summary: 'Avatar video, digital twins, and translation in 175+ languages, with a free plan.',
    metaTitle: 'Socialista vs HeyGen — short social ads or avatar video',
    metaDescription:
      'HeyGen turns scripts into avatar video and translates them in 175+ languages, from a free plan. Socialista makes short social ads and posts them. Compared October 2026.',
    title: 'HeyGen for the avatar.',
    titleAccent: 'Socialista for the ad.',
    difference:
      'HeyGen turns a script into avatar video and translates it. Socialista makes short social creative and posts it.',
    overview: [
      'HeyGen is an avatar platform. Free covers 3 videos a month, up to a minute, with no card. Creator is $29 a month. Pro starts at $49. Business is $149 a month plus $20 per extra seat. The pricing page includes 500+ stock video avatars. Custom video avatars and digital twins sit on paid plans. The FAQ lists 175+ languages. Photo avatars exist. This is a different job from a UGC ad studio with your product in someone’s hand.',
      'Socialista is for short social ads: a photoreal creator, the product in frame, then a scheduled post. We do not offer a digital twin of a real employee, and we do not translate across 175 languages. If the deliverable is a training video, a localized avatar, or a spokesperson who must look like a specific person, HeyGen is the closer tool. If the deliverable is a Reel that has to go out Thursday, it is not.',
    ],
    verdict:
      'HeyGen is the better pick for a digital twin, longer avatar videos, and translation across 175+ languages. Socialista is the better pick for short social ads that then go out on connected accounts.',
    bestForSocialista: [
      'You are making short social ads, not a talking spokesperson for every market.',
      'You need the product in the frame, then a scheduled organic post.',
      'You want one studio for UGC, stills, slideshows, and the calendar.',
    ],
    bestForThem: [
      'You need a digital twin of a real person.',
      'You translate avatar video across 175+ languages.',
      'The video is longer, or it is not a social ad at all.',
    ],
    howWeWork: [
      'Pick or create a social creator. Put the product in the shot.',
      'Generate a short UGC clip, still, or slideshow. Caption it.',
      'Publish to connected accounts from a week calendar.',
    ],
    howTheyWork: [
      'Write a script. Pick a stock avatar or a digital twin.',
      'Generate the video. Translate it. Export.',
      'Post it wherever you already publish. HeyGen’s pages we checked do not describe connected-account posting.',
    ],
    weWinOn: [
      'Product-in-frame UGC for social',
      'Organic posting and a calendar',
      'Stills and slideshows beside the clip',
      'Brand and product context',
    ],
    theyWinOn: [
      '175+ languages in the FAQ',
      'Digital twins and custom avatars',
      '500+ stock video avatars',
      'A free plan with 3 videos a month',
    ],
    scenarios: [
      {
        title: 'You need the CEO’s face in 12 languages for a product video',
        pick: 'them',
        body: 'That is a digital-twin and translation job. HeyGen is built for it. Socialista is not.',
      },
      {
        title: 'You need a product-in-hand Reel on Instagram tomorrow',
        pick: 'us',
        body: 'HeyGen’s pages do not describe product-in-frame UGC ads or connected-account posting. Socialista does both.',
      },
      {
        title: 'You want a free taste of avatar video, three clips a month',
        pick: 'them',
        body: 'HeyGen’s free plan is a real on-ramp. Socialista’s free start is a social studio, not an avatar translator.',
      },
    ],
    stats: [
      { value: 'Free', label: '3 videos a month, no card' },
      { value: '$29/mo', label: 'Creator plan' },
      { value: '175+', label: 'Languages in the HeyGen FAQ' },
      { value: '500+', label: 'Stock video avatars' },
    ],
    cells: {
      aiUgc: 'partial',
      creatorLibrary: 'yes',
      customCreator: 'yes',
      productInFrame: 'unpublished',
      staticAds: 'unpublished',
      slideshows: 'unpublished',
      aiImages: 'partial',
      editor: 'unpublished',
      brandContext: 'unpublished',
      languages: 'yes',
      urlToAd: 'unpublished',
      bulkGenerate: 'unpublished',
      organicPublish: 'unpublished',
      schedule: 'unpublished',
      contentCalendar: 'unpublished',
      analytics: 'unpublished',
      adLauncher: 'unpublished',
      competitorResearch: 'unpublished',
      inbox: 'unpublished',
      freeStart: 'yes',
      team: 'yes',
      apiAccess: 'unpublished',
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
        'Free covers 3 videos a month, up to 1 minute, with no card. Creator is $29 a month. Pro starts at $49 a month. Business is $149 a month plus $20 per extra seat.',
      short: 'Free · from $29/mo',
      sourceLabel: 'HeyGen pricing',
      sourceUrl: HEYGEN_PRICING,
      plans: [
        { name: 'Free', price: '$0', detail: '3 videos a month, up to 1 minute. No card.' },
        { name: 'Creator', price: '$29/mo', detail: 'Stock avatars and higher generation limits.' },
        { name: 'Pro', price: 'From $49/mo', detail: 'More minutes, custom avatars on paid tiers.' },
        { name: 'Business', price: '$149/mo + $20/seat', detail: 'Workspace collaboration. Extra seats billed separately.' },
      ],
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
        question: 'Does HeyGen post to Instagram or TikTok?',
        answer:
          'The pages we checked do not describe connected-account posting or a content calendar. Socialista schedules to Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
      },
      {
        question: 'Does Socialista make digital twins?',
        answer:
          'No. You can create and save a photoreal AI creator, but it is not a twin of a specific employee. HeyGen is the closer product for that.',
      },
      {
        question: 'Who wins on languages?',
        answer:
          'HeyGen. The FAQ lists 175+ languages. Socialista covers 13 for UGC voice and about 20 for ad copy. If localization is the job, HeyGen is the obvious pick.',
      },
      {
        question: 'When should I pick HeyGen?',
        answer:
          'When you need a long-form avatar of a real person and wide translation. When you need a short ad and an organic post together, use Socialista.',
      },
    ],
    relatedFeatureSlugs: ['ai-ugc-video', 'ai-influencers', 'ai-videos'],
  },
  {
    slug: 'creatify',
    name: 'Creatify',
    lane: 'make',
    category: 'URL to video',
    summary: 'Paste a product URL and get a video ad. Free exports include a watermark.',
    metaTitle: 'Socialista vs Creatify — URL-to-video or make-then-post',
    metaDescription:
      'Creatify turns a product URL into a video ad from a free watermarked plan, then $39 a month. Socialista makes the creative and schedules it. Compared October 2026.',
    title: 'Creatify from a URL.',
    titleAccent: 'Socialista from a studio.',
    difference:
      'Creatify turns a product URL into a video ad. Socialista makes the creative and schedules it to connected accounts.',
    overview: [
      'Creatify’s headline move is URL-to-video: paste a product page, get an ad. Free is 10 credits a month, and exports include a watermark. Starter is $39 a month for 100 credits and 300 AI actors. Pro starts at $99 a month for 300 credits, 1,500 actors, 3 custom avatars, a competitor ad tracker, and launching into Meta, TikTok, and AppLovin. Paid plans list 75+ languages. There is a built-in editor. There is no connected-account scheduler or calendar.',
      'Socialista does not scrape a product URL into a finished ad. You still write a brief — the URL can sit on it. What you get instead is a creator you own, the product in frame, watermark-free start, and a week calendar on accounts you connect. If Pro’s ad launcher is the reason you are shopping, Creatify is the closer tool. We do not push into ad accounts.',
    ],
    verdict:
      'Creatify is the stronger URL-to-ad tool, and Pro can launch into Meta, TikTok, and AppLovin. Socialista is the stronger pick when the file still has to be scheduled to accounts you connect, without a watermark on the free start.',
    bestForSocialista: [
      'You want the file scheduled to connected accounts, not only exported.',
      'You do not want a watermark on the free start.',
      'You care more about a reusable creator than about scraping a PDP.',
    ],
    bestForThem: [
      'You want to paste a product URL and get a video ad back.',
      'On Pro, you want to launch into Meta, TikTok, or AppLovin.',
      'You need 75+ languages on paid plans, and a competitor tracker on Pro.',
    ],
    howWeWork: [
      'Save a product and a creator. Generate UGC, stills, or slideshows.',
      'Edit captions in the studio. No watermark on the free start.',
      'Connect accounts and schedule. Paid ads stay in the ads manager.',
    ],
    howTheyWork: [
      'Paste a product URL. Creatify pulls the page and returns a video ad.',
      'Edit in the built-in editor. Free exports carry a watermark.',
      'On Pro, track competitor ads and launch into Meta, TikTok, or AppLovin.',
    ],
    weWinOn: [
      'Organic posting and a week calendar',
      'No watermark on the free start',
      'A creator you own, reused on stills',
      'Brand and product context in the workspace',
    ],
    theyWinOn: [
      'True URL-to-ad',
      'Ad launching on Pro',
      'Competitor ad tracker on Pro',
      '75+ languages on paid plans',
    ],
    scenarios: [
      {
        title: 'You have a PDP and you want a video in one paste',
        pick: 'them',
        body: 'That is Creatify’s feature. Socialista will still ask you for a brief, even if the URL is on it.',
      },
      {
        title: 'You want the ad on your TikTok profile on Thursday, not in Ads Manager',
        pick: 'us',
        body: 'Creatify exports sizes. It does not schedule to connected accounts. Socialista does.',
      },
      {
        title: 'You are testing on a free plan and you cannot ship a watermark',
        pick: 'us',
        body: 'Creatify’s free exports include a watermark. Socialista’s free start does not.',
      },
    ],
    stats: [
      { value: 'Free', label: '10 credits · watermarked export' },
      { value: '$39/mo', label: 'Starter · 100 credits, 300 actors' },
      { value: '$99/mo', label: 'Pro · launcher and competitor tracker' },
      { value: 'URL → ad', label: 'Paste a product page' },
    ],
    cells: {
      aiUgc: 'yes',
      creatorLibrary: 'yes',
      customCreator: 'partial',
      productInFrame: 'yes',
      staticAds: 'yes',
      slideshows: 'unpublished',
      aiImages: 'yes',
      editor: 'yes',
      brandContext: 'unpublished',
      languages: 'yes',
      urlToAd: 'yes',
      bulkGenerate: 'unpublished',
      organicPublish: 'no',
      schedule: 'no',
      contentCalendar: 'no',
      analytics: 'no',
      adLauncher: 'partial',
      competitorResearch: 'partial',
      inbox: 'no',
      freeStart: 'yes',
      team: 'partial',
      apiAccess: 'unpublished',
    },
    notes: {
      creatorLibrary: '300 AI actors on Starter. 1,500 on Pro.',
      customCreator: '3 custom avatars on Pro. Starter does not include them.',
      staticAds: 'The free plan includes image ads. Exports on Free include a watermark.',
      editor: 'A built-in editor for trim, cut, and captions.',
      languages: '75+ languages on paid plans.',
      urlToAd: 'Paste a product URL. Creatify pulls the page and returns a video ad.',
      organicPublish:
        'Export sizes for TikTok, Instagram, Facebook, and YouTube. No connected-account posting.',
      schedule: 'No scheduler for connected accounts.',
      contentCalendar: 'No calendar for connected accounts.',
      adLauncher: 'Meta, TikTok, and AppLovin launching is on Pro, not Starter.',
      competitorResearch: 'The competitor ad tracker is on Pro.',
      freeStart: '10 credits a month. Exports include a watermark.',
      team: 'Starter is 1 seat. Pro includes up to 5 seats, with 2 included.',
    },
    pricing: {
      summary:
        'Free is 10 credits a month, and exports include a watermark. Starter is $39 a month for 100 credits and 300 AI actors. Pro starts at $99 a month for 300 credits, 1,500 actors, custom avatars, the ad launcher, and the competitor tracker.',
      short: 'Free with watermark · from $39/mo',
      sourceLabel: 'Creatify pricing',
      sourceUrl: CREATIFY_PRICING,
      plans: [
        { name: 'Free', price: '$0', detail: '10 credits a month. Watermarked exports.' },
        { name: 'Starter', price: '$39/mo', detail: '100 credits. 300 AI actors. 1 seat.' },
        {
          name: 'Pro',
          price: 'From $99/mo',
          detail: '300 credits. 1,500 actors. 3 custom avatars. Ad launcher. Competitor tracker.',
        },
      ],
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
        question: 'Does Creatify have a content calendar?',
        answer:
          'No. There is no scheduler or calendar for connected accounts. Socialista queues posts on a week calendar after you generate the creative.',
      },
      {
        question: 'Does Socialista turn a product URL into an ad?',
        answer:
          'Not by itself. You can put a URL on the brief. Creatify is the tool that pulls the page and returns a video. That is a real Creatify win.',
      },
      {
        question: 'Is the Creatify free plan usable in production?',
        answer:
          'Exports include a watermark. Fine for testing, not for a live profile. Socialista’s free start does not add a watermark.',
      },
      {
        question: 'What does Creatify do that Socialista does not?',
        answer:
          'Paste a product URL and get a finished video ad. On Pro, it also tracks competitor ads and can launch into Meta, TikTok, and AppLovin. Socialista does not launch into ad accounts.',
      },
    ],
    relatedFeatureSlugs: ['ai-ugc-video', 'ai-meta-ads', 'social-scheduling'],
  },
  {
    slug: 'predis',
    name: 'Predis.ai',
    lane: 'post',
    category: 'AI social suite',
    summary: 'Template Reels, carousels, a brand kit, and a scheduler, from $24 a month billed yearly.',
    metaTitle: 'Socialista vs Predis.ai — talking UGC or template social suite',
    metaDescription:
      'Predis.ai generates branded template posts and can schedule them, from $24 a month yearly. Socialista is a talking-creator UGC studio that also posts. Compared October 2026.',
    title: 'Predis for template volume.',
    titleAccent: 'Socialista for talking UGC.',
    difference:
      'Predis.ai generates branded posts from a brand kit and can schedule them. Socialista generates talking-creator UGC, stills, and slideshows, then posts them.',
    overview: [
      'Predis.ai is closer to an all-in-one social suite. Core is $24 a month when billed yearly ($288), or $32 monthly, for 1,300 credits, 10 social accounts, and 1 brand. Rise is $55 yearly ($79 monthly). Enterprise+ is $212 yearly. Every plan starts with a 3-day trial and takes a card. You get a brand kit (logo, colors, tone), template Reels, Shorts, carousels, a drag-and-drop editor, a calendar, and Facebook/Instagram competitor analysis. Publishing covers Facebook, Instagram, TikTok, LinkedIn, YouTube Shorts, X, and Google Business Profile. Threads is not listed. 18+ languages sit on the pricing page.',
      'The overlap with Socialista is real: both generate, both can schedule. The creative is not the same. Predis is template volume from a brand kit and a media library. Socialista is a photoreal talking creator who can hold the product. If you need Google Business Profile, YouTube Shorts, or competitor analysis on Facebook and Instagram, Predis lists them and we do not. If you need Threads, a free start without a card, and talking UGC, that is us.',
    ],
    verdict:
      'Pick Predis for template volume, a brand kit, and a calendar that includes Google Business Profile. Pick Socialista for photoreal talking UGC with the product in frame, then a scheduled post, without putting a card down to try it.',
    bestForSocialista: [
      'You want a talking AI creator holding your product, not a template Reel from stock media.',
      'You want to start free, with no card.',
      'Threads is in the mix, and Google Business Profile is not.',
    ],
    bestForThem: [
      'You want template Reels, carousels, and a brand kit that posts to many channels.',
      'You need Google Business Profile or YouTube Shorts in the publisher.',
      'Facebook and Instagram competitor analysis is part of the week.',
    ],
    howWeWork: [
      'Create or pick a talking creator. Put the product in frame.',
      'Generate UGC, stills, or slideshows from saved brand and product context.',
      'Schedule to Instagram, TikTok, Facebook, Threads, LinkedIn, and X. No card to start.',
    ],
    howTheyWork: [
      'Set up a brand kit. Start a 3-day trial with a card.',
      'Generate template Reels, Shorts, carousels, and image posts from a one-line brief.',
      'Schedule on a calendar, including Google Business Profile and YouTube Shorts.',
    ],
    weWinOn: [
      'Photoreal talking UGC with product in hand',
      'A free start with no card',
      'Threads in the publisher',
      'A creator you own and reuse',
    ],
    theyWinOn: [
      'Template volume from a brand kit',
      'Google Business Profile and YouTube Shorts',
      'Facebook and Instagram competitor analysis',
      'A listed $24/mo yearly on-ramp',
    ],
    scenarios: [
      {
        title: 'You need 20 on-brand carousels and a calendar this month',
        pick: 'them',
        body: 'Predis is shaped for that volume from a brand kit. Socialista will make stronger talking UGC, but it is not a template factory.',
      },
      {
        title: 'You need a person on camera holding the product',
        pick: 'us',
        body: 'The Predis pages we checked describe template video from stock media, not a talking AI creator with your product in hand. That is the Socialista studio.',
      },
      {
        title: 'You also post to Google Business Profile',
        pick: 'them',
        body: 'Predis lists it. Socialista does not. Keep Predis for GBP, or post that channel natively.',
      },
    ],
    stats: [
      { value: '$24/mo', label: 'Core, billed yearly at $288' },
      { value: '3-day', label: 'Trial with a card on file' },
      { value: '18+', label: 'Languages on the pricing page' },
      { value: 'GBP', label: 'Google Business Profile listed' },
    ],
    cells: {
      aiUgc: 'partial',
      creatorLibrary: 'unpublished',
      customCreator: 'unpublished',
      productInFrame: 'unpublished',
      staticAds: 'yes',
      slideshows: 'yes',
      aiImages: 'yes',
      editor: 'yes',
      brandContext: 'yes',
      languages: 'yes',
      urlToAd: 'unpublished',
      bulkGenerate: 'unpublished',
      organicPublish: 'yes',
      schedule: 'yes',
      contentCalendar: 'yes',
      analytics: 'unpublished',
      adLauncher: 'unpublished',
      competitorResearch: 'yes',
      inbox: 'unpublished',
      freeStart: 'partial',
      team: 'yes',
      apiAccess: 'unpublished',
    },
    notes: {
      aiUgc:
        'Template Reels, Shorts, and video ads from stock media. The pricing page does not describe talking-actor UGC with your product in hand.',
      staticAds: 'Single-image creatives are listed on the pricing page.',
      slideshows: 'Carousel creatives and an editor are listed on the pricing page.',
      editor: 'A drag-and-drop editor for Reels and posts.',
      brandContext: 'A brand holds logo, colors, tone of voice, and key messaging.',
      languages: 'The pricing page says 18+ languages.',
      organicPublish:
        'Facebook, Instagram, TikTok, LinkedIn, YouTube Shorts, X, and Google Business Profile. Threads is not listed.',
      schedule: 'Direct publishing and scheduling are listed on the pricing page.',
      contentCalendar: 'Calendar management is listed on the pricing page.',
      competitorResearch: 'Facebook and Instagram competitor analysis is listed on the pricing page.',
      freeStart: 'Every plan starts with a 3-day trial. A card is taken at signup.',
      team: 'Unlimited team members on Core, Rise, and Enterprise+.',
    },
    pricing: {
      summary:
        'Core is $24 a month when billed yearly ($288), or $32 monthly, for 1,300 credits, 10 social accounts, and 1 brand. Rise is $55 a month yearly ($664) for 3,200 credits, 20 accounts, and up to 4 brands. Enterprise+ is $212 a month yearly ($2,540) for 10,000 credits, 60 accounts, and unlimited brands. Every plan starts with a 3-day trial and takes a card.',
      short: 'From $24/mo yearly · 3-day trial',
      sourceLabel: 'Predis.ai pricing',
      sourceUrl: PREDIS_PRICING,
      plans: [
        { name: 'Core', price: '$24/mo yearly', detail: '1,300 credits. 10 accounts. 1 brand. $32 if billed monthly.' },
        { name: 'Rise', price: '$55/mo yearly', detail: '3,200 credits. 20 accounts. Up to 4 brands. $79 monthly.' },
        {
          name: 'Enterprise+',
          price: '$212/mo yearly',
          detail: '10,000 credits. 60 accounts. Unlimited brands. $249 monthly.',
        },
      ],
    },
    sources: [
      { label: 'Predis.ai pricing', url: PREDIS_PRICING },
      { label: 'Predis.ai for social media', url: PREDIS_FEATURES },
    ],
    faqs: [
      {
        question: 'How much is Predis.ai?',
        answer:
          'On October 2, 2026 the pricing page listed Core at $24 a month billed yearly ($32 monthly), Rise at $55 yearly ($79 monthly), and Enterprise+ at $212 yearly ($249 monthly). Credits are 1,300, 3,200, and 10,000 a month. Every plan starts with a 3-day trial and takes a card.',
      },
      {
        question: 'Does Predis.ai make talking UGC ads?',
        answer:
          'It generates template Reels, Shorts, carousels, and video ads from a one-line brief and a media library. The pages we checked do not describe a talking AI creator holding your product. That is the Socialista studio.',
      },
      {
        question: 'Can Predis.ai schedule the post?',
        answer:
          'Yes. Calendar management and direct publishing are on the pricing page, across Facebook, Instagram, TikTok, LinkedIn, YouTube Shorts, X, and Google Business Profile. Socialista schedules to Instagram, TikTok, Facebook, Threads, LinkedIn, and X after you generate the creative.',
      },
      {
        question: 'Does Predis.ai have a free plan?',
        answer:
          'The pricing page we checked advertises a 3-day trial with a card, not an ongoing free plan. Socialista lets you start free, with no card.',
      },
      {
        question: 'Which publisher covers more networks?',
        answer:
          'Predis lists Google Business Profile and YouTube Shorts, which Socialista does not. Socialista lists Threads, which Predis does not. Facebook, Instagram, TikTok, LinkedIn, and X appear on both.',
      },
      {
        question: 'Can I use Predis for volume and Socialista for hero UGC?',
        answer:
          'Yes. They are not the same creative. Template carousels from a brand kit and a talking product-in-hand clip can live in the same week without being the same tool.',
      },
    ],
    relatedFeatureSlugs: ['ai-ugc-video', 'ai-slideshows', 'social-scheduling'],
  },
  {
    slug: 'adcreative',
    name: 'AdCreative.ai',
    lane: 'paid',
    category: 'Paid ad creatives',
    summary: 'Scored banners, photoshoots, and video ads for paid social, from $39 a month.',
    metaTitle: 'Socialista vs AdCreative.ai — organic UGC or paid-social creatives',
    metaDescription:
      'AdCreative.ai generates scored banners and product photoshoots from $39 a month. Socialista generates talking UGC and schedules organic posts. Compared October 2026.',
    title: 'AdCreative for the ad account.',
    titleAccent: 'Socialista for the profile.',
    difference:
      'AdCreative.ai generates banners, photoshoots, and video ads for paid campaigns. Socialista generates UGC and stills, then posts them to your organic channels.',
    overview: [
      'AdCreative.ai is a paid-social creative engine. Starter is $39 a month for 10 download credits, 1 brand, and 1 user. Professional is $249 for 50 credits, 3 brands, and 10 users. Ultimate is $999 for 100 credits, 25 brands, and 20 users. Generation is unlimited; a credit is used when you download. Quarterly billing is 25% off. Yearly is 50% off. Instant Ads scans a webpage. Competitor Insights AI is on Starter. Ad platform integrations are listed on every plan. A trial includes 10 creative credits. There is no ongoing free plan. A digital asset management API sits on Enterprise.',
      'The homepage describes UGC-style video from a product image. It does not describe picking or owning an AI creator. Organic connected-account posting is not described either. Socialista is the other destination: a talking creator, the product in frame, a scheduled post. We do not score ads, scan competitor libraries, or push into Meta and Google. If the file’s job is a campaign, AdCreative is the closer tool. If the file’s job is the grid, it is not.',
    ],
    verdict:
      'Use AdCreative when the destination is an ad account: scored banners, photoshoots, URL scan, competitor insights. Use Socialista when the destination is a connected profile: talking UGC, then a scheduled organic post.',
    bestForSocialista: [
      'You want talking UGC and a scheduled organic post, not a scored banner.',
      'You want a creator you pick or own, reused on stills.',
      'You want to start free, not on a download-credit trial.',
    ],
    bestForThem: [
      'You want scored banners and platform-sized creatives for Meta and Google.',
      'You want to scan a URL and download variations that score well.',
      'Competitor Insights AI is part of how you brief ads.',
    ],
    howWeWork: [
      'Pick a creator. Add the product. Generate talking UGC or a still.',
      'Schedule to connected organic accounts. No download-credit meter.',
      'Read organic analytics. Paid campaigns stay in the ads manager.',
    ],
    howTheyWork: [
      'Import brand. Scan a webpage or start from a product photo.',
      'Generate banners, photoshoots, and UGC-style video. Score the variants.',
      'Spend a credit when you download. Launch through listed ad-platform integrations.',
    ],
    weWinOn: [
      'Talking creator UGC you can own',
      'Organic posting and a calendar',
      'A free start with no card',
      'Slideshows and short social video in the same studio',
    ],
    theyWinOn: [
      'Scored ad banners at volume',
      'URL scan into ready-to-launch creatives',
      'Competitor Insights AI on Starter',
      'A DAM API on Enterprise',
    ],
    scenarios: [
      {
        title: 'You need 40 sized banners for a Meta test, scored',
        pick: 'them',
        body: 'That is AdCreative’s engine: generate many, download the ones that score. Socialista does not have a generate-N scorer.',
      },
      {
        title: 'You need a person talking about the product on TikTok',
        pick: 'us',
        body: 'AdCreative’s UGC-style video starts from a product image and does not describe a creator library. Socialista is built around the creator.',
      },
      {
        title: 'You want the asset on the profile this week, not in Ads Manager',
        pick: 'us',
        body: 'Ad platform integrations are not the same as scheduling organic posts. Socialista connects profiles. AdCreative’s homepage does not describe that.',
      },
    ],
    stats: [
      { value: '$39/mo', label: 'Starter · 10 download credits' },
      { value: '$249/mo', label: 'Professional · 50 credits, 10 users' },
      { value: '50% off', label: 'Yearly billing vs monthly' },
      { value: 'URL → ad', label: 'Scan a webpage for creatives' },
    ],
    cells: {
      aiUgc: 'partial',
      creatorLibrary: 'unpublished',
      customCreator: 'unpublished',
      productInFrame: 'yes',
      staticAds: 'yes',
      slideshows: 'unpublished',
      aiImages: 'yes',
      editor: 'unpublished',
      brandContext: 'yes',
      languages: 'unpublished',
      urlToAd: 'yes',
      bulkGenerate: 'yes',
      organicPublish: 'unpublished',
      schedule: 'unpublished',
      contentCalendar: 'unpublished',
      analytics: 'unpublished',
      adLauncher: 'partial',
      competitorResearch: 'yes',
      inbox: 'unpublished',
      freeStart: 'partial',
      team: 'yes',
      apiAccess: 'partial',
    },
    notes: {
      aiUgc:
        'The homepage describes UGC-style video from a product image. It does not describe a creator library you pick or own.',
      productInFrame: 'Product videos and product photography are named on the homepage.',
      staticAds: 'Ad banners and platform-sized creatives are the core product.',
      aiImages: 'Product photoshoots from a simple product photo.',
      brandContext: 'Import logo, colors, fonts, and style in one step.',
      urlToAd: 'Instant Ads scans a webpage and returns ready-to-launch creatives.',
      bulkGenerate: 'Generate multiple ad versions and keep the ones that score well.',
      adLauncher:
        'Ad platform integrations are listed on every plan. Organic connected-account posting is not.',
      competitorResearch: 'Competitor Insights AI is listed on Starter.',
      freeStart: 'A trial with 10 creative credits. Generation is unlimited; a credit is used on download.',
      team: 'Starter is 1 user. Professional is 10. Ultimate is 20.',
      apiAccess: 'A digital asset management API is listed on the Enterprise plan.',
    },
    pricing: {
      summary:
        'Starter is $39 a month for 10 download credits, 1 brand, and 1 user. Professional is $249 a month for 50 credits, 3 brands, and 10 users. Ultimate is $999 a month for 100 credits, 25 brands, and 20 users. Generation is unlimited; a credit is used when you download. Quarterly billing is 25% off. Yearly billing is 50% off. Enterprise is custom and includes a digital asset management API.',
      short: 'From $39/mo · 10 download credits',
      sourceLabel: 'AdCreative.ai',
      sourceUrl: ADCREATIVE_HOME,
      plans: [
        { name: 'Trial', price: '10 credits', detail: 'Credit spent on download. Not an ongoing free plan.' },
        { name: 'Starter', price: '$39/mo', detail: '10 download credits. 1 brand. 1 user. Competitor Insights AI.' },
        { name: 'Professional', price: '$249/mo', detail: '50 credits. 3 brands. 10 users.' },
        { name: 'Ultimate', price: '$999/mo', detail: '100 credits. 25 brands. 20 users. Yearly is 50% off.' },
      ],
    },
    sources: [{ label: 'AdCreative.ai', url: ADCREATIVE_HOME }],
    faqs: [
      {
        question: 'How much is AdCreative.ai?',
        answer:
          'On October 2, 2026 the homepage listed Starter at $39 a month (10 credits, 1 brand, 1 user), Professional at $249 (50 credits, 3 brands, 10 users), and Ultimate at $999 (100 credits, 25 brands, 20 users). A credit is used when you download. Quarterly is 25% off. Yearly is 50% off.',
      },
      {
        question: 'Does AdCreative.ai make talking UGC?',
        answer:
          'The homepage describes UGC-style video from a product image, plus banners and photoshoots. It does not describe picking or owning an AI creator. Socialista is built around a creator, the product in frame, and a scheduled organic post.',
      },
      {
        question: 'Can AdCreative.ai post to Instagram or TikTok?',
        answer:
          'Ad platform integrations are listed on every plan. The homepage does not describe scheduling organic posts to connected profiles. Socialista does.',
      },
      {
        question: 'Does AdCreative.ai have a free plan?',
        answer:
          'The homepage advertises a trial with 10 creative credits, not an ongoing free plan. Socialista lets you start free.',
      },
      {
        question: 'How do download credits work?',
        answer:
          'Generation is unlimited. A credit is used when you download. Starter includes 10 a month. That is a different meter from Socialista’s generation credits, which are listed on the live plan card at checkout.',
      },
      {
        question: 'Does Socialista score ads or scan competitor libraries?',
        answer:
          'No. Those are AdCreative strengths (scores, Instant Ads, Competitor Insights AI). Socialista makes the organic creative and posts it. Keep AdCreative beside it if paid social is a separate motion.',
      },
    ],
    relatedFeatureSlugs: ['ai-meta-ads', 'ai-ugc-video', 'ai-images'],
  },
] as const satisfies readonly CompareCompetitor[]

export type CompareSlug = (typeof COMPARE_COMPETITORS)[number]['slug']

export function getCompareCompetitor(slug: string) {
  return COMPARE_COMPETITORS.find(competitor => competitor.slug === slug)
}

export function comparePath(slug: string) {
  return `/compare/${slug}`
}

export function competitorsInLane(lane: CompareLaneId) {
  return COMPARE_COMPETITORS.filter(competitor => competitor.lane === lane)
}

export function getCompareFeature(id: CompareFeatureId) {
  return COMPARE_FEATURES.find(feature => feature.id === id)
}

export function otherCompareCompetitors(slug: string, limit = 4) {
  const index = COMPARE_COMPETITORS.findIndex(competitor => competitor.slug === slug)
  if (index < 0) return COMPARE_COMPETITORS.slice(0, limit)
  return [...COMPARE_COMPETITORS.slice(index + 1), ...COMPARE_COMPETITORS.slice(0, index)].slice(
    0,
    limit,
  )
}

export function countCompareCells(cells: readonly CompareCell[]) {
  let yes = 0
  let partial = 0
  for (const cell of cells) {
    if (cell === 'yes') yes += 1
    else if (cell === 'partial') partial += 1
  }
  return { yes, partial }
}

export const COMPARE_DETAIL_TOC = [
  { id: 'overview', label: 'The difference' },
  { id: 'fit', label: 'Who should pick which' },
  { id: 'how', label: 'How each works' },
  { id: 'scenarios', label: 'Example weeks' },
  { id: 'features', label: 'Feature table' },
  { id: 'pricing', label: 'Price' },
  { id: 'verdict', label: 'Verdict' },
  { id: 'faq', label: 'Questions' },
] as const
