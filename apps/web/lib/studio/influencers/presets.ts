import {
  INFLUENCER_HOOK_PRESETS,
  type InfluencerAgeRange,
  type InfluencerFacialHair,
  type InfluencerGender,
  type InfluencerHeight,
  type InfluencerHookPresetId,
  type InfluencerMakeupStyle,
  type InfluencerPhotoStyle,
} from '@socialista/types'
import { randomInfluencerName } from './names'
import {
  AESTHETIC_OPTIONS,
  AGE_RANGE_OPTIONS,
  BODY_SHAPE_OPTIONS,
  DEFAULT_CREATE_FORM,
  EYE_COLOR_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  FEATURE_SUGGESTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_STYLE_OPTIONS,
  HEIGHT_OPTIONS,
  MAKEUP_OPTIONS,
  NICHE_OPTIONS,
  PHOTO_STYLE_OPTIONS,
  VIBE_OPTIONS,
} from './options'

export type InfluencerCreateFormState = {
  name: string
  bio: string
  directions: string
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  niche: string[]
  scenes: string[]
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
    accessories: string[]
  }
  aestheticTags: string[]
  vibeTags: string[]
  photoStyle: InfluencerPhotoStyle
}

export type InfluencerPreset = {
  id: string
  title: string
  description: string
  /** What the user will use this influencer for. */
  useCase: string
  /** Gradient colors for the preset card avatar */
  avatar: { skin: string; hair: string }
  form: InfluencerCreateFormState
}

export const INFLUENCER_PRESETS: ReadonlyArray<InfluencerPreset> = [
  {
    id: 'product-reviewer',
    title: 'Product reviewer',
    description: 'Scroll-stopping handheld reviews that convert — phone UGC, chest-height product.',
    useCase: 'Product reviews & unboxings',
    avatar: { skin: '#C68642', hair: '#0D0D0D' },
    form: {
      name: 'Jordan Hale',
      bio: 'Honest everyday product reviews without the hype.',
      directions: 'Friendly mid-explanation energy, plain unbranded product at chest height, crisp phone UGC.',
      gender: 'male',
      ageRange: '25-34',
      niche: ['tech', 'lifestyle'],
      scenes: ['product-hook', 'home', 'sitting-testimonial'],
      ethnicity: 'mixed',
      appearance: {
        hairColor: 'jet-black',
        hairStyle: 'slicked back',
        eyeColor: 'dark-brown',
        skinTone: 'light-medium',
        bodyShape: 'athletic',
        height: 'tall',
        distinguishingFeatures: [],
        facialHair: 'stubble',
        makeup: 'no-makeup',
        accessories: ['glasses', 'phone', 'skincare-bottle'],
      },
      aestheticTags: ['minimalist', 'casual'],
      vibeTags: ['confident', 'warm'],
      photoStyle: 'ugc-phone',
    },
  },
  {
    id: 'beauty-grwm',
    title: 'Beauty GRWM',
    description: 'Vanity GRWM + serum try-ons — soft daylight, flattering skin focus.',
    useCase: 'Beauty & skincare ads',
    avatar: { skin: '#D4A574', hair: '#0D0D0D' },
    form: {
      name: 'Sofia Rivera',
      bio: 'Soft glam routines and honest skincare try-ons.',
      directions: 'Warm beauty energy, soft skin texture, serum toward camera, vanity morning light.',
      gender: 'female',
      ageRange: '18-24',
      niche: ['beauty', 'fashion'],
      scenes: ['bathroom-vanity', 'bedroom-morning', 'product-hook'],
      ethnicity: 'latin',
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
        accessories: ['skincare-bottle', 'jewelry', 'phone'],
      },
      aestheticTags: ['glam', 'editorial'],
      vibeTags: ['warm', 'aspirational'],
      photoStyle: 'creator-camera',
    },
  },
  {
    id: 'fitness-coach',
    title: 'Fitness coach',
    description: 'Gym + outdoor training frames for workout tips and recovery content.',
    useCase: 'Fitness & wellness ads',
    avatar: { skin: '#8D5524', hair: '#3B2314' },
    form: {
      name: 'Riley Park',
      bio: 'Strength training, recovery tips, and showing up every day.',
      directions: 'Motivating coach energy between sets — sweaty, real, camera-confident gym light.',
      gender: 'female',
      ageRange: '25-34',
      niche: ['fitness', 'wellness'],
      scenes: ['gym', 'outdoor-run', 'yoga'],
      ethnicity: 'asian',
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
        accessories: ['water-bottle', 'dumbbell', 'headphones'],
      },
      aestheticTags: ['sporty', 'casual'],
      vibeTags: ['energetic', 'confident'],
      photoStyle: 'ugc-phone',
    },
  },
  {
    id: 'fashion-ootd',
    title: 'Fashion OOTD',
    description: 'Mirror fits + street looks for style hauls and outfit content.',
    useCase: 'Fashion & OOTD',
    avatar: { skin: '#E8C4A8', hair: '#3B2314' },
    form: {
      name: 'Maya Chen',
      bio: 'Elevated everyday style with an editorial eye.',
      directions: 'Outfit-check confidence, full-length readable silhouette, street-style daylight.',
      gender: 'female',
      ageRange: '25-34',
      niche: ['fashion', 'lifestyle'],
      scenes: ['mirror-ootd', 'street', 'coffee-shop'],
      ethnicity: 'asian',
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
        accessories: ['bag', 'sunglasses', 'phone'],
      },
      aestheticTags: ['streetwear', 'editorial'],
      vibeTags: ['confident', 'aspirational'],
      photoStyle: 'ugc-phone',
    },
  },
  {
    id: 'food-home-cook',
    title: 'Home cook',
    description: 'Kitchen plating + market runs for recipes and food brands.',
    useCase: 'Food & recipes',
    avatar: { skin: '#F6E6D8', hair: '#B85C38' },
    form: {
      name: 'Elena Rossi',
      bio: 'Home cooking, seasonal recipes, and sharing the table.',
      directions: 'Warm host energy, hands-busy cooking moment, inviting kitchen daylight.',
      gender: 'female',
      ageRange: '35-44',
      niche: ['food', 'lifestyle'],
      scenes: ['kitchen-cooking', 'farmers-market', 'home'],
      ethnicity: 'white',
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
        accessories: ['coffee-cup', 'phone'],
      },
      aestheticTags: ['casual', 'vintage'],
      vibeTags: ['warm', 'calm'],
      photoStyle: 'ugc-phone',
    },
  },
  {
    id: 'tech-creator',
    title: 'Tech creator',
    description: 'Desk demos and gadget walkthroughs for launches and SaaS.',
    useCase: 'Tech demos & launches',
    avatar: { skin: '#A56C3A', hair: '#0D0D0D' },
    form: {
      name: 'Dev Patel',
      bio: 'Clear product demos, unboxings, and software walkthroughs.',
      directions: 'Confident explainer tone, clean desk framing, gadget readable in hand, soft key light.',
      gender: 'male',
      ageRange: '25-34',
      niche: ['tech', 'education'],
      scenes: ['streaming-desk', 'product-hook', 'home'],
      ethnicity: 'south-asian',
      appearance: {
        hairColor: 'jet-black',
        hairStyle: 'straight short',
        eyeColor: 'brown',
        skinTone: 'medium',
        bodyShape: 'slim',
        height: 'average',
        distinguishingFeatures: [],
        facialHair: 'none',
        makeup: 'no-makeup',
        accessories: ['headphones', 'laptop', 'phone'],
      },
      aestheticTags: ['minimalist', 'editorial'],
      vibeTags: ['confident', 'authoritative'],
      photoStyle: 'creator-camera',
    },
  },
  {
    id: 'car-talker',
    title: 'Car talker',
    description: 'Passenger-seat confessionals — high-retention TikTok format.',
    useCase: 'Car confessionals & hooks',
    avatar: { skin: '#C68642', hair: '#3B2314' },
    form: {
      name: 'Alex Rivera',
      bio: 'Real talk from the passenger seat — opinions, stories, product takes.',
      directions: 'Candid car-selfie energy, mid-sentence expression, daylight through windshield.',
      gender: 'male',
      ageRange: '25-34',
      niche: ['lifestyle', 'comedy'],
      scenes: ['car', 'street', 'pointing-reveal'],
      ethnicity: 'latin',
      appearance: {
        hairColor: 'dark-brown',
        hairStyle: 'wavy',
        eyeColor: 'brown',
        skinTone: 'light-medium',
        bodyShape: 'athletic',
        height: 'average',
        distinguishingFeatures: [],
        facialHair: 'stubble',
        makeup: 'no-makeup',
        accessories: ['phone', 'sunglasses', 'coffee-cup'],
      },
      aestheticTags: ['casual', 'streetwear'],
      vibeTags: ['playful', 'energetic'],
      photoStyle: 'ugc-phone',
    },
  },
  {
    id: 'podcast-host',
    title: 'Podcast host',
    description: 'Mic-forward talking heads for interviews, tips, and thought leadership.',
    useCase: 'Podcast & thought leadership',
    avatar: { skin: '#6B3F24', hair: '#0D0D0D' },
    form: {
      name: 'Nina Okonkwo',
      bio: 'Conversations on culture, careers, and creative work.',
      directions: 'Engaged speaking face into mic, calm authority, soft podcast key light.',
      gender: 'female',
      ageRange: '25-34',
      niche: ['business', 'education'],
      scenes: ['podcast-setup', 'sitting-testimonial', 'coffee-shop'],
      ethnicity: 'black',
      appearance: {
        hairColor: 'jet-black',
        hairStyle: 'braids',
        eyeColor: 'dark-brown',
        skinTone: 'brown',
        bodyShape: 'athletic',
        height: 'tall',
        distinguishingFeatures: [],
        facialHair: 'none',
        makeup: 'natural',
        accessories: ['mic', 'jewelry', 'watch'],
      },
      aestheticTags: ['editorial', 'minimalist'],
      vibeTags: ['authoritative', 'warm'],
      photoStyle: 'creator-camera',
    },
  },
  {
    id: 'travel-vlogger',
    title: 'Travel vlogger',
    description: 'Airport-to-hotel day-in-the-life for travel brands and destinations.',
    useCase: 'Travel & destination UGC',
    avatar: { skin: '#D4A574', hair: '#6B3A2A' },
    form: {
      name: 'Samira Haddad',
      bio: 'City weekends, packing tips, and finding the good light abroad.',
      directions: 'Excited travel-day energy, natural wind/motion, golden destination light.',
      gender: 'female',
      ageRange: '25-34',
      niche: ['travel', 'lifestyle'],
      scenes: ['airport', 'hotel-room', 'beach'],
      ethnicity: 'middle-eastern',
      appearance: {
        hairColor: 'chestnut',
        hairStyle: 'wavy',
        eyeColor: 'hazel',
        skinTone: 'light',
        bodyShape: 'slim',
        height: 'average',
        distinguishingFeatures: [],
        facialHair: 'none',
        makeup: 'natural',
        accessories: ['bag', 'phone', 'sunglasses'],
      },
      aestheticTags: ['outdoorsy', 'editorial'],
      vibeTags: ['energetic', 'aspirational'],
      photoStyle: 'ugc-phone',
    },
  },
  {
    id: 'wellness-morning',
    title: 'Wellness morning',
    description: 'Soft morning rituals for supplements, routines, and mindful living.',
    useCase: 'Wellness & routines',
    avatar: { skin: '#E8C4A8', hair: '#6B3A2A' },
    form: {
      name: 'Ava Brooks',
      bio: 'Soft mornings, mindful rituals, and everyday wellness.',
      directions: 'Calm approachable energy, linen textures, soft morning window light.',
      gender: 'female',
      ageRange: '25-34',
      niche: ['wellness', 'lifestyle'],
      scenes: ['bedroom-morning', 'yoga', 'home'],
      ethnicity: 'mixed',
      appearance: {
        hairColor: 'chestnut',
        hairStyle: 'wavy',
        eyeColor: 'hazel',
        skinTone: 'fair',
        bodyShape: 'athletic',
        height: 'average',
        distinguishingFeatures: [],
        facialHair: 'none',
        makeup: 'natural',
        accessories: ['candle', 'coffee-cup', 'skincare-bottle'],
      },
      aestheticTags: ['minimalist', 'casual'],
      vibeTags: ['calm', 'warm'],
      photoStyle: 'ugc-phone',
    },
  },
  {
    id: 'retail-haul',
    title: 'Retail haul',
    description: 'Store finds and shopping-bag reveals for retail and DTC brands.',
    useCase: 'Hauls & shopping ads',
    avatar: { skin: '#E8C4A8', hair: '#0D0D0D' },
    form: {
      name: 'Chloe Park',
      bio: 'Store finds, try-ons, and honest haul reactions.',
      directions: 'Excited haul energy, product reveal toward camera, bright retail lighting.',
      gender: 'female',
      ageRange: '18-24',
      niche: ['fashion', 'lifestyle'],
      scenes: ['store', 'product-hook', 'mirror-ootd'],
      ethnicity: 'asian',
      appearance: {
        hairColor: 'jet-black',
        hairStyle: 'straight long',
        eyeColor: 'brown',
        skinTone: 'fair',
        bodyShape: 'slim',
        height: 'average',
        distinguishingFeatures: [],
        facialHair: 'none',
        makeup: 'natural',
        accessories: ['shopping-bag', 'phone', 'jewelry'],
      },
      aestheticTags: ['casual', 'streetwear'],
      vibeTags: ['playful', 'energetic'],
      photoStyle: 'ugc-phone',
    },
  },
  {
    id: 'business-explainer',
    title: 'Business explainer',
    description: 'Seated tips for finance, career, and B2B thought leadership.',
    useCase: 'Business & finance tips',
    avatar: { skin: '#C68642', hair: '#3B2314' },
    form: {
      name: 'Marcus Webb',
      bio: 'Clear explainers on money, career moves, and practical business tips.',
      directions: 'Calm authority, leaning slightly forward mid-tip, clean framing for captions.',
      gender: 'male',
      ageRange: '35-44',
      niche: ['business', 'finance'],
      scenes: ['sitting-testimonial', 'coffee-shop', 'home'],
      ethnicity: 'black',
      appearance: {
        hairColor: 'dark-brown',
        hairStyle: 'coily',
        eyeColor: 'brown',
        skinTone: 'medium',
        bodyShape: 'athletic',
        height: 'tall',
        distinguishingFeatures: [],
        facialHair: 'beard',
        makeup: 'no-makeup',
        accessories: ['watch', 'laptop', 'phone'],
      },
      aestheticTags: ['minimalist', 'editorial'],
      vibeTags: ['authoritative', 'calm'],
      photoStyle: 'creator-camera',
    },
  },
  {
    id: 'educator',
    title: 'Educator',
    description: 'Library and study-desk explainers for lessons, courses, and how-tos.',
    useCase: 'Education & how-to UGC',
    avatar: { skin: '#D4A574', hair: '#3B2314' },
    form: {
      name: 'Priya Sharma',
      bio: 'Clear lessons, study tips, and how-tos that feel like a real classroom.',
      directions: 'Calm authority, mid-explanation with notes in hand, warm library and study-desk light.',
      gender: 'female',
      ageRange: '25-34',
      niche: ['education'],
      scenes: ['library', 'study-desk', 'classroom'],
      ethnicity: 'south-asian',
      appearance: {
        hairColor: 'dark-brown',
        hairStyle: 'wavy',
        eyeColor: 'brown',
        skinTone: 'light',
        bodyShape: 'slim',
        height: 'average',
        distinguishingFeatures: [],
        facialHair: 'none',
        makeup: 'natural',
        accessories: ['books', 'notebook', 'glasses'],
      },
      aestheticTags: ['minimalist', 'casual'],
      vibeTags: ['calm', 'authoritative'],
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

type Archetype = {
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  niche: string[]
  scenes: string[]
  ethnicity: string
  hairColor: string
  hairStyle: string
  eyeColor: string
  skinTone: string
  bodyShape: string
  height: InfluencerHeight
  facialHair: InfluencerFacialHair
  makeup: InfluencerMakeupStyle
  accessories: string[]
  aestheticTags: string[]
  vibeTags: string[]
  photoStyle: InfluencerPhotoStyle
}

/** Coherent base people — Surprise Me jitters within an archetype instead of random soup. */
const ARCHETYPES: ReadonlyArray<Archetype> = [
  {
    gender: 'female',
    ageRange: '25-34',
    niche: ['wellness', 'lifestyle'],
    scenes: ['bedroom-morning', 'yoga', 'home'],
    ethnicity: 'asian',
    hairColor: 'dark-brown',
    hairStyle: 'wavy',
    eyeColor: 'brown',
    skinTone: 'fair',
    bodyShape: 'slim',
    height: 'average',
    facialHair: 'none',
    makeup: 'natural',
    accessories: ['candle', 'coffee-cup', 'skincare-bottle'],
    aestheticTags: ['minimalist', 'casual'],
    vibeTags: ['calm', 'warm'],
    photoStyle: 'ugc-phone',
  },
  {
    gender: 'male',
    ageRange: '25-34',
    niche: ['tech', 'education'],
    scenes: ['streaming-desk', 'product-hook', 'home'],
    ethnicity: 'mixed',
    hairColor: 'jet-black',
    hairStyle: 'slicked back',
    eyeColor: 'dark-brown',
    skinTone: 'light-medium',
    bodyShape: 'athletic',
    height: 'tall',
    facialHair: 'stubble',
    makeup: 'no-makeup',
    accessories: ['glasses', 'headphones', 'phone'],
    aestheticTags: ['minimalist', 'editorial'],
    vibeTags: ['confident', 'authoritative'],
    photoStyle: 'creator-camera',
  },
  {
    gender: 'female',
    ageRange: '18-24',
    niche: ['beauty', 'fashion'],
    scenes: ['bathroom-vanity', 'bedroom-morning', 'product-hook'],
    ethnicity: 'latin',
    hairColor: 'jet-black',
    hairStyle: 'straight long',
    eyeColor: 'hazel',
    skinTone: 'light',
    bodyShape: 'curvy',
    height: 'tall',
    facialHair: 'none',
    makeup: 'glam',
    accessories: ['skincare-bottle', 'jewelry', 'phone'],
    aestheticTags: ['glam', 'editorial'],
    vibeTags: ['warm', 'aspirational'],
    photoStyle: 'creator-camera',
  },
  {
    gender: 'male',
    ageRange: '25-34',
    niche: ['fitness', 'lifestyle'],
    scenes: ['gym', 'outdoor-run', 'yoga'],
    ethnicity: 'black',
    hairColor: 'chestnut',
    hairStyle: 'coily',
    eyeColor: 'brown',
    skinTone: 'medium',
    bodyShape: 'muscular',
    height: 'average',
    facialHair: 'none',
    makeup: 'no-makeup',
    accessories: ['water-bottle', 'dumbbell', 'headphones'],
    aestheticTags: ['sporty', 'outdoorsy'],
    vibeTags: ['energetic', 'confident'],
    photoStyle: 'ugc-phone',
  },
  {
    gender: 'female',
    ageRange: '35-44',
    niche: ['food', 'lifestyle'],
    scenes: ['kitchen-cooking', 'farmers-market', 'home'],
    ethnicity: 'white',
    hairColor: 'copper',
    hairStyle: 'wavy',
    eyeColor: 'green',
    skinTone: 'porcelain',
    bodyShape: 'curvy',
    height: 'short',
    facialHair: 'none',
    makeup: 'natural',
    accessories: ['coffee-cup', 'phone'],
    aestheticTags: ['casual', 'vintage'],
    vibeTags: ['warm', 'calm'],
    photoStyle: 'ugc-phone',
  },
  {
    gender: 'female',
    ageRange: '25-34',
    niche: ['fashion', 'lifestyle'],
    scenes: ['mirror-ootd', 'street', 'coffee-shop'],
    ethnicity: 'mixed',
    hairColor: 'platinum',
    hairStyle: 'pixie',
    eyeColor: 'gray',
    skinTone: 'light',
    bodyShape: 'slim',
    height: 'average',
    facialHair: 'none',
    makeup: 'bold',
    accessories: ['sunglasses', 'bag', 'phone'],
    aestheticTags: ['streetwear', 'editorial'],
    vibeTags: ['confident', 'playful'],
    photoStyle: 'ugc-phone',
  },
  {
    gender: 'male',
    ageRange: '25-34',
    niche: ['lifestyle', 'comedy'],
    scenes: ['car', 'street', 'pointing-reveal'],
    ethnicity: 'latin',
    hairColor: 'dark-brown',
    hairStyle: 'wavy',
    eyeColor: 'brown',
    skinTone: 'light-medium',
    bodyShape: 'athletic',
    height: 'average',
    facialHair: 'stubble',
    makeup: 'no-makeup',
    accessories: ['phone', 'sunglasses', 'coffee-cup'],
    aestheticTags: ['casual', 'streetwear'],
    vibeTags: ['playful', 'energetic'],
    photoStyle: 'ugc-phone',
  },
  {
    gender: 'female',
    ageRange: '25-34',
    niche: ['travel', 'lifestyle'],
    scenes: ['airport', 'hotel-room', 'beach'],
    ethnicity: 'middle-eastern',
    hairColor: 'chestnut',
    hairStyle: 'wavy',
    eyeColor: 'hazel',
    skinTone: 'light',
    bodyShape: 'slim',
    height: 'average',
    facialHair: 'none',
    makeup: 'natural',
    accessories: ['bag', 'phone', 'sunglasses'],
    aestheticTags: ['outdoorsy', 'editorial'],
    vibeTags: ['energetic', 'aspirational'],
    photoStyle: 'ugc-phone',
  },
  {
    gender: 'female',
    ageRange: '25-34',
    niche: ['education'],
    scenes: ['library', 'study-desk', 'classroom'],
    ethnicity: 'south-asian',
    hairColor: 'dark-brown',
    hairStyle: 'wavy',
    eyeColor: 'brown',
    skinTone: 'light',
    bodyShape: 'slim',
    height: 'average',
    facialHair: 'none',
    makeup: 'natural',
    accessories: ['books', 'notebook', 'glasses'],
    aestheticTags: ['minimalist', 'casual'],
    vibeTags: ['calm', 'authoritative'],
    photoStyle: 'ugc-phone',
  },
]

/** Build a form from a coherent archetype with light jitter. */
export function randomizeInfluencerForm(): InfluencerCreateFormState {
  const base = pickRandom(ARCHETYPES)
  const showFacialHair = base.gender === 'male'
  const showMakeup = base.gender === 'female'

  // Light jitter: occasionally swap a compatible field within the same archetype feel.
  // Keep scenes/accessories coherent — do not randomize into unrelated UGC situations.
  const jitterHair =
    Math.random() > 0.65 ? pickRandom(HAIR_COLOR_OPTIONS).id : base.hairColor
  const jitterEyes =
    Math.random() > 0.7 ? pickRandom(EYE_COLOR_OPTIONS).id : base.eyeColor
  const jitterFeature =
    Math.random() > 0.55 ? [pickRandom(FEATURE_SUGGESTIONS)] : ([] as string[])

  return {
    name: randomInfluencerName(base.gender),
    bio: '',
    directions: '',
    gender: base.gender,
    ageRange: Math.random() > 0.8 ? pickRandom(AGE_RANGE_OPTIONS).id : base.ageRange,
    niche: Math.random() > 0.85 ? pickRandomSubset(NICHE_OPTIONS, 2) : [...base.niche],
    scenes: [...base.scenes],
    ethnicity: base.ethnicity,
    appearance: {
      hairColor: jitterHair,
      hairStyle: Math.random() > 0.7 ? pickRandom(HAIR_STYLE_OPTIONS).id : base.hairStyle,
      eyeColor: jitterEyes,
      skinTone: base.skinTone,
      bodyShape: Math.random() > 0.75 ? pickRandom(BODY_SHAPE_OPTIONS).id : base.bodyShape,
      height: Math.random() > 0.8 ? pickRandom(HEIGHT_OPTIONS).id : base.height,
      distinguishingFeatures: jitterFeature,
      facialHair: showFacialHair
        ? Math.random() > 0.7
          ? pickRandom(FACIAL_HAIR_OPTIONS).id
          : base.facialHair
        : 'none',
      makeup: showMakeup
        ? Math.random() > 0.7
          ? pickRandom(MAKEUP_OPTIONS).id
          : base.makeup
        : 'natural',
      accessories: [...base.accessories],
    },
    aestheticTags:
      Math.random() > 0.7 ? pickRandomSubset(AESTHETIC_OPTIONS, 2) : [...base.aestheticTags],
    vibeTags: Math.random() > 0.7 ? pickRandomSubset(VIBE_OPTIONS, 2) : [...base.vibeTags],
    photoStyle: Math.random() > 0.8 ? pickRandom(PHOTO_STYLE_OPTIONS).id : base.photoStyle,
  }
}

export function cloneDefaultForm(): InfluencerCreateFormState {
  return {
    ...DEFAULT_CREATE_FORM,
    niche: [...DEFAULT_CREATE_FORM.niche],
    scenes: [...DEFAULT_CREATE_FORM.scenes],
    aestheticTags: [...DEFAULT_CREATE_FORM.aestheticTags],
    vibeTags: [...DEFAULT_CREATE_FORM.vibeTags],
    appearance: {
      ...DEFAULT_CREATE_FORM.appearance,
      distinguishingFeatures: [...DEFAULT_CREATE_FORM.appearance.distinguishingFeatures],
      accessories: [...DEFAULT_CREATE_FORM.appearance.accessories],
    },
  }
}

export type InfluencerHookFormat = {
  id: InfluencerHookPresetId
  label: string
  description: string
  prompt: string
  trending: boolean
}

const HOOK_FORMAT_META: Record<InfluencerHookPresetId, { description: string; trending: boolean }> = {
  'shocked-reaction': { description: 'The classic scroll-stop gasp', trending: true },
  'wait-for-it': { description: 'Hold still, then the face lands', trending: true },
  'pov-lean': { description: 'Lean in like the viewer is in the scene', trending: true },
  'hot-take': { description: 'Chin up, about to drop an opinion', trending: true },
  'skeptical-squint': { description: 'I wanted this to fail', trending: true },
  'sad-snob': { description: 'Tired, unimpressed, a little above it', trending: true },
  'hand-on-mouth': { description: 'Silent gasp after the comments', trending: true },
  'finger-point': { description: 'Tease a reveal at camera', trending: true },
  'side-eye': { description: 'Judging glance, then back', trending: true },
  'double-take': { description: 'Look away, recatch, disbelief', trending: true },
  'eye-roll': { description: 'Lazy lids, muted Reels energy', trending: true },
  'knowing-smirk': { description: 'I told you so, held', trending: true },
  'whisper-tea': { description: 'Lean in like sharing a secret', trending: true },
  'stitch-glance': { description: 'Off-frame reply, then camera', trending: true },
  'look-down-up': { description: 'Read it, then look at us', trending: true },
  'eyebrow-raise': { description: 'Silent oh-really', trending: false },
  'cringe-wince': { description: 'Secondhand embarrassment', trending: true },
  'plot-twist': { description: 'Smile fades as it lands', trending: true },
  'soft-laugh': { description: 'Tries to hold it, then breaks', trending: false },
  'knowing-nod': { description: 'This-is-it talking-head open', trending: false },
  'head-shake-no': { description: 'Slow disappointed no', trending: false },
  'peek-fingers': { description: 'Cannot watch, peeks anyway', trending: true },
  'chefs-kiss': { description: 'Small kiss-away, pleased', trending: false },
  'come-closer': { description: 'Playful watch-this invite', trending: true },
  'unimpressed-blink': { description: 'One long blink. And?', trending: true },
  'slow-realize': { description: 'The thought lands in pieces', trending: true },
}

export const INFLUENCER_HOOK_FORMATS: ReadonlyArray<InfluencerHookFormat> = INFLUENCER_HOOK_PRESETS.map(
  preset => ({
    id: preset.id,
    label: preset.label,
    prompt: preset.prompt,
    ...HOOK_FORMAT_META[preset.id],
  }),
)

export function clonePresetForm(preset: InfluencerPreset): InfluencerCreateFormState {
  return {
    ...preset.form,
    niche: [...preset.form.niche],
    scenes: [...preset.form.scenes],
    aestheticTags: [...preset.form.aestheticTags],
    vibeTags: [...preset.form.vibeTags],
    appearance: {
      ...preset.form.appearance,
      distinguishingFeatures: [...preset.form.appearance.distinguishingFeatures],
      accessories: [...preset.form.appearance.accessories],
    },
  }
}
