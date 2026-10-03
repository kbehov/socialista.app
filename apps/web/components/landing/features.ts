/** Feature pages. Claims match shipped studio capabilities only. */

export type FeatureCategory = 'create' | 'publish'

export const FEATURE_CATEGORIES = [
  {
    id: 'create' as const,
    label: 'Create',
    description:
      'The creative itself: a reusable AI creator, UGC with the product in frame, faceless slideshows, static ads, images, and short video. Start from a product you saved, a template, or a clip you already like.',
  },
  {
    id: 'publish' as const,
    label: 'Publish & measure',
    description:
      'Connect Instagram, TikTok, Facebook, Threads, LinkedIn, and X. Write a caption for each account, queue the week, then read reach and engagement beside the posts you shipped. This is organic. Paid campaigns stay in the ads manager.',
  },
] as const

export const FEATURES_PAGE = {
  metaTitle: 'Socialista features — AI UGC, ads, scheduling, and analytics',
  metaDescription:
    'Plain-language guides to Socialista: AI influencers, UGC video, slideshows, static Meta ads, images, short-form video, scheduling, and organic analytics.',
  eyebrow: 'Features',
  title: 'The studio,',
  titleAccent: 'one feature at a time.',
  description:
    'Eight guides. Each one explains what the feature does, the kind of week it is for, and where it stops. Then you can try it.',
  intro: [
    'Socialista is where the post gets made and where it gets queued. AI creators, UGC, slideshows, static ads, images, and short video share one workspace. Scheduling and analytics cover the accounts you connect: Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
    'If you already know the gap, open that guide. If you are still deciding whether the studio fits a week of posting, start with [UGC video](/features/ai-ugc-video) or [scheduling](/features/social-scheduling). Those two show the shape of the product.',
  ],
} as const

export type FeatureStep = {
  step: string
  title: string
  description: string
}

export type FeatureHighlight = {
  title: string
  description: string
}

export type FeatureFaq = {
  question: string
  answer: string
}

export type FeatureUseCase = {
  title: string
  description: string
}

export type FeatureProof = {
  value: string
  label: string
}

/** A headed block of guide copy. Paragraphs may include `[label](/path)` links. */
export type FeatureProse = {
  id: string
  toc: string
  heading: string
  paragraphs: readonly string[]
}

export type FeatureNudge = {
  title: string
  body: string
}

export type FeatureMediaId =
  | 'influencers'
  | 'ugc'
  | 'slideshows'
  | 'static-ads'
  | 'images'
  | 'videos'
  | 'scheduling'
  | 'analytics'

export type Feature = {
  slug: string
  category: FeatureCategory
  /** Footer and hub card label. */
  name: string
  summary: string
  /** Absolute document title. Includes the brand; `createMetadata` does not append it. */
  metaTitle: string
  metaDescription: string
  media: FeatureMediaId
  title: string
  titleAccent: string
  description: string
  /** Opening essay. Blog voice, still about this feature. */
  essay: FeatureProse
  /** Longer sections after the essay. Two is enough. */
  guide: readonly FeatureProse[]
  /** A concrete walkthrough. Illustrative, not a customer story. */
  example: FeatureProse
  /** Mid-article signup. Sits after the guide, before the scan sections. */
  nudge: FeatureNudge
  limitsHeading: string
  limits: readonly FeatureHighlight[]
  highlights: readonly FeatureHighlight[]
  useCases: readonly FeatureUseCase[]
  steps: readonly FeatureStep[]
  proof: readonly FeatureProof[]
  /** Curated cross-links. Slugs must exist in `FEATURES`. */
  relatedSlugs: readonly string[]
  faqs: readonly FeatureFaq[]
}

export const FEATURES = [
  {
    slug: 'ai-influencers',
    category: 'create',
    name: 'AI Influencer Generator',
    summary: 'A photoreal creator you reuse across clips, stills, and ads.',
    metaTitle: 'AI Influencer Generator · Socialista',
    metaDescription:
      'Create a photoreal AI influencer and reuse that face on UGC, stills, and ads. Saved in your workspace, so you are not booking talent for every post.',
    media: 'influencers',
    title: 'An AI influencer',
    titleAccent: 'you can keep.',
    description:
      'Create a photoreal creator, save them in the workspace, and use that same person on UGC, images, and static ads. Thursday can ask for a face without a new booking.',
    essay: {
      id: 'why',
      toc: 'Why a saved face',
      heading: 'The empty slot is usually a face',
      paragraphs: [
        'You already know what the post should say. The hook is written, the product is on the desk, and the calendar says tomorrow. What you do not have is someone who can be on camera again, looking like the person who posted on Monday.',
        'An AI influencer is that person, defined once. You set the look and the energy, save the creator to the workspace, and bring them back for the next [UGC clip](/features/ai-ugc-video), still, or [static ad](/features/ai-meta-ads). The feed reads as one creator who showed up all week.',
      ],
    },
    guide: [
      {
        id: 'one-persona',
        toc: 'One persona',
        heading: 'One person, several formats',
        paragraphs: [
          'A launch is rarely a single file. You want a talking-head for Reels, a product-in-hand still, and a frame with the offer on it. Three stock models make that look like three different brands hired three different strangers.',
          'Create the creator in the studio, or start from the library, and save them. Anyone on the team picks the same persona from the roster. The face is not sitting in one person’s downloads.',
        ],
      },
      {
        id: 'when-to-skip',
        toc: 'When to skip it',
        heading: 'Plenty of posts should stay faceless',
        paragraphs: [
          '[Slideshows](/features/ai-slideshows), a product photo, and footage you already shot do not need a creator in frame. Use those when the idea is the slides, the object, or a shoot you already like.',
          'The generator is for the days a person should be holding the product or talking to the camera, and you are not available to be that person.',
        ],
      },
    ],
    example: {
      id: 'practice',
      toc: 'A sample week',
      heading: 'Four posts, one saved creator',
      paragraphs: [
        'You are launching a serum. Monday you save a creator: soft light, calm delivery, someone who could plausibly be in a bathroom mirror. Tuesday that creator holds the bottle in a product-in-hand clip, with the hook you want to test. Wednesday the same face is on a still you schedule to Instagram.',
        'Thursday you export a static frame for Ads Manager. Socialista does not launch the campaign. It keeps the person consistent, so you are not restyling a new face every time the product needs another asset. When you want the real you on camera, upload that footage and publish it from the same studio.',
      ],
    },
    nudge: {
      title: 'Save the creator once',
      body: 'Then put that same person in the next clip, still, or ad frame.',
    },
    limitsHeading: 'Before you build a roster',
    limits: [
      {
        title: 'Your own footage still belongs',
        description:
          'A shoot you already like can be uploaded, captioned, and scheduled. The AI creator covers the days you do not film.',
      },
      {
        title: 'Faceless formats stay faceless',
        description: 'Slideshows do not require a creator. Use them when a face would compete with the slides.',
      },
      {
        title: 'The workspace owns what you generate',
        description:
          'Creators and the files you make with them live in the workspace. Export them, or schedule them to the accounts you connect.',
      },
    ],
    highlights: [
      {
        title: 'Looks like native UGC',
        description:
          'Photoreal talking-head and product-in-hand shots—not stiff stock. Tune energy and style to your brand.',
      },
      {
        title: 'One persona, every format',
        description:
          'Reuse the same face across Reels, carousels, thumbnails, and paid frames so the feed feels consistent.',
      },
      {
        title: 'Yours in the workspace',
        description:
          'Save creators to your roster and pick them again for the next generation. Your team shares the same library.',
      },
    ],
    useCases: [
      {
        title: 'You post more than you can film',
        description:
          'Daily Reels and TikToks stall when the only creator is you. An AI influencer covers the days you are not on camera, with a face that still looks like the brand.',
      },
      {
        title: 'The same face has to show up everywhere',
        description:
          'A launch needs a talking-head, a product-in-hand still, and a static ad. One saved creator keeps the person consistent instead of a new stock face each time.',
      },
      {
        title: 'The team shares one roster',
        description:
          'Creators live in the workspace, not in one person’s downloads. Anyone on the team can pick the same persona for the next UGC clip or still.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Create the creator',
        description: 'Define look, vibe, and voice—or start from the creator library.',
      },
      {
        step: '02',
        title: 'Put them in the scene',
        description: 'Product in hand, show-your-app, unboxing, or a straight talking-head hook.',
      },
      {
        step: '03',
        title: 'Ship the creative',
        description: 'Export, schedule to connected accounts, or open the file in another ad tool.',
      },
    ],
    proof: [
      { value: 'One face', label: 'Same persona on UGC, stills, and ads' },
      { value: 'Saved roster', label: 'Creators stay in the workspace library' },
      { value: 'Your export', label: 'Download the file or schedule the post' },
    ],
    relatedSlugs: ['ai-ugc-video', 'ai-images', 'ai-meta-ads', 'social-scheduling'],
    faqs: [
      {
        question: 'What is an AI influencer generator?',
        answer:
          'It creates a photoreal creator you can reuse. You define the look and vibe, save them to the workspace, and place that same person in UGC, images, and static ads.',
      },
      {
        question: 'Do I have to use an AI face for every post?',
        answer:
          'No. Slideshows, static ads, and your own footage work without a creator. The generator is there when you want a reusable persona.',
      },
      {
        question: 'Can I make a custom creator?',
        answer:
          'Yes. You can create and save AI creators in the studio and reuse them across UGC and stills.',
      },
      {
        question: 'Can my team use the same creator?',
        answer:
          'Yes. Creators are saved to the workspace library, so teammates pick the same persona instead of rebuilding one.',
      },
      {
        question: 'Who owns the likeness?',
        answer:
          'Your workspace owns the creative you generate. Export it or schedule it from Socialista.',
      },
      {
        question: 'Does this replace a human creator?',
        answer:
          'It covers the posts you would otherwise reshoot or leave blank. You can still upload your own footage and publish it from the same studio.',
      },
    ],
  },
  {
    slug: 'ai-ugc-video',
    category: 'create',
    name: 'AI UGC Video Generator',
    summary: 'Talking-head UGC with your product in frame—no film day.',
    metaTitle: 'AI UGC Video Generator for TikTok & Reels · Socialista',
    metaDescription:
      'Generate talking-head UGC with your product in frame. Product-in-hand, show-your-app, and unboxing for TikTok and Reels, then caption the clip and schedule it.',
    media: 'ugc',
    title: 'UGC video',
    titleAccent: 'without a film day.',
    description:
      'Generate a talking-head clip with your product in frame. Product-in-hand, show-your-app, and unboxing are the formats. Edit the captions, then schedule the post or export the file.',
    essay: {
      id: 'why',
      toc: 'Why UGC',
      heading: 'The clip that looks filmed is the one people stop for',
      paragraphs: [
        'People scroll past a glossy packshot and stop for a person holding the thing. That clip used to mean a creator, a brief, a shipping label, and a week you do not have. A lot of calendars go out with a product photo because the alternative was “wait.”',
        'AI UGC video starts from a creator, your product, and a hook. Socialista generates a vertical clip in the formats short-form already uses: product in hand, show your app, or unboxing. You fix the on-screen caption in the same studio, then [schedule it](/features/social-scheduling) or download it for a paid campaign you run elsewhere.',
      ],
    },
    guide: [
      {
        id: 'formats',
        toc: 'The three formats',
        heading: 'Pick the format the offer actually needs',
        paragraphs: [
          'Product-in-hand is the default when the object has to be visible: a bottle, a device, a package. Show-your-app is the same idea when the product is a screen. Unboxing is the open-the-box version of that story.',
          'You are not hoping a generic avatar happens to include the product. The format is the brief. Upload a product shot or pull one from the catalog, then write the hook.',
        ],
      },
      {
        id: 'after-the-clip',
        toc: 'After the first cut',
        heading: 'The first generation is a draft',
        paragraphs: [
          'Captions, length, and clarity are what make a clip feel native on a phone. Edit the on-screen text, extend, upscale, or remix before anyone sees it. The next variant can start from the same product with a different first line.',
          'If the clip is for organic, queue it to Instagram, TikTok, Facebook, Threads, LinkedIn, or X. If it is for paid, export the file and upload it in Ads Manager. Socialista schedules organic posts. Buying the media stays with you.',
        ],
      },
    ],
    example: {
      id: 'practice',
      toc: 'A hook test',
      heading: 'Three opening lines, one product photo',
      paragraphs: [
        'You have one product photo and three opening lines. You pick a creator whose energy fits the brand, choose product-in-hand, and generate the first clip with line one. The caption sits too low, so you move it. The ending feels short, so you extend it.',
        'Lines two and three are the same setup with a new hook. By the afternoon you have three files: one scheduled to TikTok, one to Reels, one downloaded for a test you will upload yourself. No shipping label, no usage-rights thread, no reshoot of the first three seconds.',
      ],
    },
    nudge: {
      title: 'Make the clip from the product you already have',
      body: 'A photo, a hook, and a creator. Then caption it and queue the post.',
    },
    limitsHeading: 'What this clip is, and is not',
    limits: [
      {
        title: 'Organic from here, ads elsewhere',
        description:
          'Schedule the clip to a connected account, or export it. Budgets, audiences, and ROAS stay in Meta, TikTok, or whichever ads manager you use.',
      },
      {
        title: 'Talking-head and product-in-hand',
        description:
          'Faceless carousels are slideshows. Template recreations and your own footage live in the video studio. This page is the UGC formats.',
      },
      {
        title: 'You can still film',
        description: 'Upload a clip you shot. The generator is for the posts you would otherwise leave blank.',
      },
    ],
    highlights: [
      {
        title: 'Proven UGC formats',
        description:
          'Product in hand, show your app, and unboxing presets—built for short-form, not a generic avatar clip.',
      },
      {
        title: 'Script to scroll-stopping hook',
        description:
          'Write or generate the hook, then refine on-screen captions before you publish.',
      },
      {
        title: 'From generation to post',
        description:
          'Finish the clip, then schedule to Instagram, TikTok, Facebook, Threads, LinkedIn, or X.',
      },
    ],
    useCases: [
      {
        title: 'Product-in-hand without a shoot',
        description:
          'You already have a product photo or catalog item. The UGC studio puts a creator on camera with that product instead of booking a film day for every SKU.',
      },
      {
        title: 'App demos that feel like a creator post',
        description:
          'Show-your-app is a format next to product-in-hand and unboxing. The screen is the product, and the clip is still a vertical social video.',
      },
      {
        title: 'A hook you can test this week',
        description:
          'Write the hook, generate the clip, then edit captions, extend, upscale, or remix before you export or schedule. The next variant starts from the same product.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Pick creator and voice',
        description: 'Match the talent to your offer and channel.',
      },
      {
        step: '02',
        title: 'Add product and hook',
        description: 'Upload a product shot or pull from your catalog, then shape the script.',
      },
      {
        step: '03',
        title: 'Generate and refine',
        description: 'Edit captions, extend, upscale, or remix—then export or schedule.',
      },
    ],
    proof: [
      { value: '3 formats', label: 'Product in hand, show your app, unboxing' },
      { value: 'Vertical', label: 'Built for Reels, TikTok, and paid social' },
      { value: '6 channels', label: 'Schedule organic posts after the clip is ready' },
    ],
    relatedSlugs: ['ai-influencers', 'ai-videos', 'ai-meta-ads', 'social-scheduling'],
    faqs: [
      {
        question: 'What is an AI UGC video generator?',
        answer:
          'It makes short-form talking-head video from a creator, your product, and a hook. Socialista includes product-in-hand, show-your-app, and unboxing formats, plus captions and a path to schedule the post.',
      },
      {
        question: 'Do I need to film anything?',
        answer:
          'No. Socialista generates the UGC from your product and brief. You can still upload your own clips when you want.',
      },
      {
        question: 'Which aspect ratios are supported?',
        answer:
          'The studio targets vertical social and ad sizes. Export when you need a file for paid campaigns elsewhere.',
      },
      {
        question: 'Can I post the UGC from Socialista?',
        answer:
          'Yes. Connect Instagram, TikTok, Facebook, Threads, LinkedIn, or X and schedule the organic post after the clip is ready.',
      },
      {
        question: 'Can I use this video as a paid ad?',
        answer:
          'Export the file and upload it in Meta, TikTok, or another ads manager. Socialista does not launch campaigns into ad accounts.',
      },
      {
        question: 'How is UGC different from the video studio?',
        answer:
          'UGC is talking-head and product-in-hand formats with AI creators. The video studio covers template-based and recreated short-form clips, plus your own footage.',
      },
    ],
  },
  {
    slug: 'ai-slideshows',
    category: 'create',
    name: 'AI Slideshows Generator',
    summary: 'Faceless carousels with hooks, slides, and captions in one flow.',
    metaTitle: 'AI Slideshow Generator for TikTok · Socialista',
    metaDescription:
      'Build faceless slideshows and carousels in one studio: hook, slide copy, and caption. Schedule them to TikTok, Instagram, and your other connected accounts.',
    media: 'slideshows',
    title: 'Faceless slideshows',
    titleAccent: 'that stop the swipe.',
    description:
      'Build a carousel in one studio: the hook, the words on each slide, and the caption. No camera. Schedule it to TikTok, Instagram, and the other accounts that support the format.',
    essay: {
      id: 'why',
      toc: 'Why slideshows',
      heading: 'Some of the best posts have no face in them',
      paragraphs: [
        'A tip, a list, a before-and-after, three things you changed. Those posts do not need a creator. They need a first slide that earns the swipe and a last slide that pays it off. Most teams build that across a notes app, a design file, and a caption box, then lose the thread.',
        'A slideshow in Socialista is that sequence in one place. You outline the story, write or generate the line on each slide, and set the caption. Pair the slides with product shots, brand assets, or [images from the studio](/features/ai-images). Then [queue the post](/features/social-scheduling) the way you would a video.',
      ],
    },
    guide: [
      {
        id: 'first-slide',
        toc: 'The first slide',
        heading: 'The first slide is the whole job',
        paragraphs: [
          'If the opener is vague, nobody reaches slide two. Write the hook as a claim a person would actually stop for, then let the later slides prove it. Keep the type readable on a phone. A caption that only works on a laptop fails in the feed.',
          'You can edit copy per slide. The outline is yours. The studio fills and revises it. You are not handing the story to a prompt and posting whatever comes back unread.',
        ],
      },
      {
        id: 'no-camera',
        toc: 'No camera',
        heading: 'The posting days you are not filming',
        paragraphs: [
          'Slideshows cover the calendar when you do not want a talking-head. Tips, lists, and product stories work as slides. An [AI influencer](/features/ai-influencers) is there for the days a person should be in frame.',
          'Music libraries stay inside TikTok and Instagram when you post natively. Socialista finishes the slides and the caption. The track, when you want one, still comes from the network.',
        ],
      },
    ],
    example: {
      id: 'practice',
      toc: 'A five-slide post',
      heading: 'A list, a product photo, two captions',
      paragraphs: [
        'You are explaining why a moisturizer pills under sunscreen. Slide one is the mistake. Slides two through four are the order, the amount, and the wait. Slide five is the product, using a photo you already have, and the caption tells people what to do next.',
        'You schedule it to TikTok and to Instagram, with a caption tuned for each. The creative is one slideshow. The lines around it are not. Tomorrow you can film, or you can make another list. The faceless day still shipped.',
      ],
    },
    nudge: {
      title: 'Outline the slides, then queue them',
      body: 'Hook, payoff, caption. A camera is optional.',
    },
    limitsHeading: 'Before you build a carousel',
    limits: [
      {
        title: 'Built for swipe feeds',
        description:
          'TikTok and Instagram carousels are the home for this. Schedule it wherever a connected account supports the format.',
      },
      {
        title: 'Your images are welcome',
        description: 'Product shots and brand assets go in the flow. So do stills you generate in the studio.',
      },
      {
        title: 'Sound stays in the native app',
        description:
          'Socialista delivers the slides and the caption. When the network supplies the music library, you add the track there.',
      },
    ],
    highlights: [
      {
        title: 'Built for swipe feeds',
        description:
          'Structure slides for retention: hook first, payoff last, captions readable on a phone.',
      },
      {
        title: 'No camera required',
        description:
          'Cover posting days when you are not on camera—pair with AI images or product shots.',
      },
      {
        title: 'Publish-ready output',
        description:
          'Export or schedule to the channels you connect. One caption flow per account.',
      },
    ],
    useCases: [
      {
        title: 'Faceless days on the calendar',
        description:
          'Not every post needs a face. Slideshows cover tips, lists, and product stories when you are not filming, using AI images or shots you already have.',
      },
      {
        title: 'A carousel with a real hook',
        description:
          'The first slide has to stop the swipe. You outline the story, then generate or edit copy per slide and the on-screen caption in the same flow.',
      },
      {
        title: 'One slideshow, several accounts',
        description:
          'Finish the slides once, then schedule to TikTok, Instagram, and the other connected accounts that support the format, with a caption per channel.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Start the slideshow',
        description: 'Pick a format and outline the story across slides.',
      },
      {
        step: '02',
        title: 'Fill slides and captions',
        description: 'Generate or edit copy per slide and the on-screen caption.',
      },
      {
        step: '03',
        title: 'Queue the post',
        description: 'Schedule to TikTok, Instagram, and the other connected accounts.',
      },
    ],
    proof: [
      { value: 'Faceless', label: 'Hooks, slides, and captions without a camera' },
      { value: 'Your images', label: 'Product shots and brand assets, or AI stills' },
      { value: 'Swipe feeds', label: 'Built for TikTok and Instagram carousels' },
    ],
    relatedSlugs: ['ai-images', 'ai-videos', 'social-scheduling', 'social-analytics'],
    faqs: [
      {
        question: 'What is an AI slideshow generator?',
        answer:
          'It builds faceless slideshows and carousels in one studio: the hook, the copy on each slide, and the caption. You export the file or schedule it to a connected account.',
      },
      {
        question: 'Is this only for TikTok?',
        answer:
          'Slideshows are built for short-form swipe feeds. You can schedule them wherever your connected accounts support the format, including Instagram.',
      },
      {
        question: 'Can I use my own images?',
        answer:
          'Yes. Bring product shots and brand assets into the slideshow flow, or pair slides with images you generate in the studio.',
      },
      {
        question: 'Does Socialista add music?',
        answer:
          'You finish the creative in the studio and export or publish. Platform music libraries stay in each app when you post natively.',
      },
      {
        question: 'Can I schedule a slideshow?',
        answer:
          'Yes. Queue it like any other post, with a caption per connected account, from the same calendar.',
      },
      {
        question: 'Do I need an AI creator for slideshows?',
        answer:
          'No. Slideshows are faceless. Use them on days you do not want a talking-head, and use the AI influencer generator when you do.',
      },
    ],
  },
  {
    slug: 'ai-meta-ads',
    category: 'create',
    name: 'AI Meta Ads Templates',
    summary: 'Static frames from one product photo—headline and CTA in place.',
    metaTitle: 'AI Static Ad Generator for Meta · Socialista',
    metaDescription:
      'Turn one product photo into a static Meta ad with the headline and CTA in the frame. Export the still for Ads Manager. Socialista does not launch the campaign.',
    media: 'static-ads',
    title: 'Static Meta ads',
    titleAccent: 'from a photo you have.',
    description:
      'Turn one product photo into a static frame with the headline and the call to action still readable. Export it for Ads Manager. Socialista makes the creative. You launch the campaign.',
    essay: {
      id: 'why',
      toc: 'Why statics',
      heading: 'The offer has to survive a thumb',
      paragraphs: [
        'A careful product photo often fails as an ad because the offer lives in a caption people never open. On a paid placement, the headline and the button have to live in the picture. A packshot dropped on an empty square is how a lot of accounts spend the first week learning that.',
        'Static templates in Socialista start from a layout that keeps the offer, the headline, and the call to action in one frame. You bring the bottle, the app screenshot, or the product photo you already have. You generate variants, then download the stills and upload them where you buy media.',
      ],
    },
    guide: [
      {
        id: 'one-photo',
        toc: 'One photo',
        heading: 'New product, same layout',
        paragraphs: [
          'When a layout is working, the next job is the next product in that layout. Upload the photo, pick the template, and keep the structure that holds the price, the promise, and the button.',
          'The same photo can carry more than one headline. Generate the variants, keep the frames you would actually test, and leave the rest. You are building a set.',
        ],
      },
      {
        id: 'organic-too',
        toc: 'Organic too',
        heading: 'The still can be a post, too',
        paragraphs: [
          'A static frame is also an image. [Schedule it](/features/social-scheduling) to a connected account, or export it for a paid campaign. Both can be true in the same week.',
          'Pair it with a [UGC clip](/features/ai-ugc-video) of the same product. The video and the still sit in the workspace library. You schedule them as separate posts. The ad account, if you use one, is still yours to operate.',
        ],
      },
    ],
    example: {
      id: 'practice',
      toc: 'Three headlines',
      heading: 'Three headlines, one bottle',
      paragraphs: [
        'The photo is a front-lit bottle on a table. You already know the offer: a subscription, a first-order price, a bundle. The template puts the price high in the frame. You generate it with headline A, then headline B, then a version that leads with the bundle.',
        'You export two for Ads Manager and schedule the third as an organic image, with a caption written for Instagram. The bottle was not reshot. The campaign itself you launch in Meta, where the spend lives.',
      ],
    },
    nudge: {
      title: 'Put the offer in the frame',
      body: 'Start from the product photo. Leave with a still you can export or post.',
    },
    limitsHeading: 'Before you export a frame',
    limits: [
      {
        title: 'Ads Manager stays Ads Manager',
        description:
          'Socialista does not create campaigns, set budgets, or report return on ad spend. You upload the file where you buy the media.',
      },
      {
        title: 'You still need a real offer',
        description:
          'Templates hold the layout. They do not invent a price, a promise, or a reason to tap. Bring those with the photo.',
      },
      {
        title: 'Different from a lifestyle still',
        description:
          '[Image templates](/features/ai-images) are for feed and lifestyle frames. Statics are the ones with the headline and call to action baked into the picture.',
      },
    ],
    highlights: [
      {
        title: 'Layouts built for paid social',
        description:
          'Templates keep offer, headline, and CTA visible in one clear frame—not a cropped product on empty space.',
      },
      {
        title: 'One photo, many variants',
        description:
          'Generate several hooks from the same product image without a reshoot.',
      },
      {
        title: 'Export for Ads Manager',
        description:
          'Download ad-ready stills. Socialista schedules organic posts; it does not launch into ad accounts.',
      },
    ],
    useCases: [
      {
        title: 'A new SKU on a layout that already works',
        description:
          'You are not redesigning the ad. Upload the bottle, app screenshot, or product photo, pick a template, and keep the structure that holds the offer.',
      },
      {
        title: 'Several hooks from one photo',
        description:
          'The same product image can carry more than one headline. Generate variants, then export the frames you want to test in Ads Manager.',
      },
      {
        title: 'Statics for organic, too',
        description:
          'The same still can be an image post. Schedule it to a connected account or download the file for a paid campaign elsewhere.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Add the product',
        description: 'Upload the bottle, app screenshot, or SKU photo you already have.',
      },
      {
        step: '02',
        title: 'Pick a template',
        description: 'Start from a layout tuned for static paid social.',
      },
      {
        step: '03',
        title: 'Generate the frame',
        description: 'Lock headline and CTA, then export or pair with a UGC clip in your calendar.',
      },
    ],
    proof: [
      { value: 'One photo', label: 'Headline and CTA from a product shot you have' },
      { value: 'Many hooks', label: 'Variants without a reshoot' },
      { value: 'Export', label: 'Files for Ads Manager, not a campaign launch' },
    ],
    relatedSlugs: ['ai-ugc-video', 'ai-images', 'ai-influencers', 'social-scheduling'],
    faqs: [
      {
        question: 'Does this replace Meta Ads Manager?',
        answer:
          'No. Socialista makes the static creative. You upload or connect ads in Meta, TikTok, or wherever you buy media.',
      },
      {
        question: 'What do I need to start?',
        answer:
          'A product photo you already have—a bottle, an app screenshot, or a SKU shot—and the offer you want in the headline and CTA.',
      },
      {
        question: 'Do I need a designer?',
        answer:
          'No. Templates carry the structure. You supply the product and the offer.',
      },
      {
        question: 'Can I use statics in organic posts?',
        answer:
          'Yes. Schedule image posts to connected accounts or export the file.',
      },
      {
        question: 'How is this different from AI image generation?',
        answer:
          'Image templates cover feed and lifestyle stills. Static ads use conversion-focused layouts with the headline and CTA baked into the frame.',
      },
      {
        question: 'Can I pair a static with a UGC clip?',
        answer:
          'Yes. Both live in the workspace library, so you can schedule the still and the video as separate posts from the same calendar.',
      },
    ],
  },
  {
    slug: 'ai-images',
    category: 'create',
    name: 'AI Image Generation',
    summary: 'Product shots, lifestyle frames, and ad-ready stills from templates.',
    metaTitle: 'AI Image Generator for Social Posts · Socialista',
    metaDescription:
      'Generate product shots and feed-ready stills from image templates. Use them in slideshows, carousels, and scheduled posts from the same workspace.',
    media: 'images',
    title: 'Images for the feed',
    titleAccent: 'without a blank prompt.',
    description:
      'Start from a template built for social, not an empty box. Product shots and lifestyle frames stay in the workspace, ready for a post, a slideshow, or the photo behind a static ad.',
    essay: {
      id: 'why',
      toc: 'Why templates',
      heading: 'A blank prompt is a slow way to get a still',
      paragraphs: [
        '“Make it look expensive” is not a brief. Teams lose an afternoon nudging a prompt, then post a frame that does not match the product or the channel. The next post starts from zero again.',
        'Image generation in Socialista starts from a template: a shot style that already fits a feed or an ad. You swap the product and the copy. Brands and products saved in the workspace carry into the next generation, so you are not retyping the offer every time you need another frame.',
      ],
    },
    guide: [
      {
        id: 'where-stills-go',
        toc: 'Where stills go',
        heading: 'A still should have a next step',
        paragraphs: [
          'The useful question is where the image goes after it exists. A feed post. A slide in a [slideshow](/features/ai-slideshows). The product photo behind a [static ad](/features/ai-meta-ads). Outputs stay in the workspace library, next to UGC and video, so the week is one set of files.',
          'Teammates see the same generations. The still is not trapped in a personal login on a model website.',
        ],
      },
      {
        id: 'catalog',
        toc: 'Your catalog',
        heading: 'The catalog is the brief',
        paragraphs: [
          'If the brand and the product already live in the workspace, that context is the starting point. You pick the template that matches the channel, add the asset for this post, and generate.',
          'You do not need a background in writing prompts. The layout is chosen. Your job is the product and the line you want in the picture.',
        ],
      },
    ],
    example: {
      id: 'practice',
      toc: 'A quiet Thursday',
      heading: 'The Thursday still, when nobody is filming',
      paragraphs: [
        'The week already has a UGC clip and a slideshow. Thursday needs something square and quiet: the product on a surface, the name readable, no creator. You pick a template, pull the product from the catalog, and generate two frames. One is over-styled. One looks like a photo you might have taken.',
        'You schedule that second frame with a caption for Instagram, and you keep the file. Next week the same product can sit on slide three of a carousel, without a new photoshoot and without hunting for the PNG in a chat thread.',
      ],
    },
    nudge: {
      title: 'Pick a template and make the still',
      body: 'Use it in a post, a slideshow, or the next static ad.',
    },
    limitsHeading: 'Before you generate a frame',
    limits: [
      {
        title: 'Templates, not a blank box',
        description: 'You browse layouts built for social and ads, then change the product and the copy.',
      },
      {
        title: 'Shared with the workspace',
        description: 'Generations and uploads live in the library your team already uses.',
      },
      {
        title: 'Models follow the plan',
        description:
          'The studio shows which models a plan includes. Start free, and upgrade when you need more capacity.',
      },
    ],
    highlights: [
      {
        title: 'Templates, not blank prompts',
        description:
          'Browse layouts built for social and ads, then swap product and copy.',
      },
      {
        title: 'Fits the rest of the studio',
        description:
          'Use images in slideshows, carousels, and posts alongside UGC and static ads.',
      },
      {
        title: 'Brand context carries over',
        description:
          'Products and brands saved in the workspace inform what you generate next.',
      },
    ],
    useCases: [
      {
        title: 'A still for a day you are not filming',
        description:
          'Pick a template that matches the channel, add the product or brief, and generate a frame you can schedule or drop into a slideshow.',
      },
      {
        title: 'Product and lifestyle from the catalog',
        description:
          'Brands and products saved in the workspace are the inputs. You are not retyping the offer every time you need another shot.',
      },
      {
        title: 'Stills that feed the other formats',
        description:
          'The same image can be a feed post, a slideshow slide, or the product shot behind a static ad. Outputs stay in the workspace library.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Choose a template',
        description: 'Pick a shot style that matches the channel and offer.',
      },
      {
        step: '02',
        title: 'Add product or brief',
        description: 'Pull from your catalog or upload the asset for this post.',
      },
      {
        step: '03',
        title: 'Generate and use',
        description: 'Download, schedule, or drop the still into a slideshow.',
      },
    ],
    proof: [
      { value: 'Templates', label: 'Social and ad layouts, not a blank prompt' },
      { value: 'One library', label: 'Stills next to UGC, slideshows, and ads' },
      { value: 'Shared', label: 'Generations live in the workspace' },
    ],
    relatedSlugs: ['ai-meta-ads', 'ai-slideshows', 'ai-videos', 'social-scheduling'],
    faqs: [
      {
        question: 'Is this separate from static ads?',
        answer:
          'Image templates cover feed and lifestyle stills. Static ads use conversion-focused layouts with headline and CTA baked in.',
      },
      {
        question: 'Which models power images?',
        answer:
          'Paid plans include the model catalog shown in the studio. Start free and upgrade when you need more capacity.',
      },
      {
        question: 'Can my team share outputs?',
        answer:
          'Yes. Generations and uploads live in the workspace library.',
      },
      {
        question: 'Can I use these images in a slideshow?',
        answer:
          'Yes. Generate the still, then bring it into the slideshow flow with your product shots and brand assets.',
      },
      {
        question: 'Do I need a prompt-writing background?',
        answer:
          'No. You start from a template built for social or ads, then swap the product and the copy.',
      },
      {
        question: 'Can I schedule an image post?',
        answer:
          'Yes. Connect an account and queue the still, with a caption for that channel, from the same studio.',
      },
    ],
  },
  {
    slug: 'ai-videos',
    category: 'create',
    name: 'AI Video Generation',
    summary: 'Recreate a reference clip or template—then caption and trim in the editor.',
    metaTitle: 'AI Short-Form Video Generator · Socialista',
    metaDescription:
      'Generate short-form video from a template or a reference clip, then caption and trim in the editor. Schedule it to Instagram, TikTok, and the other channels you connect.',
    media: 'videos',
    title: 'Short-form video',
    titleAccent: 'from a format that works.',
    description:
      'Start from a studio template or a reference clip, then trim and caption in the editor. This is short-form for the channels you connect, including footage you upload yourself.',
    essay: {
      id: 'why',
      toc: 'Why this studio',
      heading: 'You already know which videos feel native',
      paragraphs: [
        'The hard part of short-form is rarely “make a video exist.” It is matching a format people already watch: the pacing, the on-screen line, the cut before the hook gets bored. A blank timeline does not tell you any of that.',
        'The video studio starts from a template or a reference clip you already like. You generate, then trim and caption before anyone sees it. Finished files sit in the same library as [UGC](/features/ai-ugc-video) and [slideshows](/features/ai-slideshows), and they [schedule](/features/social-scheduling) the same way.',
      ],
    },
    guide: [
      {
        id: 'reference',
        toc: 'Start from a reference',
        heading: 'A reference is a better brief than an adjective',
        paragraphs: [
          '“Punchy” means nothing once you are in the editor. A clip that already holds attention, or a template with that shape, is a brief. You bring the product and the line. The structure comes from something that has earned a watch before.',
          'Then you make it yours. On-screen text has to be readable on a phone. Doing that in a second app is how the caption drifts off the hook.',
        ],
      },
      {
        id: 'your-footage',
        toc: 'Your footage',
        heading: 'Your own camera roll counts',
        paragraphs: [
          'Upload a clip, caption it, and put it on the calendar next to the generated video. A week of posting is a mix. Some days are generated. Some days are you, a founder, or a customer who sent a file.',
          'This is not a long-form YouTube desk. The channels are the ones you connect: Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
        ],
      },
    ],
    example: {
      id: 'practice',
      toc: 'Borrow the shape',
      heading: 'Keep the structure, rewrite the line',
      paragraphs: [
        'A reference clip opens on the result, shows three steps, and ends on the product. You like the shape. You would not post that video. You start from it, swap in your product, and rewrite the on-screen lines so they sound like you.',
        'You trim the middle, where it wandered, and check the caption against a phone-sized frame. Then you schedule it. The next test can be the same structure with a sharper first line, without rebuilding a timeline from an empty project.',
      ],
    },
    nudge: {
      title: 'Start from a clip you already trust',
      body: 'Trim it, caption it, and queue it with the rest of the week.',
    },
    limitsHeading: 'Before you open the editor',
    limits: [
      {
        title: 'UGC is a different door',
        description:
          'Talking-head and product-in-hand with AI creators are the UGC studio. Here you recreate short-form, start from a template, or cut your own footage.',
      },
      {
        title: 'Captions live in the editor',
        description: 'You do not need a separate caption tool to make the hook readable before you export or queue the post.',
      },
      {
        title: 'Short-form channels',
        description:
          'Publish to Instagram, TikTok, Facebook, Threads, LinkedIn, and X. This flow is not a long-form YouTube publisher.',
      },
    ],
    highlights: [
      {
        title: 'Start from what already works',
        description:
          'Use studio templates or a reference clip as the brief instead of a blank timeline.',
      },
      {
        title: 'Captions in the same place',
        description:
          'Edit on-screen text and pacing before you export or schedule.',
      },
      {
        title: 'Pairs with UGC and slideshows',
        description:
          'One library for every format you post this week.',
      },
    ],
    useCases: [
      {
        title: 'Recreate a format that already performs',
        description:
          'Start from a studio template or a reference clip instead of an empty timeline. The brief is a video you already know works.',
      },
      {
        title: 'Caption and trim before it ships',
        description:
          'On-screen text and pacing stay in the editor. You are not exporting to a second app just to make the hook readable on a phone.',
      },
      {
        title: 'Your own footage, same calendar',
        description:
          'Upload a clip, caption it, and schedule it next to UGC and slideshows. One library covers the week.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Pick a template or reference',
        description: 'Choose a starting point that matches the hook you want.',
      },
      {
        step: '02',
        title: 'Generate and edit',
        description: 'Trim, caption, and adjust until it reads native on a phone.',
      },
      {
        step: '03',
        title: 'Publish or export',
        description: 'Schedule to connected accounts or download the file.',
      },
    ],
    proof: [
      { value: 'Short-form', label: 'Templates and reference clips, not long-form' },
      { value: 'In-editor', label: 'Captions and trims before you export' },
      { value: 'Your clips', label: 'Upload footage, caption it, and schedule' },
    ],
    relatedSlugs: ['ai-ugc-video', 'ai-slideshows', 'ai-images', 'social-scheduling'],
    faqs: [
      {
        question: 'Is this the same as UGC?',
        answer:
          'UGC is talking-head and product-in-hand formats with AI creators. Video generation covers template-based and recreated short-form clips in the video studio.',
      },
      {
        question: 'Can I upload my own footage?',
        answer:
          'Yes. Bring clips into the editor, caption them, and schedule.',
      },
      {
        question: 'Does it post to YouTube long-form?',
        answer:
          'Socialista focuses on short-form social channels you connect: Instagram, TikTok, Facebook, Threads, LinkedIn, and X.',
      },
      {
        question: 'Can I start from a video I already like?',
        answer:
          'Yes. Use a studio template or a reference clip as the brief, then trim and caption the result.',
      },
      {
        question: 'Where do finished videos go?',
        answer:
          'They live in the workspace library with your UGC, slideshows, and images, ready to export or schedule.',
      },
      {
        question: 'Do I need a separate caption tool?',
        answer:
          'No. On-screen text is edited in the same studio before you export or queue the post.',
      },
    ],
  },
  {
    slug: 'social-scheduling',
    category: 'publish',
    name: 'Social Media Scheduling',
    summary: 'One creative, native ratios, and a caption per connected account.',
    metaTitle: 'Social Media Scheduling Tool · Socialista',
    metaDescription:
      'Schedule organic posts to Instagram, TikTok, Facebook, Threads, LinkedIn, and X. One creative, a caption per account, and a week view in the same studio.',
    media: 'scheduling',
    title: 'Schedule the post',
    titleAccent: 'where you made it.',
    description:
      'Connect Instagram, TikTok, Facebook, Threads, LinkedIn, and X. One creative, a caption written for each account, and a week view so tomorrow is not a surprise.',
    essay: {
      id: 'why',
      toc: 'Why schedule here',
      heading: 'The creative is done. Publishing is still a chore.',
      paragraphs: [
        'Making the video and publishing the video are usually two jobs in two tools. You export, open the native app, retype a caption that does not fit, forget LinkedIn, and find out on Friday that Thursday never went out.',
        'Scheduling in Socialista is the second half of the studio. The UGC clip, slideshow, still, or short video is already in the library. You connect the accounts, write the line that fits each one, and pick the time. Post now if it is ready. Park it if the week needs a plan.',
      ],
    },
    guide: [
      {
        id: 'caption-per-account',
        toc: 'A caption each',
        heading: 'Same file, different sentence',
        paragraphs: [
          'Instagram can carry a longer line. TikTok often wants the hook again, shorter. LinkedIn wants the context. X wants one clean claim. The creative stays put. The copy changes per connected account, before you queue anything.',
          'That is the difference between dropping one file everywhere and actually posting. The picture can be shared. The sentence usually should not be copied verbatim.',
        ],
      },
      {
        id: 'the-week',
        toc: 'The week',
        heading: 'One calendar, every account you connected',
        paragraphs: [
          'Scheduled posts sit on a week view across those accounts. You can see that Wednesday is stacked and Monday is empty without opening six apps to check.',
          'Move a post on that calendar before it goes live, within what each platform allows. Teammates in the workspace share the accounts and the queue. The plan is not a private spreadsheet.',
        ],
      },
    ],
    example: {
      id: 'practice',
      toc: 'One afternoon',
      heading: 'One clip, three accounts, one afternoon',
      paragraphs: [
        'The UGC clip is finished at two. You write a TikTok caption that repeats the hook, a Reels caption that adds the offer, and a shorter one for X. TikTok goes tomorrow morning. Reels goes Thursday. X goes in an hour, because the conversation is happening today.',
        'On Wednesday you move Thursday’s Reel to Friday. You do it on the calendar. The file never left the workspace, and you did not rebuild the post in three native apps.',
      ],
    },
    nudge: {
      title: 'Connect an account and queue one post',
      body: 'Caption it for that channel. The rest of the week can follow.',
    },
    limitsHeading: 'Before you connect a channel',
    limits: [
      {
        title: 'Six networks, organic posts',
        description:
          'Instagram, TikTok, Facebook, Threads, LinkedIn, and X. Each account connects from the workspace.',
      },
      {
        title: 'Paid campaigns stay outside',
        description: 'Scheduling publishes organic posts. Export the creative if the destination is an ads manager.',
      },
      {
        title: 'Each network still has rules',
        description: 'You can edit and reschedule before a post goes live, inside what that platform allows.',
      },
    ],
    highlights: [
      {
        title: 'A caption per channel',
        description:
          'Tune copy for each connected account while the creative stays in one place.',
      },
      {
        title: 'Calendar across accounts',
        description:
          'See scheduled posts in a week view—every channel, one studio.',
      },
      {
        title: 'Post now or later',
        description:
          'Publish immediately after generation or line up the week in advance.',
      },
    ],
    useCases: [
      {
        title: 'One video, six possible captions',
        description:
          'The creative stays put. You write the line that fits Instagram, then a different one for TikTok, LinkedIn, or X, and queue each account on its own.',
      },
      {
        title: 'The week visible in one place',
        description:
          'Scheduled posts sit on a calendar across the accounts you connected. You are not checking six native apps to see what goes out tomorrow.',
      },
      {
        title: 'Publish the moment a clip is done',
        description:
          'Post now after generation, or park it for later in the week. Reschedule from the calendar before it goes live, within what each platform allows.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Connect accounts',
        description: 'OAuth into the channels your workspace publishes to.',
      },
      {
        step: '02',
        title: 'Finish the creative',
        description: 'UGC, static, slideshow, image, or video—from the same library.',
      },
      {
        step: '03',
        title: 'Schedule the post',
        description: 'Pick time and account, preview the caption, and queue it.',
      },
    ],
    proof: [
      { value: '6 networks', label: 'Instagram, TikTok, Facebook, Threads, LinkedIn, X' },
      { value: 'Per account', label: 'A caption for each connected profile' },
      { value: 'Week view', label: 'Every queued post on one calendar' },
    ],
    relatedSlugs: ['social-analytics', 'ai-ugc-video', 'ai-slideshows', 'ai-meta-ads'],
    faqs: [
      {
        question: 'Which networks can I schedule to?',
        answer:
          'Instagram, TikTok, Facebook, Threads, LinkedIn, and X. You connect each account with OAuth from the workspace.',
      },
      {
        question: 'Can I write a different caption per channel?',
        answer:
          'Yes. The creative stays in one place. Copy is tuned for each connected account before you queue the post.',
      },
      {
        question: 'Can I edit after scheduling?',
        answer:
          'Reschedule and update posts from the calendar before they go live, within what each platform allows.',
      },
      {
        question: 'Does Socialista buy ads?',
        answer:
          'No. Scheduling is for organic posts to connected accounts. Export creatives if you run paid elsewhere.',
      },
      {
        question: 'Can I post immediately?',
        answer:
          'Yes. Publish as soon as the creative is ready, or schedule it for later in the week.',
      },
      {
        question: 'Do teammates share the same calendar?',
        answer:
          'Yes. People in the workspace share the connected accounts and the posts queued to them.',
      },
    ],
  },
  {
    slug: 'social-analytics',
    category: 'publish',
    name: 'Social Media Analytics',
    summary: 'Reach and engagement on the accounts you connect—no export.',
    metaTitle: 'Social Media Analytics for Organic Posts · Socialista',
    metaDescription:
      'See reach and engagement for each connected social account, next to the posts you shipped. Organic performance, not paid return inside an ads manager.',
    media: 'analytics',
    title: 'See what reached people',
    titleAccent: 'then make another.',
    description:
      'Reach and engagement for each account you connect, next to the posts you shipped from the studio. Organic numbers, read where the creative already lives.',
    essay: {
      id: 'why',
      toc: 'Why measure here',
      heading: 'A spike you cannot find again is just a nice week',
      paragraphs: [
        'A lot of teams screenshot insights, paste them in a doc, and still cannot remember which hook it was. The number and the file live in different places, so the next post is a guess with confidence.',
        'Analytics in Socialista reads reach and engagement on the profiles you connect. The figures sit beside the posts and generations from the studio. When something moves, you are already in the workspace that can [remix the clip](/features/ai-ugc-video) or [queue a follow-up](/features/social-scheduling).',
      ],
    },
    guide: [
      {
        id: 'per-account',
        toc: 'Per account',
        heading: 'Each profile on its own',
        paragraphs: [
          'Instagram and TikTok do not owe you the same number. One blended total hides which account actually carried the week. You look at each connected profile in one place, instead of reconstructing the week from native insight tabs.',
          'The accounts are the ones you can publish to: Instagram, TikTok, Facebook, Threads, LinkedIn, and X. Metrics show up for what you publish or schedule from Socialista.',
        ],
      },
      {
        id: 'next-creative',
        toc: 'The next post',
        heading: 'The useful question is what to make tomorrow',
        paragraphs: [
          'If a slideshow format moved and the talking-head did not, you want to see that next to the posts themselves, not next to a filename nobody recognizes. The chart is there so the next creative has a starting point.',
          'Paid results stay in the ads manager. Socialista is the organic side: the accounts you connected and the creatives you shipped to them.',
        ],
      },
    ],
    example: {
      id: 'practice',
      toc: 'Monday review',
      heading: 'Monday, looking at last week',
      paragraphs: [
        'Last week you shipped four posts. The product-in-hand Reel is the one that reached people. The static image was quiet. You open the Reel from the same workspace, keep the creator, and write a new first line that leans into the claim that worked.',
        'You schedule the follow-up for Wednesday. You are not exporting a spreadsheet to remember which file it was. The number and the creative were already next to each other.',
      ],
    },
    nudge: {
      title: 'Connect an account and read last week',
      body: 'Then remake the post that moved, from the same studio.',
    },
    limitsHeading: 'What the numbers cover',
    limits: [
      {
        title: 'Reach and engagement',
        description:
          'That is the report: organic performance on each connected profile. Paid return on ad spend stays in the ads manager.',
      },
      {
        title: 'The workspace shares it',
        description: 'Teammates see publishing and analytics for the accounts you connect.',
      },
      {
        title: 'History follows the plan',
        description: 'Account and history limits are shown at checkout. The page reports what the connected accounts actually return.',
      },
    ],
    highlights: [
      {
        title: 'Per-account metrics',
        description:
          'See how each connected profile performs without juggling platform tabs.',
      },
      {
        title: 'Creative context',
        description:
          'Analytics sit next to the posts and generations you shipped from the studio.',
      },
      {
        title: 'Organic focus',
        description:
          'Metrics reflect connected social accounts—not ad-account ROAS inside Meta or TikTok Ads.',
      },
    ],
    useCases: [
      {
        title: 'Which account actually moved',
        description:
          'Reach and engagement are per connected profile. You can see Instagram next to TikTok without opening each app’s insights tab.',
      },
      {
        title: 'Tie a spike back to the creative',
        description:
          'Numbers sit beside the posts and generations from the studio, so the hook you remake is the one that shipped—not a guess from a screenshot.',
      },
      {
        title: 'A reason to queue the next test',
        description:
          'When a format moves, you are already in the workspace that made it. Remix the hook and schedule the follow-up from the same place.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Connect and publish',
        description: 'Schedule or post from Socialista so data has something to measure.',
      },
      {
        step: '02',
        title: 'Open analytics',
        description: 'Review reach and engagement for the accounts in your workspace.',
      },
      {
        step: '03',
        title: 'Iterate in the studio',
        description: 'Remix the hook or format that moved, then queue the next test.',
      },
    ],
    proof: [
      { value: 'Per account', label: 'Reach and engagement for each profile' },
      { value: 'In context', label: 'Next to the posts you shipped' },
      { value: 'Organic', label: 'Connected profiles, not ad-account ROAS' },
    ],
    relatedSlugs: ['social-scheduling', 'ai-ugc-video', 'ai-videos', 'ai-slideshows'],
    faqs: [
      {
        question: 'What does Socialista analytics measure?',
        answer:
          'Reach and engagement on the social accounts you connect and publish to. It is organic performance for those profiles, not a paid ads dashboard.',
      },
      {
        question: 'Do I need a paid plan for analytics?',
        answer:
          'Analytics are available for connected accounts in the workspace. Plan limits for accounts and history are shown at checkout.',
      },
      {
        question: 'Does this replace Meta Ads reporting?',
        answer:
          'No. Socialista reports on organic posts to connected social profiles, not paid campaigns in ad accounts.',
      },
      {
        question: 'Can my team see the same numbers?',
        answer:
          'Teammates in the workspace share publishing and analytics for the accounts you connect.',
      },
      {
        question: 'Which accounts show up?',
        answer:
          'The ones you connect: Instagram, TikTok, Facebook, Threads, LinkedIn, and X. Metrics appear after you publish or schedule from Socialista.',
      },
      {
        question: 'Can I export a spreadsheet of ad ROAS?',
        answer:
          'No. There is no ad-account ROAS report. Use each ads manager for paid results, and Socialista for the organic accounts you connected.',
      },
    ],
  },
] as const satisfies readonly Feature[]

export type FeatureSlug = (typeof FEATURES)[number]['slug']

export function getFeature(slug: string) {
  return FEATURES.find(feature => feature.slug === slug)
}

export function featurePath(slug: string) {
  return `/features/${slug}`
}

export function featuresByCategory(category: FeatureCategory) {
  return FEATURES.filter(feature => feature.category === category)
}

export function relatedFeatures(slug: string) {
  const feature = getFeature(slug)
  if (!feature) return []
  return feature.relatedSlugs.flatMap(relatedSlug => {
    const related = getFeature(relatedSlug)
    return related ? [related] : []
  })
}

export const FEATURE_START_HERE = [
  {
    slug: 'ai-ugc-video',
    note: 'A talking-head with your product in frame, without booking a shoot.',
  },
  {
    slug: 'ai-influencers',
    note: 'One saved creator, reused on clips, stills, and ads.',
  },
  {
    slug: 'ai-slideshows',
    note: 'Faceless carousels for the days nobody is filming.',
  },
  {
    slug: 'social-scheduling',
    note: 'The same creative, a caption per account, one week view.',
  },
] as const satisfies readonly { slug: FeatureSlug; note: string }[]

export type FeatureTocItem = {
  id: string
  label: string
}

export function featureToc(feature: Feature): readonly FeatureTocItem[] {
  return [
    { id: feature.essay.id, label: feature.essay.toc },
    ...feature.guide.map(section => ({ id: section.id, label: section.toc })),
    { id: feature.example.id, label: feature.example.toc },
    { id: 'highlights', label: 'What you get' },
    { id: 'use-cases', label: "Who it's for" },
    { id: 'how', label: 'How it works' },
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

/** Rough read time for the guide body. Rounded, with a floor so short pages still feel like a read. */
export function featureReadingMinutes(feature: Feature) {
  const words = countWords([
    feature.description,
    feature.essay.heading,
    ...feature.essay.paragraphs,
    ...feature.guide.flatMap(section => [section.heading, ...section.paragraphs]),
    feature.example.heading,
    ...feature.example.paragraphs,
    feature.limitsHeading,
    ...feature.limits.flatMap(item => [item.title, item.description]),
    ...feature.highlights.flatMap(item => [item.title, item.description]),
    ...feature.useCases.flatMap(item => [item.title, item.description]),
    ...feature.steps.flatMap(item => [item.title, item.description]),
    ...feature.faqs.flatMap(item => [item.question, item.answer]),
  ])
  return Math.max(4, Math.round(words / 200))
}
