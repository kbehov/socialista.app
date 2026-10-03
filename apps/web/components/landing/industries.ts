/** Industry pages. Claims match shipped studio features only. */

import type { FeatureMediaId, FeatureSlug } from './features'

export const INDUSTRIES_PAGE = {
  metaTitle: 'Socialista for ecommerce, apps, SaaS, agencies, and founders',
  metaDescription:
    'Playbooks for Shopify stores, mobile apps, SaaS, dropshipping, agencies, creators, and founders. Make UGC, stills, and slideshows, then schedule the post.',
  eyebrow: 'Industries',
  title: 'The same studio.',
  titleAccent: 'A different week.',
  description:
    'Seven playbooks for the work you actually ship — a store, an app, a SaaS launch, a product test, a client roster, a creator calendar, or the first ads with no hire.',
  intro: [
    'Socialista is where the post gets made and where it gets queued. AI creators, UGC, slideshows, static ads, images, and short video share one workspace. Scheduling covers Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
    'These pages are not generic solutions. Each one is the week that industry actually has: a new SKU, a feature drop, a listing to test, a client brand, or a day you cannot film. Pick the lane that matches. The tools stay the same.',
  ],
  sharedTitle: 'Every playbook uses',
  sharedTitleAccent: 'the same three moves.',
  sharedDescription:
    'Save the brand once. Make the creative from a product, a screenshot, or a brief. Schedule a caption per channel. That is the studio, aimed at this month’s work.',
  sharedSteps: [
    {
      step: '01',
      title: 'Save the context',
      description: 'Brand, product, or screenshots — so the next generation does not start from a blank prompt.',
    },
    {
      step: '02',
      title: 'Make the creative',
      description: 'UGC, a static ad, a slideshow, or a captioned clip. Edit the hook before it leaves the studio.',
    },
    {
      step: '03',
      title: 'Put it on the calendar',
      description: 'A caption per connected account, then reach and engagement after you publish.',
    },
  ],
} as const

export const INDUSTRY_START_HERE = [
  {
    slug: 'ecommerce',
    note: 'A product URL and a feed that should keep selling after launch week.',
  },
  {
    slug: 'saas',
    note: 'A talking clip and a LinkedIn post, without a founder film day.',
  },
  {
    slug: 'agencies',
    note: 'Several client brands, one team, one calendar.',
  },
  {
    slug: 'founders',
    note: 'First ads, no hire, free to start.',
  },
] as const

export type IndustryStep = {
  step: string
  title: string
  description: string
}

export type IndustryUse = {
  title: string
  description: string
}

export type IndustryFormat = {
  title: string
  description: string
}

export type IndustryProof = {
  value: string
  label: string
}

export type IndustryFaq = {
  question: string
  answer: string
}

export type IndustryProse = {
  id: string
  toc: string
  heading: string
  paragraphs: readonly string[]
}

export type IndustryNudge = {
  title: string
  body: string
}

export type IndustryWeekDay = {
  day: string
  title: string
  description: string
}

export type Industry = {
  slug: string
  /** Footer and hub card label. */
  name: string
  /** Hub card. */
  summary: string
  /** Hub card and detail kicker: who this page is for. */
  audience: string
  /** Absolute document title. Includes the brand; `createMetadata` does not append it. */
  metaTitle: string
  metaDescription: string
  media: FeatureMediaId
  title: string
  titleAccent: string
  description: string
  /** Opening essay. The problem in their language. */
  essay: IndustryProse
  /** Longer sections after the essay. */
  guide: readonly IndustryProse[]
  /** Why this industry should pick Socialista over the usual workaround. */
  why: readonly IndustryUse[]
  /** Concrete walkthrough. Illustrative, not a customer story. */
  example: IndustryProse
  week: readonly IndustryWeekDay[]
  nudge: IndustryNudge
  painPoints: readonly IndustryUse[]
  uses: readonly IndustryUse[]
  formats: readonly IndustryFormat[]
  steps: readonly IndustryStep[]
  proof: readonly IndustryProof[]
  limitsHeading: string
  limits: readonly IndustryUse[]
  /** Curated cross-links. Slugs must exist in `FEATURES`. */
  relatedFeatureSlugs: readonly FeatureSlug[]
  faqs: readonly IndustryFaq[]
}

export const INDUSTRIES = [
  {
    slug: 'ecommerce',
    name: 'Shopify & E-commerce',
    summary: 'Import a product page, then make the UGC and the static ad.',
    audience: 'Shopify, WooCommerce, and DTC catalogs',
    metaTitle: 'AI UGC ads for Shopify and e-commerce · Socialista',
    metaDescription:
      'Paste a Shopify or WooCommerce product URL, make UGC and static ads from the catalog, and schedule them to Instagram, TikTok, Facebook, and more.',
    media: 'ugc',
    title: 'From the product page',
    titleAccent: 'to the post.',
    description:
      'Paste a Shopify, WooCommerce, or standard product URL. Socialista reads it into your catalog, then you make UGC, static ads, and slideshows and schedule them to the channels that sell.',
    essay: {
      id: 'why',
      toc: 'The quiet week after the drop',
      heading: 'Launch week is covered. Tuesday is empty.',
      paragraphs: [
        'A new colorway, a restock, or a bundle is already on the product page — photos, price, the line that sells it. What is not ready is the clip. You wait on a creator, a sample, and an edit while the SKU sits live and the feed goes quiet.',
        'Stores do not stall because the offer is unclear. They stall because the next post still needs a person holding the bottle. Socialista starts from the page you already published, so the catalog can feed [UGC](/features/ai-ugc-video), a [static ad](/features/ai-meta-ads), and a [slideshow](/features/ai-slideshows) without another shoot.',
      ],
    },
    guide: [
      {
        id: 'from-the-page',
        toc: 'Start from the SKU',
        heading: 'The product page is the brief',
        paragraphs: [
          'Paste the URL. Most Shopify, WooCommerce, and standard product pages extract into the catalog: name, photos, description. You can also add a SKU by hand. That entry is what the studio generates from — not a blank prompt you retype every Thursday.',
          'Keep the brand beside it: name, logo, colors, positioning. The next serum, the next bundle, and the next restock start from the same store, not from whoever remembered the hex codes.',
        ],
      },
      {
        id: 'after-the-drop',
        toc: 'After launch week',
        heading: 'One SKU can carry more than one post',
        paragraphs: [
          'A drop usually gets one hero video. The week after still needs a talking clip, a still with the offer on it, and a short sequence for the how-to. Make those from the same product instead of treating each format as a new production.',
          'Then [schedule](/features/social-scheduling) Instagram, TikTok, Facebook, Threads, LinkedIn, and X with a caption per account. Export the file if you also run it in Ads Manager yourself. Socialista does not send it there.',
        ],
      },
    ],
    why: [
      {
        title: 'No sample shipment to start',
        description:
          'You already photographed the product for the store. Generate the talking clip and the still from that, instead of waiting on a creator to receive a box.',
      },
      {
        title: 'Several creatives from one SKU',
        description:
          'Product-in-hand UGC, a static frame, and a slideshow can come from the same catalog entry in one afternoon — not three separate briefs.',
      },
      {
        title: 'The ad and the calendar in one place',
        description:
          'Finish the hook, write the caption per channel, and queue the post. You are not exporting a file just to rebuild the publish step somewhere else.',
      },
    ],
    example: {
      id: 'practice',
      toc: 'A sample week',
      heading: 'A restock that still needs a feed',
      paragraphs: [
        'You restock the 30ml serum. The product page is current. Monday you paste the URL and the SKU lands in the catalog next to the brand you saved last month. Tuesday you pick a creator and a product-in-hand format, then edit the hook so it is about the restock, not a generic unboxing.',
        'Wednesday you turn the same hero photo into a static ad with the offer in frame, and cut a three-slide how-to for Stories. Thursday you schedule Instagram and TikTok with different captions, and export the still for a campaign you will launch in Ads Manager yourself.',
      ],
    },
    week: [
      {
        day: 'Mon',
        title: 'Import the SKU',
        description: 'Paste the product URL. Name, photos, and description land in the catalog.',
      },
      {
        day: 'Tue',
        title: 'Make the UGC',
        description: 'A creator holds the serum and delivers the restock hook. Edit before it ships.',
      },
      {
        day: 'Wed',
        title: 'Still and slideshow',
        description: 'A static offer frame from the product photo, plus a short how-to sequence.',
      },
      {
        day: 'Thu',
        title: 'Schedule the set',
        description: 'Captions per channel. Queue Instagram and TikTok. Export the still if you buy ads.',
      },
    ],
    nudge: {
      title: 'Import one product',
      body: 'Then make the UGC, the still, and the post from that SKU — not from a blank prompt.',
    },
    painPoints: [
      {
        title: 'A new SKU waits on a shoot',
        description:
          'A colorway, a restock, or a bundle sits in the catalog while you line up a creator, ship a sample, and wait on the edit.',
      },
      {
        title: 'Launch week is covered. The next week is empty.',
        description:
          'The drop gets one video. After that the feed goes quiet until someone has time to film again.',
      },
      {
        title: 'The ad and the calendar live apart',
        description:
          'The creative is a file in one place. The caption, the account, and the publish time are in another.',
      },
    ],
    uses: [
      {
        title: 'The product is already on the page',
        description:
          'Import from the product URL, or add the name, photos, and description by hand. The catalog is what the studio uses for the next clip, still, or slideshow.',
      },
      {
        title: 'UGC and stills from that product',
        description:
          'Start from product-in-hand or unboxing, or turn one product photo into a static ad. The same SKU can carry a talking clip and a still in the same afternoon.',
      },
      {
        title: 'Post it on the channels that sell',
        description:
          'Write a caption per account and schedule to Instagram, TikTok, Facebook, Threads, LinkedIn, and X from the same workspace.',
      },
    ],
    formats: [
      {
        title: 'Product-in-hand UGC',
        description:
          'A creator holds the product and delivers the hook. Use it for a hero SKU, a bundle, or the item you want in the feed this week.',
      },
      {
        title: 'Static ad from the photo',
        description:
          'One frame with the product, a headline, and a call to action, built from the shot you already have on the product page.',
      },
      {
        title: 'Slideshow for the drop',
        description:
          'A short sequence for a launch, a how-to, or a carousel when a talking clip is more than the post needs.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Import the product',
        description: 'Paste the product URL or upload the shot you already have. It lands in the catalog.',
      },
      {
        step: '02',
        title: 'Make the creative',
        description: 'Pick a creator and a format, or start from a static-ad layout. Edit the hook before it ships.',
      },
      {
        step: '03',
        title: 'Schedule the post',
        description: 'Write the caption per channel and queue it on the accounts you connected.',
      },
    ],
    proof: [
      { value: 'Product URL', label: 'Most Shopify, WooCommerce, and standard product pages' },
      { value: 'Same SKU', label: 'UGC, a static ad, and a slideshow from one product' },
      { value: 'Six channels', label: 'Instagram, TikTok, Facebook, Threads, LinkedIn, and X' },
    ],
    limitsHeading: 'What this is not',
    limits: [
      {
        title: 'Not a Shopify app',
        description:
          'You paste a product URL. Socialista does not install on the store, sync orders, or update inventory.',
      },
      {
        title: 'It does not run the ads',
        description:
          'Export vertical video and static frames sized for paid social. Campaigns stay in Ads Manager.',
      },
      {
        title: 'It does not film a physical sample',
        description:
          'You need a product photo or a product page to start from. The UGC and the still are generated around that.',
      },
    ],
    relatedFeatureSlugs: ['ai-ugc-video', 'ai-meta-ads', 'ai-slideshows', 'social-scheduling'],
    faqs: [
      {
        question: 'Is Socialista a Shopify app?',
        answer:
          'No. You paste a product URL and Socialista extracts the page into your catalog. It does not install on the store, sync orders, or update inventory.',
      },
      {
        question: 'Can I launch these as Meta ads?',
        answer:
          'You can export vertical video and static frames sized for paid social. Socialista does not send them into Ads Manager.',
      },
      {
        question: 'Do I need a sample on camera?',
        answer:
          'You need a product photo or a product page to start from. Socialista generates the UGC and the still. It does not film a physical sample.',
      },
      {
        question: 'Can I keep more than one product?',
        answer:
          'Yes. Each import or manual entry lands in the catalog. Later posts start from the product you pick, with the brand saved beside it.',
      },
      {
        question: 'Will the next post match the store?',
        answer:
          'Save the brand once: name, logo, colors, and positioning. Generations after that start from the brand and the product, not from a blank prompt.',
      },
      {
        question: 'What if a product page will not import?',
        answer:
          'Import works with most Shopify, WooCommerce, and standard product pages. If a page blocks extraction, add the name, photos, and description by hand.',
      },
    ],
  },
  {
    slug: 'mobile-apps',
    name: 'Mobile Apps',
    summary: 'Show the app on camera, then post the clip.',
    audience: 'iOS, Android, and product launches',
    metaTitle: 'AI UGC for mobile app launches · Socialista',
    metaDescription:
      'Turn app screenshots into show-your-app UGC, slideshows, and captioned clips. Schedule the launch to TikTok, Instagram, and the rest of your channels.',
    media: 'slideshows',
    title: 'Show the app',
    titleAccent: 'without a film day.',
    description:
      'Start from a show-your-app UGC format, or cut a slideshow and a captioned clip for the launch. Then schedule it to TikTok, Instagram, and the other channels you use.',
    essay: {
      id: 'why',
      toc: 'A demo is not a post',
      heading: 'The screen recording explains. It does not open.',
      paragraphs: [
        'A raw walkthrough shows the taps. On TikTok or Reels it still needs a hook, a face, and a caption someone will read with the sound off. Feature drops outrun that work: the build ships on Tuesday, the post that shows it waits on someone to hold a phone and talk.',
        'The screen is the product. Socialista includes a show-your-app [UGC](/features/ai-ugc-video) format next to product-in-hand, plus [slideshows](/features/ai-slideshows) and [captioned clips](/features/ai-videos) from the screenshots you already captured for the App Store or a changelog.',
      ],
    },
    guide: [
      {
        id: 'screens-in',
        toc: 'Start from screenshots',
        heading: 'You already have the frames',
        paragraphs: [
          'Launch marketing usually has screenshots, a product page, or a short recording. That is the brief. Put the UI in frame with a creator who can talk over it, or step through the flow as a slideshow when a face would compete with the UI.',
          'Save an AI creator if the next feature should look like the same person came back. Save the brand so the colors and the positioning do not get retyped into every prompt.',
        ],
      },
      {
        id: 'channels',
        toc: 'Launch on more than one channel',
        heading: 'The file is only half the job',
        paragraphs: [
          'TikTok, Reels, and a LinkedIn launch note each want their own caption. [Schedule](/features/social-scheduling) all six channels from the same studio — Instagram, TikTok, Facebook, Threads, LinkedIn, and X — instead of recutting the same clip in three tools.',
          'Export if you also run the clip in TikTok Ads or Meta Ads yourself. Socialista does not create those campaigns, and it is not an App Store screenshot generator.',
        ],
      },
    ],
    why: [
      {
        title: 'Built for a screen, not a bottle',
        description:
          'Show-your-app UGC sits next to product-in-hand. You are not forcing a physical-product template onto a UI.',
      },
      {
        title: 'A launch the same week as the build',
        description:
          'Slideshows and captioned clips cover the feature drop when nobody is free to film a talking-head take.',
      },
      {
        title: 'One clip, captions per channel',
        description:
          'Write the TikTok hook and the LinkedIn note separately, then queue both. The recut is a caption, not a new edit.',
      },
    ],
    example: {
      id: 'practice',
      toc: 'A sample week',
      heading: 'A feature drop that still needs a hook',
      paragraphs: [
        'You ship shared playlists on Wednesday. Monday you drop four screenshots into the studio and save the brand if it is not there yet. Tuesday you generate a show-your-app clip: a creator holds the phone, opens with the problem the feature solves, then the UI is in frame.',
        'Wednesday you cut a slideshow of the flow for the people who will not watch a talking clip, add captions in the editor, and schedule TikTok, Instagram, and LinkedIn with a different line on each. Thursday you export the talking clip for a campaign you will launch yourself.',
      ],
    },
    week: [
      {
        day: 'Mon',
        title: 'Add the screens',
        description: 'Screenshots or a product page become the brief the studio generates from.',
      },
      {
        day: 'Tue',
        title: 'Show-your-app UGC',
        description: 'A creator walks through the feature on camera. Edit the hook before export.',
      },
      {
        day: 'Wed',
        title: 'Slideshow of the flow',
        description: 'Step through the UI as a short sequence, with captions for sound-off.',
      },
      {
        day: 'Thu',
        title: 'Post the launch',
        description: 'Schedule TikTok, Instagram, and LinkedIn. Export if you also buy the traffic.',
      },
    ],
    nudge: {
      title: 'Bring the screenshots',
      body: 'Turn the feature drop into a show-your-app clip and a slideshow before the changelog goes stale.',
    },
    painPoints: [
      {
        title: 'The screen recording looks like a demo',
        description:
          'A raw walkthrough explains the taps. It does not open with a hook, a face, or a caption someone will watch on a phone.',
      },
      {
        title: 'Feature drops outrun the content',
        description:
          'The build ships on Tuesday. The post that shows it is still waiting on someone to hold a phone and talk.',
      },
      {
        title: 'The same clip gets recut everywhere',
        description:
          'TikTok, Reels, and a LinkedIn launch note each want their own caption. The file itself is only half the job.',
      },
    ],
    uses: [
      {
        title: 'The screen is the product',
        description:
          'The UGC studio includes a show-your-app format, next to product-in-hand and unboxing. Put the UI in frame from the screenshots you already have.',
      },
      {
        title: 'A launch without a long edit',
        description:
          'Slideshows and captioned short video cover feature drops and “how it works” posts when you do not have a new talking-head take.',
      },
      {
        title: 'Organic posts, ready to export',
        description:
          'Connect the accounts and schedule. Export the file if you also run the clip in TikTok Ads or Meta Ads yourself.',
      },
    ],
    formats: [
      {
        title: 'Show-your-app UGC',
        description:
          'A creator walks through the product on camera. Use it for the launch, a feature drop, or the “why this exists” post.',
      },
      {
        title: 'Slideshow of the flow',
        description:
          'Step through screenshots as a short sequence when the story is the UI, not a person talking over it.',
      },
      {
        title: 'Captioned clip',
        description: 'Add on-screen captions in the editor so the post still reads with the sound off.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Add the app',
        description: 'Use screenshots or a product page as the brief the studio generates from.',
      },
      {
        step: '02',
        title: 'Pick the format',
        description: 'Show-your-app UGC, a slideshow, or a captioned clip. Edit the hook before you export.',
      },
      {
        step: '03',
        title: 'Post the launch',
        description: 'Schedule TikTok, Instagram, Facebook, Threads, LinkedIn, or X, with a caption per account.',
      },
    ],
    proof: [
      { value: 'Show-your-app', label: 'A UGC format built for the screen, not a physical product' },
      { value: 'Screenshots in', label: 'Start from the frames you already captured' },
      { value: 'Six channels', label: 'TikTok and Instagram, plus Facebook, Threads, LinkedIn, and X' },
    ],
    limitsHeading: 'What this is not',
    limits: [
      {
        title: 'It does not tap through your live app',
        description:
          'You bring screenshots or a product page. Socialista generates the UGC, slideshow, or video around that.',
      },
      {
        title: 'Not an App Store screenshot tool',
        description:
          'The studio makes social creative. It does not generate App Store or Play Store preview sets.',
      },
      {
        title: 'Paid campaigns stay in your ads manager',
        description:
          'Export the file and launch it where you already buy traffic. Socialista does not create TikTok or Meta campaigns.',
      },
    ],
    relatedFeatureSlugs: ['ai-ugc-video', 'ai-slideshows', 'ai-videos', 'social-scheduling'],
    faqs: [
      {
        question: 'Does Socialista record my app for me?',
        answer:
          'You bring screenshots or a product page. Socialista generates the UGC, slideshow, or video around that. It does not tap through your live app.',
      },
      {
        question: 'Can I make App Store screenshots here?',
        answer:
          'The studio makes social creative: UGC, stills, slideshows, and short video. It is not an App Store screenshot or preview generator.',
      },
      {
        question: 'Which channels can I post to?',
        answer: 'Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
      },
      {
        question: 'Can the same creator come back for the next feature?',
        answer:
          'Yes. Save an AI creator to the workspace and reuse that face on the next show-your-app clip, still, or ad.',
      },
      {
        question: 'Can I use the clip in paid ads?',
        answer:
          'Export the video or still and launch it in the ads manager you already use. Socialista does not create campaigns inside TikTok Ads or Meta Ads.',
      },
      {
        question: 'What if I already have a screen recording?',
        answer:
          'Bring your own clips. Caption them in the editor, export, and schedule them next to anything you generate.',
      },
    ],
  },
  {
    slug: 'saas',
    name: 'SaaS',
    summary: 'Explain the product and post it the same day.',
    audience: 'B2B and product-led teams',
    metaTitle: 'AI social content for SaaS teams · Socialista',
    metaDescription:
      'Explain a SaaS product with UGC, a static offer, and a LinkedIn or X post from one studio. Save the brand, invite the team, and schedule the week.',
    media: 'ugc',
    title: 'Explain the product',
    titleAccent: 'and post it today.',
    description:
      'A talking creator, a static offer, and a LinkedIn or X post from one studio. Built for a SaaS team that does not keep a film crew on retainer.',
    essay: {
      id: 'why',
      toc: 'The follow-up that never ships',
      heading: 'The announcement is easy. The explanation is not.',
      paragraphs: [
        'A feature thread writes itself. A 20-second clip that actually shows the offer usually waits on a founder with a free afternoon. LinkedIn is loud the week you launch, then quiet — the how-it-works, the objection, the next feature never get made.',
        'Positioning lives in someone’s head. The logo and the offer get retyped into every prompt. Socialista keeps the brand on the workspace, gives you a face for the explanation, and [schedules](/features/social-scheduling) LinkedIn and X next to Instagram, TikTok, Facebook, and Threads.',
      ],
    },
    guide: [
      {
        id: 'a-face',
        toc: 'A reusable explainer',
        heading: 'The same person can come back',
        paragraphs: [
          'Pick an [AI creator](/features/ai-influencers) and a voice, then generate a short [UGC](/features/ai-ugc-video) clip about the offer. Save that persona. The next feature does not need a new stranger on camera.',
          'When a talking clip is too much, a [static offer](/features/ai-meta-ads) keeps the headline and the call to action in one frame. A [slideshow](/features/ai-slideshows) walks the click-path when a monologue would bury the product.',
        ],
      },
      {
        id: 'the-team',
        toc: 'The team, not a founder bottleneck',
        heading: 'Context should outlive the person who wrote it',
        paragraphs: [
          'Save the brand once: name, logo, colors, positioning. Invite teammates. They share products, files, and publishing so the next post does not start from a Slack thread of hex codes.',
          'After you publish, [reach and engagement](/features/social-analytics) show up per connected account. That is organic reporting. It does not replace ads manager numbers.',
        ],
      },
    ],
    why: [
      {
        title: 'An explanation without a founder film day',
        description:
          'A saved creator can talk the offer in a short clip. You still write the hook. You do not wait on a calendar hold.',
      },
      {
        title: 'LinkedIn and X in the same studio',
        description:
          'Schedule the channels SaaS already uses, next to Instagram, TikTok, Facebook, and Threads, with a caption written for each.',
      },
      {
        title: 'The brand stays on the workspace',
        description:
          'Name, logo, colors, and positioning live beside the products. The next teammate does not start from zero.',
      },
    ],
    example: {
      id: 'practice',
      toc: 'A sample week',
      heading: 'A feature that needs more than a changelog',
      paragraphs: [
        'You ship usage-based alerts. Monday you save the brand if it is new, and add a product entry with two dashboard screenshots. Tuesday a saved creator explains the alert in a 20-second clip: who it is for, what happens if you ignore it, where to turn it on.',
        'Wednesday you make a static frame for the offer and a three-slide walkthrough of the setup. Thursday you schedule LinkedIn and X with different copy, Instagram as a Reel, and invite a teammate so next month’s feature is not stuck on your laptop.',
      ],
    },
    week: [
      {
        day: 'Mon',
        title: 'Save the brand',
        description: 'Name, logo, colors, positioning, plus screenshots of the feature.',
      },
      {
        day: 'Tue',
        title: 'Talking-head UGC',
        description: 'A saved creator explains the offer. Edit the hook so it is specific, not generic SaaS.',
      },
      {
        day: 'Wed',
        title: 'Still and walkthrough',
        description: 'A static offer frame and a slideshow of the click-path.',
      },
      {
        day: 'Thu',
        title: 'LinkedIn, X, Reels',
        description: 'A caption per channel. Invite a teammate when the workspace needs a second pair of hands.',
      },
    ],
    nudge: {
      title: 'Explain one feature today',
      body: 'A talking clip, a static offer, and a LinkedIn post from the brand you already saved.',
    },
    painPoints: [
      {
        title: 'The explanation needs a person on camera',
        description:
          'A feature thread is easy. A 20-second clip that actually shows the offer usually waits on a founder with a free afternoon.',
      },
      {
        title: 'LinkedIn goes quiet after launch week',
        description:
          'The announcement ships. The follow-up posts — the how-it-works, the objection, the next feature — never get made.',
      },
      {
        title: 'The product context lives in someone’s head',
        description:
          'Positioning, the logo, and the offer get retyped into every prompt. The next teammate starts from zero.',
      },
    ],
    uses: [
      {
        title: 'A face for the explanation',
        description:
          'Pick an AI creator and a voice, then generate a short UGC clip about the offer. The same persona can come back for the next feature.',
      },
      {
        title: 'An offer that stays in frame',
        description:
          'Static ads keep the headline and the call to action in one frame, from a product shot or a simple brief.',
      },
      {
        title: 'The channels SaaS already uses',
        description:
          'Schedule LinkedIn and X alongside Instagram, TikTok, Facebook, and Threads. See reach and engagement per connected account.',
      },
    ],
    formats: [
      {
        title: 'Talking-head UGC',
        description:
          'A creator explains the offer in a short clip. Reuse the same face when the next feature needs the same person.',
      },
      {
        title: 'Static offer',
        description:
          'Headline, product, and call to action in one frame for the posts that should be read, not watched.',
      },
      {
        title: 'Slideshow walkthrough',
        description: 'A short sequence of the product when a click-path is clearer than a monologue.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Save the brand',
        description: 'Name, logo, colors, and positioning live on the brand so later generations stay consistent.',
      },
      {
        step: '02',
        title: 'Make one explanation',
        description: 'UGC, a static ad, or a slideshow. Caption it in the editor before it leaves the studio.',
      },
      {
        step: '03',
        title: 'Share the workspace',
        description: 'Invite teammates, then schedule the post with a caption per channel.',
      },
    ],
    proof: [
      { value: 'Saved brand', label: 'Name, logo, colors, and positioning stay on the workspace' },
      { value: 'LinkedIn and X', label: 'Scheduled next to Instagram, TikTok, Facebook, and Threads' },
      { value: 'Shared workspace', label: 'Teammates use the same brands, files, and publishing' },
    ],
    limitsHeading: 'What this is not',
    limits: [
      {
        title: 'Not a live product demo recorder',
        description:
          'It makes social creative from a brief, screenshots, or a product page. It does not record a click-through of your app.',
      },
      {
        title: 'Organic analytics, not ads reporting',
        description:
          'Reach and engagement show up per connected account. Socialista does not replace your ads manager.',
      },
      {
        title: 'You still write the offer',
        description:
          'The studio generates the clip and the frame. Positioning and the hook are yours to edit before it ships.',
      },
    ],
    relatedFeatureSlugs: ['ai-ugc-video', 'ai-meta-ads', 'social-scheduling', 'social-analytics'],
    faqs: [
      {
        question: 'Can the whole team work in one place?',
        answer: 'Yes. Invite teammates into the workspace. They share brands, products, files, and publishing.',
      },
      {
        question: 'Does this replace a product demo recording?',
        answer:
          'It makes social creative from a brief, screenshots, or a product page. It does not record a live click-through of your app.',
      },
      {
        question: 'Will it post to LinkedIn?',
        answer: 'Yes. LinkedIn is one of the connected channels, with X, Instagram, TikTok, Facebook, and Threads.',
      },
      {
        question: 'Can I see whether the post reached anyone?',
        answer:
          'Yes. Reach and engagement show up per connected account after you publish. Socialista does not replace your ads manager reporting.',
      },
      {
        question: 'Can I keep the same creator for the next feature?',
        answer: 'Yes. Creators are saved to the workspace. Pick the same persona for the next UGC clip or still.',
      },
      {
        question: 'Do we have to start on a paid plan?',
        answer:
          'No. Start without a credit card. Paid plans show up at checkout when you need more credits, seats, or connected accounts.',
      },
    ],
  },
  {
    slug: 'dropshipping',
    name: 'Dropshipping',
    summary: 'Test a product page with UGC and a static ad.',
    audience: 'Product testers and offer operators',
    metaTitle: 'AI UGC for dropshipping product tests · Socialista',
    metaDescription:
      'Import a product listing, generate a UGC clip and a static ad, and post the test. Export the file if you run paid ads somewhere else.',
    media: 'static-ads',
    title: 'Test the offer',
    titleAccent: 'before you hire a creator.',
    description:
      'Import the product page, generate a UGC clip and a static ad, and post them. You are testing the offer from the listing, without shipping a sample to a freelancer first.',
    essay: {
      id: 'why',
      toc: 'A test should not start with a shipment',
      heading: 'You find a product. Then you wait.',
      paragraphs: [
        'A listing looks like it could work. The usual next step is a sample, a creator, and an edit — days before you learn if the hook is any good. One video is not a test either. You cannot tell whether people responded to the product, the line, or the still.',
        'Socialista starts from the listing. Paste the URL, pull it into the catalog, and make [product-in-hand UGC](/features/ai-ugc-video) plus a [static ad](/features/ai-meta-ads) from the photo on the page. Post the organic test. Export the file if you buy the traffic yourself.',
      ],
    },
    guide: [
      {
        id: 'listing-in',
        toc: 'Start from the listing',
        heading: 'The page is enough to generate from',
        paragraphs: [
          'Most Shopify, WooCommerce, and standard product pages extract. If a page blocks it, type the name, photos, and description. You are not waiting on a box to arrive before the first creative exists.',
          'Make more than one take: a talking clip, a still, a slideshow, a second hook. The test is which version people respond to, not whether you can produce a single file.',
        ],
      },
      {
        id: 'what-moved',
        toc: 'See which post moved',
        heading: 'Organic first, ads when you choose',
        paragraphs: [
          '[Schedule](/features/social-scheduling) the tests, then read [reach and engagement](/features/social-analytics) on the connected accounts. That tells you which post got watched — not which ad set paid back.',
          'When a hook looks worth spending on, export the file and launch it in the ads manager you already use. Socialista does not buy traffic or attribute spend.',
        ],
      },
    ],
    why: [
      {
        title: 'Test before you ship a sample',
        description:
          'Generate from the listing photo instead of waiting on a creator, a package, and an edit to learn if the hook works.',
      },
      {
        title: 'More than one take per product',
        description:
          'A talking clip, a still, and a second hook from the same catalog entry. One video is not a test.',
      },
      {
        title: 'Organic post and ad file from the same brief',
        description:
          'Schedule the organic version. Export the same creative if you run paid ads somewhere else. You are not rebuilding the offer twice.',
      },
    ],
    example: {
      id: 'practice',
      toc: 'A sample week',
      heading: 'Two hooks on one listing',
      paragraphs: [
        'You want to try a posture corrector from a supplier page. Monday you paste the URL and the product lands in the catalog. Tuesday you generate a product-in-hand clip with a pain-first hook, then a second take that leads with the unboxing.',
        'Wednesday you make a static ad from the listing photo with the offer in frame. Thursday you schedule both clips and the still to TikTok and Instagram, then check which post got reach before you spend anything. The winner you export for Ads Manager yourself.',
      ],
    },
    week: [
      {
        day: 'Mon',
        title: 'Import the listing',
        description: 'Product URL in, catalog entry out. Add it by hand if the page will not extract.',
      },
      {
        day: 'Tue',
        title: 'Two UGC hooks',
        description: 'Pain-first and unboxing from the same product. Keep the item in frame.',
      },
      {
        day: 'Wed',
        title: 'Static offer',
        description: 'One frame: product, headline, call to action, from the listing photo.',
      },
      {
        day: 'Thu',
        title: 'Post the test',
        description: 'Schedule organic. Read reach. Export the file if you buy ads.',
      },
    ],
    nudge: {
      title: 'Test the listing this week',
      body: 'A UGC clip and a static ad from the product page, before you hire anyone or ship a sample.',
    },
    painPoints: [
      {
        title: 'A test starts with a shipment',
        description:
          'You find a product worth trying, then wait on a sample, a creator, and an edit before you learn if the hook works.',
      },
      {
        title: 'One video is not a test',
        description:
          'A single clip cannot tell you whether the product, the hook, or the still is what people respond to.',
      },
      {
        title: 'The organic post and the ad file are made twice',
        description:
          'The version you post and the version you want for ads get produced in different tools, from different briefs.',
      },
    ],
    uses: [
      {
        title: 'Start from the listing',
        description:
          'Paste a product URL. Socialista pulls the page into the catalog. Most Shopify, WooCommerce, and standard product pages work. You can also type it in.',
      },
      {
        title: 'Several creatives from one product',
        description:
          'Product-in-hand UGC, an unboxing format, and a static ad from the product photo. Make another version when you want a different hook.',
      },
      {
        title: 'See which post moved',
        description:
          'Schedule the tests, then check reach and engagement on the connected accounts. Export the file if you buy the ads yourself.',
      },
    ],
    formats: [
      {
        title: 'Product-in-hand UGC',
        description:
          'A creator holds the product and sells the hook. Start from the listing photo instead of a sample on a table.',
      },
      {
        title: 'Static ad',
        description: 'One frame for the offer: product, headline, and call to action, from the image on the page.',
      },
      {
        title: 'A second version',
        description:
          'Swap the hook, or pair the clip with a still or a slideshow, so the test is more than a single take.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Import the listing',
        description: 'Product URL in, catalog entry out. Add it by hand if the page will not extract.',
      },
      {
        step: '02',
        title: 'Generate two or three versions',
        description: 'A talking clip, a still, or a slideshow. Keep the product in frame.',
      },
      {
        step: '03',
        title: 'Post the test',
        description: 'Schedule organic posts. Export the file if you run paid ads elsewhere.',
      },
    ],
    proof: [
      { value: 'Listing in', label: 'A product URL becomes a catalog entry' },
      { value: 'More than one take', label: 'UGC, a still, and a slideshow from the same product' },
      { value: 'Export', label: 'Download the file for ads you launch yourself' },
    ],
    limitsHeading: 'What this is not',
    limits: [
      {
        title: 'No human creator, no shipping',
        description:
          'You start from the product page or a photo. Socialista does not arrange a sample or a freelancer.',
      },
      {
        title: 'It does not run Facebook ads',
        description:
          'It makes and schedules organic posts. You export creatives for ads you launch yourself.',
      },
      {
        title: 'Reach is not ROAS',
        description:
          'After you publish, reach and engagement show up on connected accounts. Socialista does not buy traffic or attribute spend.',
      },
    ],
    relatedFeatureSlugs: ['ai-ugc-video', 'ai-meta-ads', 'ai-slideshows', 'social-analytics'],
    faqs: [
      {
        question: 'Do I have to send the product to a creator?',
        answer:
          'No. You start from the product page or a photo. Socialista does not arrange shipping or a human creator.',
      },
      {
        question: 'Can every store URL be imported?',
        answer:
          'Import works with most Shopify, WooCommerce, and standard product pages. If a page blocks extraction, add the product by hand.',
      },
      {
        question: 'Does Socialista run the Facebook ads?',
        answer:
          'No. It makes and schedules organic posts, and you can export creatives for ads you launch yourself.',
      },
      {
        question: 'Can I test more than one product?',
        answer:
          'Yes. Each listing you import sits in the catalog. Pick the product, make the creative, and schedule that test on its own.',
      },
      {
        question: 'How do I know which post did anything?',
        answer:
          'After you publish, reach and engagement show up on the connected accounts. Socialista does not buy traffic or attribute ad spend.',
      },
      {
        question: 'Can I change the hook without starting over?',
        answer:
          'Yes. Make another version of the same product: a new hook on the clip, a static frame, or a slideshow.',
      },
    ],
  },
  {
    slug: 'agencies',
    name: 'Marketing Agencies',
    summary: 'Shared brands, a team workspace, and posting per account.',
    audience: 'Client teams and studio producers',
    metaTitle: 'AI content studio for marketing agencies · Socialista',
    metaDescription:
      'Save each client brand, invite the team, and make UGC, stills, and slideshows they can schedule to the client’s channels from one workspace.',
    media: 'scheduling',
    title: 'Client creative',
    titleAccent: 'in one studio.',
    description:
      'Save each brand, invite the team, and make UGC, stills, and slideshows they can schedule to the client’s channels.',
    essay: {
      id: 'why',
      toc: 'The brief that resets every time',
      heading: 'Every client should not start from a blank doc',
      paragraphs: [
        'Logo, colors, and the offer get pasted into a new file each week. UGC lives in one drive, stills in another, and the publish date in a spreadsheet nobody updated. Making the ad and posting it are two jobs, often two people, often two tools.',
        'Socialista keeps each client as a brand with products beside it. The team shares one workspace. [UGC](/features/ai-ugc-video), [static ads](/features/ai-meta-ads), and [slideshows](/features/ai-slideshows) land in the same library they [schedule](/features/social-scheduling) from — a caption per connected account.',
      ],
    },
    guide: [
      {
        id: 'brands',
        toc: 'A brand the generators can see',
        heading: 'The next ad should remember the last one',
        paragraphs: [
          'Each brand stores a name, logo, colors, and positioning. Import a product URL or add the catalog by hand. Generations start from that, so you are not restyling a stranger’s face onto the wrong palette.',
          'Save a creator when a client should keep the same persona next month. The roster is on the workspace, not in one producer’s downloads.',
        ],
      },
      {
        id: 'delivery',
        toc: 'Produce and publish',
        heading: 'The calendar is part of the job',
        paragraphs: [
          'Invite the team. They share files, creative, and publishing. This is one Socialista workspace — not a separate login per client, and not a white-label portal for the client to log into.',
          'Connect the client’s Instagram, TikTok, Facebook, Threads, LinkedIn, and X. Queue the set with a caption written for each account, then read [reach and engagement](/features/social-analytics) on those connections. Ad-account launching stays in Ads Manager.',
        ],
      },
    ],
    why: [
      {
        title: 'Client context that survives the handoff',
        description:
          'Brand, products, and saved creators live on the workspace. The next producer does not rebuild the brief from Slack.',
      },
      {
        title: 'Make it and post it without a second tool',
        description:
          'UGC, stills, and slideshows sit in the same library as the calendar. The caption is written where the file was made.',
      },
      {
        title: 'A caption per account, on purpose',
        description:
          'Instagram, TikTok, LinkedIn, and the rest each get their own line. You are not blasting one caption across six channels.',
      },
    ],
    example: {
      id: 'practice',
      toc: 'A sample week',
      heading: 'Two clients, one calendar',
      paragraphs: [
        'Monday you add a skincare brand: logo, colors, three SKUs from product URLs. A teammate adds a fitness app with screenshots. Tuesday you produce a product-in-hand clip and a static for the serum, and a show-your-app clip for the app, using a saved creator on each brand.',
        'Wednesday the same teammate writes captions per account and queues the week. Thursday you check reach on the connected accounts and export the serum still for a Meta campaign the media buyer will launch in Ads Manager. The client never logs into Socialista. Your team does.',
      ],
    },
    week: [
      {
        day: 'Mon',
        title: 'Add the brands',
        description: 'Logo, colors, positioning, and products — imported or entered by hand.',
      },
      {
        day: 'Tue',
        title: 'Produce the set',
        description: 'UGC, static ads, and slideshows per client, with a saved creator when the face should return.',
      },
      {
        day: 'Wed',
        title: 'Schedule per channel',
        description: 'A caption per connected account. The team shares the same calendar.',
      },
      {
        day: 'Thu',
        title: 'Report and export',
        description: 'Reach on connected accounts. Export files for ads the buyer launches elsewhere.',
      },
    ],
    nudge: {
      title: 'Add the first client brand',
      body: 'Then produce the set and schedule it from the same workspace your team already shares.',
    },
    painPoints: [
      {
        title: 'Every client brief starts from zero',
        description:
          'Logo, colors, and the offer get pasted into a new doc each time. The next ad does not remember the last one.',
      },
      {
        title: 'The team hunts through folders',
        description:
          'UGC is in one drive, stills in another, and the publish date in a spreadsheet nobody updated.',
      },
      {
        title: 'Making the ad and posting it are two jobs',
        description:
          'The creative is finished, then someone else rebuilds the caption and the calendar in a different tool.',
      },
    ],
    uses: [
      {
        title: 'A brand the generators can see',
        description:
          'Each brand stores a name, logo, colors, and positioning. Products sit next to it, so the next ad starts from the client’s catalog.',
      },
      {
        title: 'The team in the same workspace',
        description:
          'Invite teammates. They share files, creative, and publishing. This is one workspace, not a separate login per client.',
      },
      {
        title: 'Publish on the accounts you connect',
        description:
          'Schedule Instagram, TikTok, Facebook, Threads, LinkedIn, and X. A caption per account, then analytics on those connected accounts.',
      },
    ],
    formats: [
      {
        title: 'UGC on the client brand',
        description:
          'A talking clip with the client’s product in frame. Save the creator if that face should return next month.',
      },
      {
        title: 'Static ads',
        description:
          'Offer frames from the product photo, with the headline and call to action in the same layout.',
      },
      {
        title: 'A calendar per account',
        description: 'Queue the set across the channels you connected, with a caption written for each one.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Add the brand',
        description: 'Logo, colors, positioning, and the products you will feature.',
      },
      {
        step: '02',
        title: 'Produce the set',
        description: 'UGC, static ads, slideshows, and short video in the same library.',
      },
      {
        step: '03',
        title: 'Schedule per channel',
        description: 'A caption per account, then the calendar.',
      },
    ],
    proof: [
      { value: 'Many brands', label: 'Each one keeps its name, logo, colors, and positioning' },
      { value: 'One workspace', label: 'The team shares files, creative, and publishing' },
      { value: 'Per account', label: 'A caption and a schedule for each connected channel' },
    ],
    limitsHeading: 'What this is not',
    limits: [
      {
        title: 'No white-label client portal',
        description:
          'Clients do not get a branded login. Your team works inside Socialista and publishes to connected accounts.',
      },
      {
        title: 'No ad-account launching',
        description:
          'Socialista schedules organic posts and exports files. Campaigns stay in Ads Manager or the tool you already use.',
      },
      {
        title: 'Reporting stays on connected accounts',
        description:
          'Reach and engagement show up per account you connected, not in a separate client dashboard.',
      },
    ],
    relatedFeatureSlugs: ['social-scheduling', 'ai-ugc-video', 'ai-meta-ads', 'social-analytics'],
    faqs: [
      {
        question: 'Is there a white-label client portal?',
        answer:
          'No. Clients do not get a branded login. Your team works inside the Socialista workspace and publishes to connected accounts.',
      },
      {
        question: 'Can I keep more than one brand?',
        answer: 'Yes. Brands live in the workspace, each with its own name, logo, colors, and positioning.',
      },
      {
        question: 'Do you launch ads into the client’s ad account?',
        answer:
          'No. Socialista schedules organic posts and exports files. Ad-account launching stays in Ads Manager or whatever tool you already use.',
      },
      {
        question: 'Can the whole team produce and publish?',
        answer:
          'Yes. Invite teammates into the workspace. They share brands, products, files, and the posting calendar.',
      },
      {
        question: 'Where do client products live?',
        answer:
          'On the brand, in the catalog. Import a product URL or add the name, photos, and description by hand.',
      },
      {
        question: 'Can I see results after we post?',
        answer:
          'Reach and engagement show up per connected account. Reporting stays on the accounts you connected, not in a separate client dashboard.',
      },
    ],
  },
  {
    slug: 'creators',
    name: 'Content Creators',
    summary: 'Slideshows, clips, and an AI creator for the days you do not film.',
    audience: 'Creators and personal brands',
    metaTitle: 'AI posts for content creators · Socialista',
    metaDescription:
      'Fill the days you do not film with slideshows, captioned video, AI images, and a reusable AI creator. Schedule Instagram, TikTok, and the rest from one calendar.',
    media: 'videos',
    title: 'More posts',
    titleAccent: 'on the days you don’t film.',
    description:
      'Faceless slideshows, captioned video, AI images, and an AI creator you can reuse. Schedule them to the channels you already run.',
    essay: {
      id: 'why',
      toc: 'The days you are off camera',
      heading: 'A backlog of ideas does not post itself',
      paragraphs: [
        'You cannot film every day. Those are the days the feed stalls. Faceless posts still need a hook and on-screen text, not a half-finished draft. Then scheduling is a second job: another app for the caption, the account, and the time.',
        'Socialista covers the off-camera days with [slideshows](/features/ai-slideshows), [images](/features/ai-images), and [captioned video](/features/ai-videos). When a face would help, save an [AI creator](/features/ai-influencers) and reuse it. Your own footage still belongs — upload it, caption it, [queue](/features/social-scheduling) it next to what you generate.',
      ],
    },
    guide: [
      {
        id: 'faceless',
        toc: 'Stay faceless when you want',
        heading: 'You do not have to use an AI face',
        paragraphs: [
          'Slideshows and stills work without a creator in frame. Write the hook, edit the on-screen text, and ship. That is the week you are traveling, sick, or simply not performing.',
          'When you do want a person, one saved persona can come back across clips and stills so the page does not look like a new stranger every Thursday.',
        ],
      },
      {
        id: 'one-calendar',
        toc: 'One calendar',
        heading: 'Finish the caption where you made the post',
        paragraphs: [
          'Instagram, TikTok, Facebook, Threads, LinkedIn, and X each get their own caption. You are not copying one paragraph into six apps.',
          'After you publish, reach and engagement show up per connected account. You can see which off-camera posts actually got watched.',
        ],
      },
    ],
    why: [
      {
        title: 'Off-camera days still ship',
        description:
          'Slideshows, images, and captioned clips cover the week you are not filming, with the hook finished in the studio.',
      },
      {
        title: 'Your footage and generated posts, together',
        description:
          'Upload what you already shot. Generate what you did not. Caption and schedule both from the same calendar.',
      },
      {
        title: 'A persona you can bring back',
        description:
          'Save an AI creator for the posts that need a face, or skip it entirely. The format is a choice, not a requirement.',
      },
    ],
    example: {
      id: 'practice',
      toc: 'A sample week',
      heading: 'Three posts, one day on camera',
      paragraphs: [
        'You film Monday. That clip goes into the editor for captions and gets scheduled to TikTok and Reels. Tuesday you are off camera, so you cut a faceless slideshow from a hook you already wrote, and generate an image post for the carousel slot.',
        'Wednesday you use a saved AI creator for a talking post you do not want to film again. Thursday you glance at reach on the connected accounts and queue Friday from the same week view, with a different caption on X than on Instagram.',
      ],
    },
    week: [
      {
        day: 'Mon',
        title: 'Your footage',
        description: 'Upload the clip you filmed. Caption it. Schedule TikTok and Reels.',
      },
      {
        day: 'Tue',
        title: 'Faceless slideshow',
        description: 'A hook and on-screen text for the day you are not in frame.',
      },
      {
        day: 'Wed',
        title: 'Saved creator',
        description: 'A talking post from a persona you reuse, or skip this if you stay faceless.',
      },
      {
        day: 'Thu',
        title: 'Queue the rest',
        description: 'Captions per channel. Check which posts reached people.',
      },
    ],
    nudge: {
      title: 'Fill the days you don’t film',
      body: 'A slideshow, a captioned clip, or a saved creator — then one calendar for the week.',
    },
    painPoints: [
      {
        title: 'You cannot film every day',
        description:
          'The days you are off camera are the days the feed stalls. A backlog of ideas does not post itself.',
      },
      {
        title: 'Faceless posts still need a hook',
        description:
          'A slideshow or a still only works if the caption and the on-screen text are finished, not left as a draft.',
      },
      {
        title: 'Scheduling is a second job',
        description:
          'The clip is done, then you open another app to write a caption, pick an account, and set a time.',
      },
    ],
    uses: [
      {
        title: 'Formats that do not need your face',
        description:
          'Slideshows and AI images cover the days you are not on camera. Hooks and captions are edited in the studio before they ship.',
      },
      {
        title: 'A persona you can bring back',
        description:
          'Create an AI creator and reuse that face across clips and stills, or keep posting as yourself and use the editor for captions.',
      },
      {
        title: 'The calendar, in the same studio',
        description:
          'Schedule Instagram, TikTok, Facebook, Threads, LinkedIn, and X, and check which posts reached people.',
      },
    ],
    formats: [
      {
        title: 'Faceless slideshow',
        description: 'A short sequence with a hook and on-screen text for the days you are not in frame.',
      },
      {
        title: 'Captioned video',
        description: 'Your own footage or a generated clip, with captions edited before you schedule it.',
      },
      {
        title: 'A reusable AI creator',
        description: 'One saved face for the posts that need a person, without filming a new take each time.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Pick the format',
        description: 'Slideshow, image, short video, or an AI creator clip.',
      },
      {
        step: '02',
        title: 'Finish the caption',
        description: 'Edit on-screen captions and the post copy before it ships.',
      },
      {
        step: '03',
        title: 'Queue the week',
        description: 'Schedule across the accounts you connected, with a caption per channel.',
      },
    ],
    proof: [
      { value: 'Off-camera days', label: 'Slideshows, images, and clips when you are not filming' },
      { value: 'Your footage', label: 'Upload your own images and clips, then caption and schedule them' },
      { value: 'One calendar', label: 'Instagram, TikTok, Facebook, Threads, LinkedIn, and X' },
    ],
    limitsHeading: 'What this is not',
    limits: [
      {
        title: 'An AI face is optional',
        description:
          'Slideshows, images, and the video editor work without a creator. The persona is there when you want one.',
      },
      {
        title: 'You still write the hook',
        description:
          'The studio generates and captions. The line that makes someone stop is yours to edit before it ships.',
      },
      {
        title: 'The workspace owns the files',
        description: 'What you generate and upload lives in your workspace. Export it or schedule it from Socialista.',
      },
    ],
    relatedFeatureSlugs: ['ai-videos', 'ai-slideshows', 'ai-influencers', 'social-scheduling'],
    faqs: [
      {
        question: 'Do I have to use an AI face?',
        answer:
          'No. Slideshows, images, and the video editor work without an AI creator. The creator is there when you want a reusable persona.',
      },
      {
        question: 'Can I still post my own footage?',
        answer: 'Yes. Bring your own images and clips, then caption, export, and schedule them.',
      },
      {
        question: 'Which networks are supported?',
        answer: 'Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
      },
      {
        question: 'Can I write a different caption per account?',
        answer: 'Yes. Each connected account gets its own caption when you schedule the post.',
      },
      {
        question: 'Who owns what I generate?',
        answer: 'Your workspace owns the creative you generate and upload. Export it or schedule it from Socialista.',
      },
      {
        question: 'Can I see which posts reached people?',
        answer: 'Yes. Reach and engagement show up per connected account after you publish.',
      },
    ],
  },
  {
    slug: 'founders',
    name: 'Founders',
    summary: 'First ads and a posting calendar, without a hire.',
    audience: 'Solo founders and early teams',
    metaTitle: 'First social ads for founders · Socialista',
    metaDescription:
      'Free to start. Make the first UGC clip or static ad from your product, schedule the week, and invite a teammate when you need one.',
    media: 'influencers',
    title: 'The first ads',
    titleAccent: 'without a hire.',
    description:
      'Free to start. Pick a creator, add the product, and publish. One person can make the creative and keep the channels fed.',
    essay: {
      id: 'why',
      toc: 'No content hire yet',
      heading: 'The first ads are yours',
      paragraphs: [
        'A crew, a freelancer, and a week of revisions are more process than the post is worth. Every post still starts from a blank page: product name, offer, look — retyped. Then product work wins the calendar and the channels go quiet the week you ship.',
        'Socialista is free to start. Save the brand and the product once. Make [UGC](/features/ai-ugc-video), a [static ad](/features/ai-meta-ads), or a [slideshow](/features/ai-slideshows) from what you have. [Schedule](/features/social-scheduling) the week yourself. Invite someone later if the workspace needs a second pair of hands.',
      ],
    },
    guide: [
      {
        id: 'first-version',
        toc: 'The first version',
        heading: 'Start from the photo and a short brief',
        paragraphs: [
          'You do not need a product URL, though it helps. Add the name, photos, and description by hand. Pick an [AI creator](/features/ai-influencers) for the talking post, or a static frame if video is too much for today.',
          'Refine the hook in the studio. The first ad does not have to be the last one. Save the creator so the next clip looks like the same person.',
        ],
      },
      {
        id: 'stay-small',
        toc: 'Stay at one person',
        heading: 'A workspace can stay a workspace of one',
        paragraphs: [
          'Connect Instagram, TikTok, Facebook, Threads, LinkedIn, and X when you are ready. You do not have to post everywhere on day one.',
          'Paid plans show up at checkout when you need more credits, seats, or connected accounts. Until then, one person can make the creative and keep a few channels fed.',
        ],
      },
    ],
    why: [
      {
        title: 'Free to open the studio',
        description:
          'No credit card to start. Paid plans appear when you need more credits, seats, or connected accounts.',
      },
      {
        title: 'One person can finish the job',
        description:
          'Make the clip or the still, write the caption, schedule it. You are not hiring a production chain for the first ten posts.',
      },
      {
        title: 'Context that carries forward',
        description:
          'Save the brand and the product once. Later posts start from that, so Thursday is not a blank prompt again.',
      },
    ],
    example: {
      id: 'practice',
      toc: 'A sample week',
      heading: 'The week after you ship v1',
      paragraphs: [
        'You launched on Thursday. Saturday you open Socialista, save the brand, and add the product from a URL or three photos. You pick a creator and generate a 20-second clip about who the product is for, then a static frame for the days you do not want video.',
        'Sunday you schedule Instagram and LinkedIn — different captions — and leave TikTok for next week. When a contractor joins in a month, you invite them into the same workspace. They get the brand, the product, and the calendar. You do not hand them a folder of exports.',
      ],
    },
    week: [
      {
        day: 'Sat',
        title: 'Start free',
        description: 'Save the brand and the product. No card to open the studio.',
      },
      {
        day: 'Sun',
        title: 'Make one ad',
        description: 'A talking clip, or a static frame if video is too much today.',
      },
      {
        day: 'Mon',
        title: 'Schedule two channels',
        description: 'You do not have to post everywhere. Write a caption per account you connect.',
      },
      {
        day: 'Later',
        title: 'Invite someone',
        description: 'A workspace can stay at one member until you need a second pair of hands.',
      },
    ],
    nudge: {
      title: 'Make the first ad this weekend',
      body: 'Free to start. A creator, a product, and a post — without hiring anyone first.',
    },
    painPoints: [
      {
        title: 'There is no content hire yet',
        description:
          'The first ads are yours. A crew, a freelancer, and a week of revisions are more process than the post is worth.',
      },
      {
        title: 'Every post starts from a blank page',
        description:
          'The product name, the offer, and the look get retyped each time. Nothing you made last week carries forward.',
      },
      {
        title: 'The channels go quiet the week you ship',
        description:
          'Product work wins the calendar. The posts that should have gone out sit in a drafts folder.',
      },
    ],
    uses: [
      {
        title: 'The first version, from what you have',
        description:
          'UGC, a static ad, or a slideshow from a product photo and a short brief. You refine the hook in the studio.',
      },
      {
        title: 'The company context stays put',
        description: 'Save the brand and the product once. Later posts start from that, not from a blank prompt.',
      },
      {
        title: 'Post it yourself',
        description:
          'Connect the accounts, schedule the week, and read reach and engagement on the accounts you connected.',
      },
    ],
    formats: [
      {
        title: 'An AI creator for the first clip',
        description:
          'A face and a voice for the talking-head post, saved so the next one looks like the same person.',
      },
      {
        title: 'A static ad when video is too much',
        description: 'One frame with the product and the offer for the day you do not want to make a clip.',
      },
      {
        title: 'A week on the calendar',
        description:
          'Queue what you made across the accounts you connected, then come back when there is a second pair of hands.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Start free',
        description: 'No card to open the studio. Paid plans show up at checkout when you need them.',
      },
      {
        step: '02',
        title: 'Make one ad',
        description: 'Creator, product, and a format. Or a static frame if video is too much for today.',
      },
      {
        step: '03',
        title: 'Ship it',
        description: 'Schedule the post. Invite someone later if the workspace needs a second pair of hands.',
      },
    ],
    proof: [
      { value: 'Free to start', label: 'Open the studio before you pick a paid plan' },
      { value: 'One person', label: 'A workspace can stay at a single member' },
      { value: 'Your files', label: 'The workspace owns what you generate and upload' },
    ],
    limitsHeading: 'What this is not',
    limits: [
      {
        title: 'Not a full-time content team',
        description:
          'One person can make and schedule posts. It does not replace a hire when you need strategy, community, or paid media as a job.',
      },
      {
        title: 'You still pick the offer',
        description:
          'The studio generates the creative. Positioning, the hook, and which channel to post are yours.',
      },
      {
        title: 'Paid ads stay in your ads manager',
        description: 'Export the file when you are ready to spend. Socialista does not launch campaigns for you.',
      },
    ],
    relatedFeatureSlugs: ['ai-influencers', 'ai-ugc-video', 'ai-meta-ads', 'social-scheduling'],
    faqs: [
      {
        question: 'Can I try it before I pay?',
        answer: 'Yes. Start without a credit card. Upgrade when you need more credits, seats, or connected accounts.',
      },
      {
        question: 'What if I am the only person posting?',
        answer: 'That is the normal setup. A workspace can stay at one member until you invite someone.',
      },
      {
        question: 'Who owns what I generate?',
        answer: 'Your workspace owns the creative you generate and upload. Export it or schedule it from Socialista.',
      },
      {
        question: 'Do I need a product page to start?',
        answer:
          'A product URL helps. You can also add the name, photos, and description by hand and generate from that.',
      },
      {
        question: 'Which accounts can I connect?',
        answer: 'Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
      },
      {
        question: 'Can I hand this to someone later?',
        answer:
          'Yes. Invite a teammate into the workspace. They get the same brands, products, files, and publishing.',
      },
    ],
  },
] as const satisfies readonly Industry[]

export type IndustrySlug = (typeof INDUSTRIES)[number]['slug']

export function getIndustry(slug: string) {
  return INDUSTRIES.find(industry => industry.slug === slug)
}

export function industryPath(slug: string) {
  return `/industries/${slug}`
}

export function otherIndustries(slug: string, limit = 3) {
  const index = INDUSTRIES.findIndex(industry => industry.slug === slug)
  if (index < 0) return INDUSTRIES.slice(0, limit)
  return [...INDUSTRIES.slice(index + 1), ...INDUSTRIES.slice(0, index)].slice(0, limit)
}

export type IndustryTocItem = {
  id: string
  label: string
}

export function industryToc(industry: Industry): readonly IndustryTocItem[] {
  return [
    { id: industry.essay.id, label: industry.essay.toc },
    ...industry.guide.map(section => ({ id: section.id, label: section.toc })),
    { id: 'why-socialista', label: 'Why Socialista' },
    { id: 'problem', label: 'The problem' },
    { id: industry.example.id, label: industry.example.toc },
    { id: 'fits', label: 'Where it fits' },
    { id: 'formats', label: 'What you can make' },
    { id: 'how', label: 'How you use it' },
    { id: 'limits', label: 'Good to know' },
    { id: 'faq', label: 'Questions' },
  ]
}

function countWords(parts: readonly string[]) {
  let count = 0
  for (const part of parts) {
    for (const word of part.trim().split(/\s+/)) {
      if (word) count += 1
    }
  }
  return count
}

/** Rough read time for the playbook body. Rounded, with a floor so short pages still feel like a read. */
export function industryReadingMinutes(industry: Industry) {
  const words = countWords([
    industry.description,
    industry.essay.heading,
    ...industry.essay.paragraphs,
    ...industry.guide.flatMap(section => [section.heading, ...section.paragraphs]),
    industry.example.heading,
    ...industry.example.paragraphs,
    industry.limitsHeading,
    ...industry.limits.flatMap(item => [item.title, item.description]),
    ...industry.why.flatMap(item => [item.title, item.description]),
    ...industry.painPoints.flatMap(item => [item.title, item.description]),
    ...industry.uses.flatMap(item => [item.title, item.description]),
    ...industry.formats.flatMap(item => [item.title, item.description]),
    ...industry.steps.flatMap(item => [item.title, item.description]),
    ...industry.week.flatMap(item => [item.title, item.description]),
    ...industry.faqs.flatMap(item => [item.question, item.answer]),
  ])
  return Math.max(5, Math.round(words / 200))
}
