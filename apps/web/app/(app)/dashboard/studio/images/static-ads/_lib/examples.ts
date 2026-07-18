import type { StaticAdAspectRatio } from './types'

export type StaticAdExample = {
  id: string
  title: string
  hook: string
  prompt: string
  aspectRatio: StaticAdAspectRatio
  imageUrl: string
  trending?: boolean
}

export const STATIC_AD_EXAMPLES: StaticAdExample[] = [
  {
    id: 'ugc-skincare-selfie',
    title: 'Skincare UGC selfie',
    hook: 'Authentic creator holding the product',
    prompt:
      'Scroll-stopping hook about dull skin, a young woman taking a casual iPhone selfie in her bathroom holding a skincare serum toward the camera, bold headline "Glow skin in 7 days" with "Shop now" CTA button, soft window light, authentic UGC Facebook ad aesthetic',
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=711&fit=crop',
    trending: true,
  },
  {
    id: 'product-hero-bottle',
    title: 'Premium product hero',
    hook: 'Clean DTC bottle shot',
    prompt:
      'Premium skincare bottle centered on a soft beige gradient, subtle shadow, bold headline "Your daily glow ritual" with "Try free" CTA button, clean minimal DTC Facebook feed ad',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1620916564558-4facafa5d63b?w=400&h=400&fit=crop',
    trending: true,
  },
  {
    id: 'lifestyle-desk',
    title: 'Desk lifestyle',
    hook: 'Product in a morning routine',
    prompt:
      'Wireless earbuds next to a coffee cup and notebook on a marble desk, soft morning sunlight, muted neutral tones, lifestyle product photography for Facebook feed',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  },
  {
    id: 'flat-lay-kit',
    title: 'Flat lay kit',
    hook: 'Styled top-down product story',
    prompt:
      'Minimalist flat lay of a beauty kit with soft pastel props on linen fabric, top-down view, soft diffused light, Facebook-ready Meta ad',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
  },
  {
    id: 'founder-office',
    title: 'Founder story',
    hook: 'Trust-building talking head',
    prompt:
      'Scroll-stopping hook for busy founders, a confident female founder recording herself in a bright home office, bold headline "Built for busy founders" with "Start free" CTA, authentic startup Facebook ad aesthetic',
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=711&fit=crop',
    trending: true,
  },
  {
    id: 'launch-saas',
    title: 'SaaS launch',
    hook: 'Modern launch teaser visual',
    prompt:
      'Clean SaaS product launch visual, floating laptop mockup showing a dashboard UI, soft purple and white gradient background, modern startup aesthetic, space for headline text',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
  },
  {
    id: 'carousel-tip',
    title: 'Carousel tip slide',
    hook: 'Swipeable educational slide',
    prompt:
      'Professional carousel slide background, soft blue gradient with subtle geometric shapes, clean corporate aesthetic, large empty center for bold white headline text',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=400&fit=crop',
  },
  {
    id: 'bold-offer',
    title: 'Bold offer',
    hook: 'High-contrast offer creative',
    prompt:
      'Bold typographic Facebook ad with high contrast black and neon accents, headline "50% off this week" with "Claim deal" CTA button, punchy scroll-stopping composition',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop',
  },
  {
    id: 'unboxing-moment',
    title: 'Unboxing reveal',
    hook: 'First-impression product reveal',
    prompt:
      'A creator unboxing a package at their desk, genuine excitement, natural indoor lighting, authentic unboxing UGC style, product visible in hands, casual home setting',
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7d745fa673?w=400&h=711&fit=crop',
  },
  {
    id: 'demo-pour',
    title: 'Demo in action',
    hook: 'Hands-on benefit moment',
    prompt:
      'Hands pouring a premium coffee bag into a mug on a wooden counter, steam rising, warm morning light, clear product packaging visible, authentic demo style Facebook ad',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
  },
  {
    id: 'tiktok-reaction',
    title: 'Reaction hook',
    hook: 'Stop the scroll in 0.5s',
    prompt:
      'Scroll-stopping reaction hook, a creator mid-reaction in first-person iPhone selfie, eyes wide with surprise pointing at the product, bold colorful bedroom background, vertical Facebook Stories energy, high contrast',
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=711&fit=crop',
    trending: true,
  },
]
