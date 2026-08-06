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

const HEIGHT_LABEL: Record<InfluencerHeight, string> = {
  short: 'shorter than average',
  average: 'average height',
  tall: 'tall',
}

const PHOTO_STYLE_CLAUSE: Record<InfluencerPhotoStyle, string> = {
  'ugc-phone':
    'Shot on a modern smartphone: slight wide-angle distortion, casual framing, natural phone-camera noise, authentic UGC energy.',
  'creator-camera':
    'Shot on a mirrorless or DSLR creator camera: clean natural light, shallow depth of field, professional-but-candid social content look.',
  'studio-polish':
    'Polished studio portrait lighting with soft key light and subtle fill, clean backdrop or soft bokeh, still photoreal — not over-retouched.',
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

export const INFLUENCER_NEGATIVE_PROMPT =
  'No watermarks, logos, captions, or AI-generated text overlays. ' +
  'No plastic skin, beauty-filter smoothing, CGI, or 3D-render look. ' +
  'No distorted hands, extra fingers, fused limbs, or duplicate people.'

/**
 * Locked identity prose reused on every subsequent generation for this influencer.
 * Photoreal / UGC-oriented — no keyword-soup, no "AI look" cues.
 */
export function buildInfluencerBasePromptFragment(input: BuildInfluencerBasePromptInput): string {
  const { name, gender, ageRange, ethnicity, appearance, aestheticTags, directions, bio, photoStyle } =
    input
  const person = GENDER_LABEL[gender]
  const height = appearance.height ? `, ${HEIGHT_LABEL[appearance.height]}` : ''
  const features =
    appearance.distinguishingFeatures && appearance.distinguishingFeatures.length > 0
      ? ` Distinguishing features: ${appearance.distinguishingFeatures.join(', ')}.`
      : ''
  const ethnicityClause = ethnicity?.trim() ? ` ${ethnicity.trim()} heritage,` : ''
  const aesthetic =
    aestheticTags && aestheticTags.length > 0 ? ` Overall vibe leans ${aestheticTags.join(', ')}.` : ''

  const facialHair =
    appearance.facialHair && appearance.facialHair !== 'none'
      ? ` Facial hair: ${appearance.facialHair}.`
      : ''
  const makeup =
    appearance.makeup && appearance.makeup !== 'none'
      ? ` Makeup: ${appearance.makeup === 'no-makeup' ? 'bare skin, no makeup' : appearance.makeup}.`
      : ''

  const creativeDirection = (directions?.trim() || bio?.trim() || '').trim()
  const directionClause = creativeDirection ? ` Creative direction: ${creativeDirection}.` : ''

  const styleKey: InfluencerPhotoStyle = photoStyle ?? 'ugc-phone'
  const photoClause = PHOTO_STYLE_CLAUSE[styleKey]

  return (
    `${name} is a real ${person} in their ${ageRange}s,${ethnicityClause}` +
    ` with ${appearance.skinTone} skin, ${appearance.eyeColor} eyes,` +
    ` and ${appearance.hairColor} ${appearance.hairStyle} hair.` +
    ` Body type is ${appearance.bodyShape}${height}.` +
    `${facialHair}${makeup}${features}` +
    ` Photographed like a real social-media creator: natural skin texture with visible pores,` +
    ` soft real-world lighting, candid expression —` +
    ` not a CGI render, not plastic skin, not over-smoothed beauty filters.` +
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
      'Front-facing head-and-shoulders portrait, neutral expression, looking at camera, soft natural window light, plain lightly blurred indoor background. Clear face, consistent identity.',
  },
  {
    id: 'three-quarter',
    aspectRatio: '1:1',
    promptSuffix:
      'Three-quarter turn portrait from the chest up, relaxed candid half-smile, natural daylight, shallow depth of field. Same person as the identity description.',
  },
  {
    id: 'full-body',
    aspectRatio: '9:16',
    promptSuffix:
      'Full-body standing portrait, full figure clearly visible from head to shoes, natural posture, authentic creator photo.',
  },
  {
    id: 'lifestyle',
    aspectRatio: '9:16',
    promptSuffix:
      'Lifestyle UGC still of them mid-moment in a real environment, phone-camera framing, authentic creator content energy, same person.',
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
  return `${basePromptFragment} ${shot.promptSuffix}${nicheClause}${direction} ${INFLUENCER_NEGATIVE_PROMPT}`
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
    ` Real camera look, natural skin texture, no plastic skin, no beauty-filter smoothing.` +
    ` ${INFLUENCER_NEGATIVE_PROMPT}`
  )
}
