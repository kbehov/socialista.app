import type {
  InfluencerAgeRange,
  InfluencerAppearance,
  InfluencerGender,
  InfluencerHeight,
  InfluencerPhotoStyle,
} from '@socialista/types'

export type InfluencerPromptAppearance = Pick<
  InfluencerAppearance,
  | 'hairColor'
  | 'hairStyle'
  | 'eyeColor'
  | 'skinTone'
  | 'bodyShape'
  | 'height'
  | 'distinguishingFeatures'
  | 'facialHair'
  | 'makeup'
>

export type BuildInfluencerBasePromptInput = {
  name: string
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  ethnicity?: string
  appearance: InfluencerPromptAppearance
  aestheticTags?: string[]
  directions?: string
  bio?: string
  photoStyle?: InfluencerPhotoStyle
}

const GENDER_LABEL: Record<InfluencerGender, string> = {
  female: 'woman',
  male: 'man',
  'non-binary': 'non-binary person',
}

/** Models render age best from a specific number, not a range. */
const AGE_REPRESENTATIVE: Record<InfluencerAgeRange, number> = {
  '18-24': 21,
  '25-34': 28,
  '35-44': 38,
  '45+': 50,
}

const HEIGHT_LABEL: Record<InfluencerHeight, string> = {
  short: 'shorter than average',
  average: 'average height',
  tall: 'tall',
}

const MAKEUP_PROMPT_LABEL: Record<string, string> = {
  natural: 'natural, barely-there makeup',
  'no-makeup': 'bare skin, no makeup',
  glam: 'glam makeup',
  bold: 'bold makeup',
}

const PHOTO_STYLE_CLAUSE: Record<InfluencerPhotoStyle, string> = {
  'ugc-phone':
    "Shot on a modern smartphone front camera: arm's-length casual framing, slight wide-angle distortion, on-device HDR processing, subtle phone-camera noise — authentic UGC energy.",
  'creator-camera':
    'Shot on a mirrorless creator camera with a 35mm f/1.8 look: clean natural light, shallow depth of field, natural color science — professional but candid social content.',
  'studio-polish':
    'Polished studio portrait with an 85mm f/2.8 look: large soft key light at a 45° angle, subtle fill and gentle rim light, clean backdrop with soft falloff — photoreal, not over-retouched.',
}

export type InfluencerNicheScene = {
  outfits: string
  settings: string
  props: string
}

/** Concrete UGC-flavored scene descriptors keyed by niche. */
export const INFLUENCER_NICHE_SCENES: Record<string, InfluencerNicheScene> = {
  fitness: {
    outfits: 'athletic wear or gym-ready activewear',
    settings: 'a gym floor, home workout corner, or outdoor running path',
    props: 'a water bottle, yoga mat, or resistance bands nearby',
  },
  fashion: {
    outfits: 'a curated street-style or editorial outfit that matches their vibe',
    settings: 'a city sidewalk, boutique interior, or loft with clean walls',
    props: 'a tote bag, coffee cup, or shopping bag as a natural prop',
  },
  beauty: {
    outfits: 'a flattering top that keeps focus on face and skin',
    settings: 'a bright bathroom vanity, bedroom mirror, or soft daylight desk',
    props: 'skincare bottles or a makeup palette subtly in frame',
  },
  travel: {
    outfits: 'comfortable travel-ready clothes suited to the climate',
    settings: 'an outdoor landmark, café terrace, or scenic overlook',
    props: 'a camera, backpack, or passport wallet as a natural detail',
  },
  tech: {
    outfits: 'smart-casual creator attire',
    settings: 'a desk setup, co-working loft, or modern apartment interior',
    props: 'a laptop, phone, or earbuds casually visible',
  },
  food: {
    outfits: 'casual everyday clothes',
    settings: 'a kitchen counter, restaurant table, or farmers market stall',
    props: 'a plated dish, coffee, or cooking utensil in frame',
  },
  gaming: {
    outfits: 'relaxed gamer-casual wear or branded hoodie',
    settings: 'a gaming desk with RGB ambient light or a living-room setup',
    props: 'a headset, controller, or monitor glow in the background',
  },
  lifestyle: {
    outfits: 'everyday elevated casual clothes',
    settings: 'a cozy apartment, café, or neighborhood street',
    props: 'a coffee cup, book, or plant as soft lifestyle detail',
  },
  business: {
    outfits: 'smart-casual or polished professional attire',
    settings: 'a modern office, co-working space, or clean desk nook',
    props: 'a notebook, laptop, or coffee cup nearby',
  },
  comedy: {
    outfits: 'expressive casual clothes with personality',
    settings: 'a lived-in living room, kitchen, or outdoor stoop',
    props: 'everyday objects they might riff on casually nearby',
  },
  wellness: {
    outfits: 'soft loungewear or mindful athleisure',
    settings: 'a calm bedroom, yoga corner, or sunlit balcony',
    props: 'a journal, candle, or tea mug nearby',
  },
  finance: {
    outfits: 'clean smart-casual or business-casual attire',
    settings: 'a tidy desk, home office, or modern café workspace',
    props: 'a laptop, notepad, or phone with charts softly out of focus',
  },
  parenting: {
    outfits: 'comfortable everyday parent clothes',
    settings: 'a family kitchen, living room, or park playground edge',
    props: 'soft family-life details without focusing on children\'s faces',
  },
  pets: {
    outfits: 'casual outdoor or home clothes',
    settings: 'a park path, backyard, or cozy living room',
    props: 'a leash, pet toy, or pet bed nearby',
  },
  education: {
    outfits: 'approachable smart-casual clothes',
    settings: 'a study desk, classroom corner, or library nook',
    props: 'books, sticky notes, or a tablet nearby',
  },
  diy: {
    outfits: 'practical casual clothes suited for making things',
    settings: 'a workshop bench, craft table, or garage workspace',
    props: 'tools, materials, or a project in progress nearby',
  },
}

/**
 * Minimal exclusion footer. Keep it short and positively framed — long "no X"
 * negation lists are poorly attended by image models and often introduce the
 * artifact they name. Realism is enforced by positive cues in the base fragment.
 */
export const INFLUENCER_EXCLUSIONS =
  'Clean photograph, free of any text, captions, watermarks, logos, or UI overlays.'

/**
 * Locked identity prose reused on every subsequent generation for this influencer.
 * Ordered in semantic blocks (identity → face → hair → body → realism → style)
 * with positive photoreal cues instead of keyword-soup or negations.
 */
export function buildInfluencerBasePromptFragment(input: BuildInfluencerBasePromptInput): string {
  const { name, gender, ageRange, ethnicity, appearance, aestheticTags, directions, bio, photoStyle } =
    input
  const person = GENDER_LABEL[gender]
  const age = AGE_REPRESENTATIVE[ageRange]
  const height = appearance.height ? `, ${HEIGHT_LABEL[appearance.height]}` : ''
  const ethnicityClause = ethnicity?.trim() ? ` of ${ethnicity.trim()} heritage` : ''
  const features =
    appearance.distinguishingFeatures && appearance.distinguishingFeatures.length > 0
      ? `, ${appearance.distinguishingFeatures.join(', ')}`
      : ''
  const aesthetic =
    aestheticTags && aestheticTags.length > 0 ? ` Overall vibe leans ${aestheticTags.join(', ')}.` : ''

  const facialHair =
    appearance.facialHair && appearance.facialHair !== 'none'
      ? ` Facial hair: ${appearance.facialHair}.`
      : ''
  const makeup =
    appearance.makeup && appearance.makeup !== 'none'
      ? ` ${MAKEUP_PROMPT_LABEL[appearance.makeup] ?? `Makeup: ${appearance.makeup}`}.`
      : ''

  const creativeDirection = (directions?.trim() || bio?.trim() || '').trim()
  const directionClause = creativeDirection ? ` Creative direction: ${creativeDirection}.` : ''

  const styleKey: InfluencerPhotoStyle = photoStyle ?? 'ugc-phone'
  const photoClause = PHOTO_STYLE_CLAUSE[styleKey]

  return (
    `${name} is a ${age}-year-old ${person}${ethnicityClause} — a real social-media creator.` +
    ` Face: ${appearance.skinTone} skin with natural texture, ${appearance.eyeColor} eyes${features}.${facialHair}${makeup}` +
    ` Hair: ${appearance.hairColor}, ${appearance.hairStyle}, with a few loose flyaway strands at the hairline.` +
    ` Body: ${appearance.bodyShape} build${height}.` +
    ` Photorealistic candid photograph of a real person: visible skin pores, subtle facial asymmetry,` +
    ` natural skin sheen, soft real-world lighting with gentle shadows.` +
    ` ${photoClause}${aesthetic}${directionClause}`
  )
}

export type InfluencerAnchorShot = {
  id: 'front-portrait' | 'three-quarter' | 'full-body' | 'lifestyle'
  aspectRatio: '1:1' | '9:16'
  promptSuffix: string
}

export const INFLUENCER_ANCHOR_SHOTS: InfluencerAnchorShot[] = [
  {
    id: 'front-portrait',
    aspectRatio: '1:1',
    promptSuffix:
      'Front-facing head-and-shoulders portrait at eye level with an 85mm portrait lens look, relaxed neutral expression with a hint of a smile, looking directly at camera, soft diffused window light from the side, plain indoor background gently out of focus. Visible skin pores, natural catchlights in the eyes, loose flyaway hairs. Identity anchor: the face must be sharp, fully visible, and evenly lit.',
  },
  {
    id: 'three-quarter',
    aspectRatio: '1:1',
    promptSuffix:
      'Same person, three-quarter turn from the chest up, genuine candid laugh mid-conversation, 50mm lens look, natural daylight from a different direction than the anchor portrait, shallow depth of field. Same face and features — identity must hold under the new angle and lighting.',
  },
  {
    id: 'full-body',
    aspectRatio: '9:16',
    promptSuffix:
      'Same person, full-body standing portrait framed head-to-shoes with breathing room, 35mm lens at eye level, relaxed natural stance with weight shifted to one leg, real environment softly lit. Authentic creator photo, same face and body proportions.',
  },
  {
    id: 'lifestyle',
    aspectRatio: '9:16',
    promptSuffix:
      'Same person mid-moment in a real environment — walking, reaching, or sipping a drink — caught candidly on a phone camera, slight motion energy, natural imperfect framing. Unmistakably the same person.',
  },
]

export type BuildInfluencerAnchorPromptContext = {
  niche?: string[]
  directions?: string
}

function nicheSceneClause(niche: string[] | undefined, shotId: InfluencerAnchorShot['id']): string {
  if (shotId !== 'full-body' && shotId !== 'lifestyle') return ''
  const primary = niche?.[0]
  if (!primary) return ''
  const scene = INFLUENCER_NICHE_SCENES[primary]
  if (!scene) return ''
  return ` Wearing ${scene.outfits}, located in ${scene.settings}, with ${scene.props}.`
}

/** Combine locked identity fragment with a shot-specific pose/scene. */
export function buildInfluencerAnchorPrompt(
  basePromptFragment: string,
  shot: InfluencerAnchorShot,
  ctx?: BuildInfluencerAnchorPromptContext,
): string {
  const nicheClause = nicheSceneClause(ctx?.niche, shot.id)
  const direction =
    ctx?.directions?.trim() && (shot.id === 'full-body' || shot.id === 'lifestyle')
      ? ` Scene notes: ${ctx.directions.trim()}.`
      : ''
  return `${basePromptFragment} ${shot.promptSuffix}${nicheClause}${direction} ${INFLUENCER_EXCLUSIONS}`
}

export type BuildCloneCoverPromptInput = {
  name: string
  promptSuffix?: string
}

/** Cover/gallery prompts for self-clone — identity comes from reference images. */
export function buildCloneCoverPrompt(input: BuildCloneCoverPromptInput): string {
  const suffix =
    input.promptSuffix ??
    'Front-facing head-and-shoulders portrait, neutral expression, soft natural light, plain background.'
  return (
    `A photoreal portrait of ${input.name}, matching the person in the reference photos exactly —` +
    ` same face, skin tone, hair, and body proportions. ${suffix}` +
    ` Real camera look: natural skin texture with visible pores, soft real-world lighting, no beauty-filter smoothing.` +
    ` ${INFLUENCER_EXCLUSIONS}`
  )
}
