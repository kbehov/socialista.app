import type {
  InfluencerAgeRange,
  InfluencerFacialHair,
  InfluencerGender,
  InfluencerHeight,
  InfluencerMakeupStyle,
  InfluencerPhotoStyle,
} from '@socialista/types'
import {
  AESTHETIC_OPTIONS,
  AGE_RANGE_OPTIONS,
  BODY_SHAPE_OPTIONS,
  DEFAULT_CREATE_FORM,
  EYE_COLOR_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  FEATURE_SUGGESTIONS,
  GENDER_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_STYLE_OPTIONS,
  HEIGHT_OPTIONS,
  MAKEUP_OPTIONS,
  NICHE_OPTIONS,
  PHOTO_STYLE_OPTIONS,
  SKIN_TONE_OPTIONS,
} from './options'

export type InfluencerCreateFormState = {
  name: string
  bio: string
  directions: string
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  niche: string[]
  ethnicity: string
  appearance: {
    hairColor: string
    hairStyle: string
    eyeColor: string
    skinTone: string
    bodyShape: string
    height: InfluencerHeight
    distinguishingFeatures: string[]
    facialHair: InfluencerFacialHair
    makeup: InfluencerMakeupStyle
  }
  aestheticTags: string[]
  photoStyle: InfluencerPhotoStyle
}

export type InfluencerPreset = {
  id: string
  title: string
  description: string
  /** Gradient colors for the preset card avatar */
  avatar: { skin: string; hair: string }
  form: InfluencerCreateFormState
}

export const INFLUENCER_PRESETS: ReadonlyArray<InfluencerPreset> = [
  {
    id: 'wellness',
    title: 'Wellness creator',
    description: 'Warm, approachable energy for morning routines and mindful living.',
    avatar: { skin: '#E8C4A8', hair: '#3B2314' },
    form: {
      name: 'Maya Chen',
      bio: 'Mindful living, soft mornings, and everyday wellness rituals.',
      directions:
        'Soft morning light in a sunlit kitchen, linen shirt, holding a ceramic mug — warm, approachable wellness creator energy',
      gender: 'female',
      ageRange: '25-34',
      niche: ['wellness', 'lifestyle'],
      ethnicity: 'East Asian',
      appearance: {
        hairColor: 'dark-brown',
        hairStyle: 'wavy',
        eyeColor: 'brown',
        skinTone: 'fair',
        bodyShape: 'slim',
        height: 'average',
        distinguishingFeatures: ['freckles'],
        facialHair: 'none',
        makeup: 'natural',
      },
      aestheticTags: ['minimalist', 'casual'],
      photoStyle: 'ugc-phone',
    },
  },
  {
    id: 'tech',
    title: 'Tech reviewer',
    description: 'Clean, confident presence for product demos and desk setups.',
    avatar: { skin: '#C68642', hair: '#0D0D0D' },
    form: {
      name: 'Jordan Hale',
      bio: 'Gadgets, software, and honest reviews without the hype.',
      directions:
        'Modern desk setup with soft key light, casual tech-wear hoodie, holding a smartphone — crisp, confident reviewer vibe',
      gender: 'male',
      ageRange: '25-34',
      niche: ['tech', 'education'],
      ethnicity: 'Mixed',
      appearance: {
        hairColor: 'jet-black',
        hairStyle: 'slicked back',
        eyeColor: 'dark-brown',
        skinTone: 'light-medium',
        bodyShape: 'athletic',
        height: 'tall',
        distinguishingFeatures: ['glasses'],
        facialHair: 'stubble',
        makeup: 'no-makeup',
      },
      aestheticTags: ['minimalist', 'editorial'],
      photoStyle: 'creator-camera',
    },
  },
  {
    id: 'fashion',
    title: 'Fashion editorial',
    description: 'Polished runway-adjacent looks for style and beauty content.',
    avatar: { skin: '#D4A574', hair: '#0D0D0D' },
    form: {
      name: 'Sofia Rivera',
      bio: 'Elevated everyday style with an editorial eye.',
      directions:
        'Studio backdrop with soft directional light, tailored blazer, confident posture — high-fashion editorial energy',
      gender: 'female',
      ageRange: '18-24',
      niche: ['fashion', 'beauty'],
      ethnicity: 'Latina',
      appearance: {
        hairColor: 'jet-black',
        hairStyle: 'straight long',
        eyeColor: 'hazel',
        skinTone: 'light',
        bodyShape: 'curvy',
        height: 'tall',
        distinguishingFeatures: ['beauty mark'],
        facialHair: 'none',
        makeup: 'glam',
      },
      aestheticTags: ['glam', 'editorial'],
      photoStyle: 'studio-polish',
    },
  },
  {
    id: 'travel',
    title: 'Travel storyteller',
    description: 'Sun-kissed, adventurous energy for destinations and day-in-the-life.',
    avatar: { skin: '#A56C3A', hair: '#6B3A2A' },
    form: {
      name: 'Alex Okonkwo',
      bio: 'Chasing golden hour and telling stories from the road.',
      directions:
        'Golden hour on a coastal overlook, linen shirt, wind in hair, candid smile — warm travel documentary feel',
      gender: 'male',
      ageRange: '25-34',
      niche: ['travel', 'lifestyle'],
      ethnicity: 'Black',
      appearance: {
        hairColor: 'chestnut',
        hairStyle: 'coily',
        eyeColor: 'brown',
        skinTone: 'medium',
        bodyShape: 'athletic',
        height: 'average',
        distinguishingFeatures: [],
        facialHair: 'none',
        makeup: 'no-makeup',
      },
      aestheticTags: ['outdoorsy', 'casual'],
      photoStyle: 'creator-camera',
    },
  },
  {
    id: 'fitness',
    title: 'Fitness coach',
    description: 'Energetic, motivating presence for workouts and active lifestyle.',
    avatar: { skin: '#8D5524', hair: '#3B2314' },
    form: {
      name: 'Riley Park',
      bio: 'Strength training, recovery tips, and showing up every day.',
      directions:
        'Bright gym with natural window light, athletic wear, mid-workout smile — energetic, motivating coach energy',
      gender: 'non-binary',
      ageRange: '25-34',
      niche: ['fitness', 'wellness'],
      ethnicity: 'East Asian',
      appearance: {
        hairColor: 'dark-brown',
        hairStyle: 'pixie',
        eyeColor: 'dark-brown',
        skinTone: 'tan',
        bodyShape: 'muscular',
        height: 'average',
        distinguishingFeatures: ['tattoos'],
        facialHair: 'none',
        makeup: 'no-makeup',
      },
      aestheticTags: ['sporty', 'casual'],
      photoStyle: 'ugc-phone',
    },
  },
  {
    id: 'food',
    title: 'Food creator',
    description: 'Friendly kitchen energy for recipes, tastes, and cozy cooking.',
    avatar: { skin: '#F6E6D8', hair: '#B85C38' },
    form: {
      name: 'Elena Rossi',
      bio: 'Home cooking, seasonal recipes, and sharing the table.',
      directions:
        'Cozy kitchen counter with soft overhead light, apron over casual clothes, plating a dish — warm food-creator energy',
      gender: 'female',
      ageRange: '35-44',
      niche: ['food', 'lifestyle'],
      ethnicity: 'White',
      appearance: {
        hairColor: 'copper',
        hairStyle: 'wavy',
        eyeColor: 'green',
        skinTone: 'porcelain',
        bodyShape: 'curvy',
        height: 'short',
        distinguishingFeatures: ['dimples'],
        facialHair: 'none',
        makeup: 'natural',
      },
      aestheticTags: ['casual', 'vintage'],
      photoStyle: 'ugc-phone',
    },
  },
]

function pickRandom<T>(items: ReadonlyArray<T>): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function pickRandomSubset(items: ReadonlyArray<{ id: string }>, max: number): string[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  const count = Math.max(1, Math.floor(Math.random() * max) + 1)
  return shuffled.slice(0, count).map(item => item.id)
}

const FIRST_NAMES = [
  'Ava',
  'Noah',
  'Mia',
  'Leo',
  'Zoe',
  'Kai',
  'Luna',
  'Omar',
  'Iris',
  'Sam',
] as const

const LAST_NAMES = [
  'Brooks',
  'Nguyen',
  'Patel',
  'Kim',
  'Garcia',
  'Walsh',
  'Singh',
  'Adeyemi',
  'Costa',
  'Laurent',
] as const

/** Build a fully randomized form from the option catalogs. */
export function randomizeInfluencerForm(): InfluencerCreateFormState {
  const gender = pickRandom(GENDER_OPTIONS).id
  const showFacialHair = gender === 'male'
  const showMakeup = gender === 'female' || gender === 'non-binary'

  return {
    name: `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`,
    bio: '',
    directions: '',
    gender,
    ageRange: pickRandom(AGE_RANGE_OPTIONS).id,
    niche: pickRandomSubset(NICHE_OPTIONS, 2),
    ethnicity: '',
    appearance: {
      hairColor: pickRandom(HAIR_COLOR_OPTIONS).id,
      hairStyle: pickRandom(HAIR_STYLE_OPTIONS).id,
      eyeColor: pickRandom(EYE_COLOR_OPTIONS).id,
      skinTone: pickRandom(SKIN_TONE_OPTIONS).id,
      bodyShape: pickRandom(BODY_SHAPE_OPTIONS).id,
      height: pickRandom(HEIGHT_OPTIONS).id,
      distinguishingFeatures: Math.random() > 0.5 ? [pickRandom(FEATURE_SUGGESTIONS)] : [],
      facialHair: showFacialHair ? pickRandom(FACIAL_HAIR_OPTIONS).id : 'none',
      makeup: showMakeup ? pickRandom(MAKEUP_OPTIONS).id : 'natural',
    },
    aestheticTags: pickRandomSubset(AESTHETIC_OPTIONS, 2),
    photoStyle: pickRandom(PHOTO_STYLE_OPTIONS).id,
  }
}

export function cloneDefaultForm(): InfluencerCreateFormState {
  return {
    ...DEFAULT_CREATE_FORM,
    niche: [...DEFAULT_CREATE_FORM.niche],
    aestheticTags: [...DEFAULT_CREATE_FORM.aestheticTags],
    appearance: {
      ...DEFAULT_CREATE_FORM.appearance,
      distinguishingFeatures: [...DEFAULT_CREATE_FORM.appearance.distinguishingFeatures],
    },
  }
}

export function clonePresetForm(preset: InfluencerPreset): InfluencerCreateFormState {
  return {
    ...preset.form,
    niche: [...preset.form.niche],
    aestheticTags: [...preset.form.aestheticTags],
    appearance: {
      ...preset.form.appearance,
      distinguishingFeatures: [...preset.form.appearance.distinguishingFeatures],
    },
  }
}
