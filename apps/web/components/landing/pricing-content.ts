/** Copy and FAQs for the public /pricing page (SEO + AI-readable). */

export const PRICING_PAGE = {
  hero: {
    eyebrow: 'Pricing',
    title: 'Plans for AI UGC, ads, and publishing.',
    titleAccent: 'Start free, scale when you ship more.',
    description:
      'Socialista is one studio for realistic AI UGC video, static Meta ads, slideshows, short video, and images—plus scheduling and analytics on connected social accounts. Pick a plan that matches your credits, seats, and channels; upgrade or cancel anytime from your workspace.',
  },
  included: {
    title: 'What every paid plan unlocks',
    description:
      'Plans differ by credits, team seats, connected accounts, and storage. The studio workflow is the same on every tier.',
    groups: [
      {
        title: 'Create',
        items: [
          'AI creators and talking-head UGC with your product in frame',
          'Static ads, slideshows, carousels, and short-form video',
          'Brand, product, and skill context so outputs stay on-message',
          'Export ad-ready files sized for paid and organic social',
        ],
      },
      {
        title: 'Publish',
        items: [
          'Connect Instagram, TikTok, Facebook, Threads, LinkedIn, and X',
          'Draft, schedule, and publish from a week calendar',
          'One post per connected account with captions and media',
        ],
      },
      {
        title: 'Measure',
        items: [
          'Reach and engagement per connected account',
          'See which creatives drive results without spreadsheet exports',
        ],
      },
    ],
  },
  billing: {
    title: 'How billing works',
    description:
      'Checkout is handled securely through Polar. Your workspace billing page shows the active plan, renewal date, and invoices.',
    steps: [
      {
        name: 'Start on the free tier',
        text:
          'Create a workspace without a credit card. Generate and explore the studio within your free credits and limits.',
      },
      {
        name: 'Choose a plan',
        text:
          'Open Pricing or Upgrade in your dashboard, compare live plans for your region, and check out in one flow.',
      },
      {
        name: 'Credits refresh each cycle',
        text:
          'Paid plans include a monthly AI credit allowance shown on the plan card. Credits reset each billing period unless your plan states otherwise.',
      },
      {
        name: 'Change or cancel anytime',
        text:
          'Upgrade, downgrade, or cancel from workspace billing. Paid access continues through the end of the current period after you cancel.',
      },
    ],
  },
  compare: {
    title: 'Compare with other tools',
    description:
      'See how Arcads, MakeUGC, Buffer, and other tools stack up on creation, publishing, and public pricing pages—sourced and dated on each comparison.',
    cta: 'Browse comparisons',
    href: '/compare',
  },
} as const

export const PRICING_FAQ_ITEMS = [
  {
    question: 'Is there a free plan?',
    answer:
      'Yes. You can start without a credit card and use the studio within the limits of the free tier shown at checkout. Upgrade when you need more AI credits, team seats, connected accounts, or storage.',
  },
  {
    question: 'What are AI credits used for?',
    answer:
      'Credits cover AI generation in the studio—UGC video, images, slideshows, static ads, and related runs. Each plan lists how many credits you get per billing period. Your workspace shows usage before you generate.',
  },
  {
    question: 'Can I invite teammates?',
    answer:
      'Yes. Paid plans include workspace seats so your team can share brands, products, files, and publishing. The seat limit is listed on each plan card.',
  },
  {
    question: 'Which social networks can I connect?',
    answer:
      'Socialista supports connected accounts for Instagram, TikTok, Facebook, Threads, LinkedIn, and X. Plan limits on how many accounts you can connect are shown on each tier.',
  },
  {
    question: 'Can I change plans later?',
    answer:
      'Yes. Upgrade or downgrade from your workspace billing area. Polar handles proration and renewal according to the plan you select at checkout.',
  },
  {
    question: 'Can I cancel a paid subscription?',
    answer:
      'Yes. Cancel anytime from billing. You keep paid features through the end of the current billing period, then your workspace moves to the limits of your new plan or the free tier.',
  },
  {
    question: 'Do you offer annual billing?',
    answer:
      'When annual prices are configured for your region, they appear on the plan cards at checkout. Otherwise plans bill monthly as shown on this page.',
  },
  {
    question: 'Who do I contact for enterprise seats or volume?',
    answer:
      'Email sales@socialista.app with your team size, channels, and monthly creative volume. We will help you pick credits, seats, and support that fit an agency or in-house team.',
  },
] as const
