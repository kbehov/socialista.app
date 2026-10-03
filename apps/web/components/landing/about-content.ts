/** About page. Claims match shipped studio capabilities only. */

export const ABOUT_PAGE = {
  metaTitle: 'About Socialista — the studio for UGC, ads, and publishing',
  metaDescription:
    'What Socialista is, who it is for, how a posting day actually looks, and the few things we will not trade away.',
  hero: {
    eyebrow: 'About',
    title: 'Social creative,',
    titleAccent: 'without the crew.',
    description:
      'Socialista is the studio where a product becomes a post. AI creators, UGC, ads, and a calendar — so the week does not depend on a shoot.',
  },
  facts: [
    {
      label: 'Create',
      body: 'AI creators, UGC, static ads, slideshows, images, and short video in one workspace.',
    },
    {
      label: 'Publish',
      body: 'A caption per account for Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
    },
    {
      label: 'Measure',
      body: 'Reach and engagement beside the posts you shipped, so the next one has a starting point.',
    },
  ],
  toc: [
    { id: 'about', label: 'About Socialista' },
    { id: 'what-we-do', label: 'What we do' },
    { id: 'who-its-for', label: 'Who it’s for' },
    { id: 'your-day', label: 'Your day' },
    { id: 'beliefs', label: 'What we believe' },
  ],
  statement: {
    lead: 'You bring the product.',
    rest: 'Socialista brings the creator, the edit, and the calendar.',
  },
  about: {
    id: 'about',
    eyebrow: 'About Socialista',
    title: 'One place to make it',
    titleAccent: 'and put it live.',
    paragraphs: [
      'Socialista is where the creative gets made and where it gets queued. You save a brand and a product. You pick an AI creator. You generate the formats a feed actually uses: talking UGC with the offer in frame, static ads, slideshows, images, and short video.',
      'Captions are written per account. The queue covers Instagram, TikTok, Facebook, Threads, LinkedIn, and X. After a post goes live, reach and engagement sit next to the creative, so the next one can start from what already moved.',
      'The usual path is a creator brief, a film day, an edit, a scheduler, and a spreadsheet. Most teams shipping a product do not have that week. They have a SKU, a screenshot, or a launch — and a calendar that is already behind.',
    ],
    pull: 'The post should not wait on a film day.',
  },
  does: {
    id: 'what-we-do',
    eyebrow: 'What Socialista does',
    title: 'Make the creative.',
    titleAccent: 'Then ship it.',
    description:
      'Six jobs, one workspace. Each one is a part of the studio you can open today.',
    items: [
      {
        step: '01',
        title: 'A face the brand keeps',
        description:
          'Spin up an AI creator and reuse the same persona on video, stills, and the next launch. The audience sees one person, not a new stranger every brief.',
        href: '/features/ai-influencers',
        link: 'AI Influencer Generator',
      },
      {
        step: '02',
        title: 'UGC with the product in frame',
        description:
          'Product-in-hand clips, hooks, and captions. Edit until it sounds like the brand, then export vertical video for organic posts or paid social.',
        href: '/features/ai-ugc-video',
        link: 'AI UGC Video Generator',
      },
      {
        step: '03',
        title: 'Stills that can run as ads',
        description:
          'Turn a product photo into a static frame or an image from a studio template. Headline, offer, and CTA stay in one crop sized for the feed.',
        href: '/features/ai-meta-ads',
        link: 'AI Meta Ads Templates',
      },
      {
        step: '04',
        title: 'Slideshows and short video',
        description:
          'Faceless carousels when a talking creator is the wrong format. Or a clip you trim, caption, and finish in the editor.',
        href: '/features/ai-slideshows',
        link: 'AI Slideshows Generator',
        also: { href: '/features/ai-videos', link: 'AI Video Generation' },
      },
      {
        step: '05',
        title: 'A calendar, not another export',
        description:
          'Write a caption for each connected account and queue the week from the same place you made the creative. Paid campaigns stay in the ads manager.',
        href: '/features/social-scheduling',
        link: 'Social Media Scheduling',
      },
      {
        step: '06',
        title: 'A reason to make the next one',
        description:
          'Reach and engagement per account, next to the posts you shipped. Use it to see what spiked, then make more of that — not a spreadsheet export.',
        href: '/features/social-analytics',
        link: 'Social Media Analytics',
      },
    ],
  },
  who: {
    id: 'who-its-for',
    eyebrow: 'Who it’s for',
    title: 'People who have to post',
    titleAccent: 'this week.',
    description:
      'Solo founders, stores, product teams, agencies, and creators. The tools stay the same. The week does not.',
    audiences: [
      {
        title: 'Founders',
        description:
          'First ads, no hire. Save the product, pick a creator, and ship a clip the same day you would have spent briefing a shoot.',
        href: '/industries/founders',
        link: 'For founders',
      },
      {
        title: 'Ecommerce',
        description:
          'A product URL, a restock, a SKU that should keep selling after launch week. The catalog stays. The next ad does not start from a blank prompt.',
        href: '/industries/ecommerce',
        link: 'For Shopify and ecommerce',
      },
      {
        title: 'Apps and SaaS',
        description:
          'A talking clip and a LinkedIn post without putting the founder on camera. Show the product, then schedule the account that actually reads it.',
        href: '/industries/saas',
        link: 'For SaaS',
        also: { href: '/industries/mobile-apps', link: 'For mobile apps' },
      },
      {
        title: 'Agencies',
        description:
          'Several client brands, one team, one calendar. Shared context, files, and publishing — without a separate stack per account.',
        href: '/industries/agencies',
        link: 'For agencies',
      },
      {
        title: 'Creators',
        description:
          'A persona and a posting rhythm for the days you cannot film. Slideshows, clips, and a queue that does not depend on being in frame.',
        href: '/industries/creators',
        link: 'For creators',
      },
    ],
  },
  day: {
    id: 'your-day',
    eyebrow: 'How it fits your day',
    title: 'A Tuesday,',
    titleAccent: 'not a production.',
    description:
      'Illustrative. This is the shape of a day when the product is already saved and the feed still needs something new.',
    moments: [
      {
        time: '9:10',
        label: 'Morning',
        title: 'Open the product you already saved',
        body: 'The brand and the SKU are in the catalog from last month. You are not rewriting a brief. You are picking what the feed is missing.',
      },
      {
        time: '11:40',
        label: 'Late morning',
        title: 'Pick a creator and a format',
        body: 'A product-in-hand clip if the offer needs a face. A slideshow if it does not. The same persona can come back tomorrow.',
      },
      {
        time: '2:15',
        label: 'Afternoon',
        title: 'Edit the hook before it leaves',
        body: 'Change the line, the captions, the crop. The first generation is a draft. The version you publish is the one that sounds like the brand.',
      },
      {
        time: '4:30',
        label: 'Late day',
        title: 'Caption each channel and queue the week',
        body: 'Instagram does not get the LinkedIn line. Each connected account gets its own caption, then a place on the calendar.',
      },
      {
        time: 'Next week',
        label: 'After it posts',
        title: 'See what spiked, then make more of it',
        body: 'Reach and engagement sit next to the creative. The following Tuesday starts from that, not from a blank page.',
      },
    ],
  },
  beliefs: {
    id: 'beliefs',
    eyebrow: 'What we believe',
    title: 'A few things',
    titleAccent: 'we will not trade.',
    description: 'The product gets simpler when these stay fixed.',
    items: [
      {
        step: '01',
        title: 'Native is the point',
        body: 'A brand film and a TikTok are different jobs. Socialista is built for the second: talking heads, product in hand, hooks, captions, and vertical crops.',
      },
      {
        step: '02',
        title: 'Keep the face',
        body: 'A new creator every week teaches the audience nothing. Save the persona. Bring them back for the next SKU, the next feature, the next still.',
      },
      {
        step: '03',
        title: 'Finish where you started',
        body: 'Export is not the end of the job. A caption per channel and a place on the calendar are part of the studio, not a second tool you have to open.',
      },
      {
        step: '04',
        title: 'The files are yours',
        body: 'Your workspace owns what you generate and upload. Keep it in the library, export it, or schedule it from Socialista.',
      },
      {
        step: '05',
        title: 'Say what the tool does not do',
        body: 'Organic analytics are not an ads manager. Paid campaigns stay where you already run them. If a job needs a film crew, we would rather you know that before you start.',
      },
    ],
  },
  contact: {
    lead: 'A question about the product, a plan, or a partnership.',
    email: 'hello@socialista.app',
    href: 'mailto:hello@socialista.app?subject=Hello%20from%20the%20about%20page',
  },
} as const
