export type ImageIdeaStarter = {
  id: string
  label: string
  prompt: string
}

/** Curated starters for e-commerce owners, marketers, and founders. */
export const IMAGE_IDEA_STARTERS = [
  {
    id: 'pdp-hero',
    label: 'PDP hero shot',
    prompt:
      'A clean product-page hero: the product centered, label readable, soft studio light, true color, no props competing with it.',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle scene',
    prompt:
      'The product in a real lifestyle scene a customer would recognize: natural window light, a lived-in surface, shallow depth, photographed not rendered.',
  },
  {
    id: 'ugc',
    label: 'UGC-style creator',
    prompt:
      'A creator holding the product up to camera, native UGC for Reels, casual phone photo, honest light, product clearly visible.',
  },
  {
    id: 'sale',
    label: 'Sale announcement',
    prompt:
      'A sale announcement still: product front and center, high contrast, clear space for a short offer headline, feed-ready.',
  },
  {
    id: 'seasonal',
    label: 'Seasonal drop',
    prompt:
      "A seasonal drop: the product styled with this season's colors and a few props, premium ecommerce photography, ready for the feed.",
  },
  {
    id: 'flat-lay',
    label: 'Flat lay',
    prompt:
      'Overhead flat lay of the product with two or three supporting details, even light, tidy negative space, catalog-ready.',
  },
  {
    id: 'unboxing',
    label: 'Unboxing moment',
    prompt:
      'Hands opening the product for the first time, close crop, warm practical light, the product as the hero of the frame.',
  },
  {
    id: 'before-after',
    label: 'Before and after',
    prompt:
      'A before-and-after still that makes the result obvious at a glance, the product included, clean type space, honest lighting.',
  },
  {
    id: 'ingredient',
    label: 'Ingredient macro',
    prompt:
      'Macro of the product beside its hero ingredient, crisp detail, controlled highlights, luxury ecommerce finish.',
  },
  {
    id: 'desk',
    label: 'Founder desk',
    prompt:
      'The product on a desk between a notebook and a laptop, late-afternoon light, credible and human, not a stock set.',
  },
  {
    id: 'shelf',
    label: 'On the shelf',
    prompt:
      'The product on a retail shelf among neighbors, slightly pulled forward, readable label, natural store light.',
  },
  {
    id: 'gift',
    label: 'Gift set',
    prompt:
      'The product styled as a gift: soft wrap, a ribbon, warm light, premium and ready to post for a launch or holiday.',
  },
] as const satisfies readonly ImageIdeaStarter[]

export function pickImageIdeaStarters(
  count: number,
  random: () => number = Math.random,
): ImageIdeaStarter[] {
  const pool = [...IMAGE_IDEA_STARTERS]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    const current = pool[index]
    const next = pool[swap]
    if (!current || !next) continue
    pool[index] = next
    pool[swap] = current
  }
  return pool.slice(0, count)
}
