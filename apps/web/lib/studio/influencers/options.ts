import type {
  InfluencerAgeRange,
  InfluencerEthnicity,
  InfluencerFacialHair,
  InfluencerGender,
  InfluencerHeight,
  InfluencerMakeupStyle,
  InfluencerPhotoStyle,
} from '@socialista/types'
import {
  INFLUENCER_AGE_RANGES,
  INFLUENCER_ETHNICITIES,
  INFLUENCER_FACIAL_HAIR,
  INFLUENCER_GENDERS,
  INFLUENCER_HEIGHTS,
  INFLUENCER_MAKEUP_STYLES,
  INFLUENCER_NICHES,
  INFLUENCER_PHOTO_STYLES,
} from '@socialista/types'

export type SwatchOption = {
  id: string
  label: string
  /** CSS color for the swatch chip */
  color: string
}

export type ChoiceOption = {
  id: string
  label: string
  description?: string
  /** Optional visual group heading for grouped chip rendering */
  group?: string
}

export const GENDER_OPTIONS: ReadonlyArray<{ id: InfluencerGender; label: string }> = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'non-binary', label: 'Non-binary' },
]

export const AGE_RANGE_OPTIONS: ReadonlyArray<{ id: InfluencerAgeRange; label: string }> =
  INFLUENCER_AGE_RANGES.map(id => ({ id, label: id }))

export const HEIGHT_OPTIONS: ReadonlyArray<{ id: InfluencerHeight; label: string }> = [
  { id: 'short', label: 'Short' },
  { id: 'average', label: 'Average' },
  { id: 'tall', label: 'Tall' },
]

const NICHE_LABELS: Record<(typeof INFLUENCER_NICHES)[number], string> = {
  fitness: 'Fitness',
  fashion: 'Fashion',
  beauty: 'Beauty',
  travel: 'Travel',
  tech: 'Tech',
  food: 'Food',
  gaming: 'Gaming',
  lifestyle: 'Lifestyle',
  business: 'Business',
  comedy: 'Comedy',
  wellness: 'Wellness',
  finance: 'Finance',
  parenting: 'Parenting',
  pets: 'Pets',
  education: 'Education',
  diy: 'DIY',
}

export const NICHE_OPTIONS: ReadonlyArray<{ id: (typeof INFLUENCER_NICHES)[number]; label: string }> =
  INFLUENCER_NICHES.map(id => ({
    id,
    label: NICHE_LABELS[id],
  }))

const ETHNICITY_LABELS: Record<InfluencerEthnicity, string> = {
  'east-asian': 'East Asian',
  'south-asian': 'South Asian',
  'southeast-asian': 'Southeast Asian',
  black: 'Black',
  latina: 'Latina',
  latino: 'Latino',
  'middle-eastern': 'Middle Eastern',
  white: 'White',
  mixed: 'Mixed',
  indigenous: 'Indigenous',
  'pacific-islander': 'Pacific Islander',
}

export const ETHNICITY_OPTIONS: ReadonlyArray<{ id: InfluencerEthnicity; label: string }> =
  INFLUENCER_ETHNICITIES.map(id => ({
    id,
    label: ETHNICITY_LABELS[id],
  }))

export const FACIAL_HAIR_OPTIONS: ReadonlyArray<{ id: InfluencerFacialHair; label: string }> = [
  { id: 'none', label: 'None' },
  { id: 'stubble', label: 'Stubble' },
  { id: 'beard', label: 'Beard' },
  { id: 'mustache', label: 'Mustache' },
  { id: 'goatee', label: 'Goatee' },
]

export const MAKEUP_OPTIONS: ReadonlyArray<{ id: InfluencerMakeupStyle; label: string }> = [
  { id: 'natural', label: 'Natural' },
  { id: 'no-makeup', label: 'No makeup' },
  { id: 'glam', label: 'Glam' },
  { id: 'bold', label: 'Bold' },
]

export const PHOTO_STYLE_OPTIONS: ReadonlyArray<{
  id: InfluencerPhotoStyle
  label: string
  description?: string
}> = [
  { id: 'ugc-phone', label: 'Phone UGC', description: 'Casual smartphone look' },
  { id: 'creator-camera', label: 'Creator camera', description: 'Mirrorless / DSLR' },
  { id: 'studio-polish', label: 'Studio polish', description: 'Clean studio light' },
]

/** Inclusive Fitzpatrick-inspired skin tone swatches */
export const SKIN_TONE_OPTIONS: ReadonlyArray<SwatchOption> = [
  { id: 'porcelain', label: 'Porcelain', color: '#F6E6D8' },
  { id: 'fair', label: 'Fair', color: '#E8C4A8' },
  { id: 'light', label: 'Light', color: '#D4A574' },
  { id: 'light-medium', label: 'Light medium', color: '#C68642' },
  { id: 'medium', label: 'Medium', color: '#A56C3A' },
  { id: 'tan', label: 'Tan', color: '#8D5524' },
  { id: 'brown', label: 'Brown', color: '#6B3F24' },
  { id: 'deep-brown', label: 'Deep brown', color: '#4A2C1A' },
  { id: 'deep', label: 'Deep', color: '#2C1A12' },
]

export const HAIR_COLOR_OPTIONS: ReadonlyArray<SwatchOption> = [
  { id: 'jet-black', label: 'Jet black', color: '#0D0D0D' },
  { id: 'dark-brown', label: 'Dark brown', color: '#3B2314' },
  { id: 'chestnut', label: 'Chestnut', color: '#6B3A2A' },
  { id: 'auburn', label: 'Auburn', color: '#8B3A2A' },
  { id: 'copper', label: 'Copper', color: '#B85C38' },
  { id: 'blonde', label: 'Blonde', color: '#D4B483' },
  { id: 'platinum', label: 'Platinum', color: '#E8E0D5' },
  { id: 'silver', label: 'Silver', color: '#A8A8A8' },
  { id: 'red', label: 'Red', color: '#C23B22' },
]

export const EYE_COLOR_OPTIONS: ReadonlyArray<SwatchOption> = [
  { id: 'brown', label: 'Brown', color: '#5C4033' },
  { id: 'dark-brown', label: 'Dark brown', color: '#2C1810' },
  { id: 'hazel', label: 'Hazel', color: '#8E7618' },
  { id: 'green', label: 'Green', color: '#3D6B4F' },
  { id: 'blue', label: 'Blue', color: '#4A6FA5' },
  { id: 'gray', label: 'Gray', color: '#7A7F85' },
  { id: 'amber', label: 'Amber', color: '#C08A3E' },
]

export const HAIR_STYLE_OPTIONS: ReadonlyArray<ChoiceOption> = [
  { id: 'straight long', label: 'Straight long', group: 'Straight' },
  { id: 'straight short', label: 'Straight short', group: 'Straight' },
  { id: 'wavy', label: 'Wavy', group: 'Textured' },
  { id: 'curly', label: 'Curly', group: 'Textured' },
  { id: 'coily', label: 'Coily', group: 'Textured' },
  { id: 'bob', label: 'Bob', group: 'Cuts & updos' },
  { id: 'pixie', label: 'Pixie', group: 'Cuts & updos' },
  { id: 'braids', label: 'Braids', group: 'Cuts & updos' },
  { id: 'bun', label: 'Bun', group: 'Cuts & updos' },
  { id: 'slicked back', label: 'Slicked back', group: 'Cuts & updos' },
]

export const BODY_SHAPE_OPTIONS: ReadonlyArray<ChoiceOption> = [
  { id: 'slim', label: 'Slim', description: 'Lean silhouette' },
  { id: 'athletic', label: 'Athletic', description: 'Toned & active' },
  { id: 'curvy', label: 'Curvy', description: 'Soft hourglass' },
  { id: 'plus-size', label: 'Plus-size', description: 'Full figure' },
  { id: 'muscular', label: 'Muscular', description: 'Defined build' },
]

export const AESTHETIC_OPTIONS: ReadonlyArray<ChoiceOption> = [
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'glam', label: 'Glam' },
  { id: 'outdoorsy', label: 'Outdoorsy' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'casual', label: 'Casual' },
  { id: 'sporty', label: 'Sporty' },
  { id: 'vintage', label: 'Vintage' },
]

export const FEATURE_SUGGESTIONS = [
  'freckles',
  'glasses',
  'tattoos',
  'piercings',
  'dimples',
  'beauty mark',
] as const

export const DIRECTIONS_PLACEHOLDER =
  'e.g. Soft morning light in a sunlit kitchen, linen shirt, holding a ceramic mug — warm, approachable wellness creator energy'

export const DEFAULT_CREATE_FORM = {
  name: '',
  bio: '',
  directions: '',
  gender: 'female' as InfluencerGender,
  ageRange: '25-34' as InfluencerAgeRange,
  niche: [] as string[],
  ethnicity: '',
  appearance: {
    hairColor: HAIR_COLOR_OPTIONS[1]!.id,
    hairStyle: HAIR_STYLE_OPTIONS[2]!.id,
    eyeColor: EYE_COLOR_OPTIONS[0]!.id,
    skinTone: SKIN_TONE_OPTIONS[3]!.id,
    bodyShape: BODY_SHAPE_OPTIONS[1]!.id,
    height: 'average' as InfluencerHeight,
    distinguishingFeatures: [] as string[],
    facialHair: 'none' as InfluencerFacialHair,
    makeup: 'natural' as InfluencerMakeupStyle,
  },
  aestheticTags: [] as string[],
  photoStyle: 'ugc-phone' as InfluencerPhotoStyle,
}

export function labelForSwatch(options: ReadonlyArray<SwatchOption>, id: string) {
  return options.find(o => o.id === id)?.label ?? id
}

export function colorForSwatch(options: ReadonlyArray<SwatchOption>, id: string) {
  return options.find(o => o.id === id)?.color
}

export function labelForChoice(options: ReadonlyArray<ChoiceOption>, id: string) {
  return options.find(o => o.id === id)?.label ?? id
}

export function ethnicityLabel(idOrCustom: string) {
  const preset = ETHNICITY_OPTIONS.find(o => o.id === idOrCustom)
  return preset?.label ?? idOrCustom
}

export { INFLUENCER_GENDERS, INFLUENCER_HEIGHTS, INFLUENCER_FACIAL_HAIR, INFLUENCER_MAKEUP_STYLES, INFLUENCER_PHOTO_STYLES }
