import type {
  InfluencerAgeRange,
  InfluencerAppearance,
  InfluencerCharacterSheet,
  InfluencerGender,
  InfluencerHeight,
  InfluencerPhotoStyle,
} from '@socialista/types'

import {
  INFLUENCER_ACCESSORY_PROMPTS,
  INFLUENCER_NICHE_SCENES,
  INFLUENCER_SCENE_PROMPTS,
  INFLUENCER_VIBE_PROMPTS,
  type InfluencerScenePrompt,
} from './catalog.js'
import { type InfluencerShot } from './shots.js'

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
  | 'accessories'
>

export type BuildInfluencerBasePromptInput = {
  name: string
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  ethnicity?: string
  appearance: InfluencerPromptAppearance
  /** When present, identityLock + signatureDetails drive the fragment. */
  characterSheet?: InfluencerCharacterSheet
}

export type InfluencerReferenceMode = 'none' | 'user' | 'cover'

export type BuildInfluencerShotPromptContext = {
  niche?: string[]
  scenes?: string[]
  accessories?: string[]
  aestheticTags?: string[]
  vibeTags?: string[]
  characterSheet?: InfluencerCharacterSheet
  photoStyle?: InfluencerPhotoStyle
  directions?: string
  shotIndex?: number
  /**
   * none — no reference images.
   * user — cover shot, user style photos attached.
   * cover — follow-up, only the generated cover is attached.
   */
  referenceMode?: InfluencerReferenceMode
  /** User reference count, for Image 1–N labels on the cover. */
  referenceCount?: number
}

const GENDER_LABEL: Record<InfluencerGender, string> = {
  female: 'woman',
  male: 'man',
}

/** Models render age best from a specific number, not a range. */
const AGE_REPRESENTATIVE: Record<InfluencerAgeRange, number> = {
  '18-24': 21,
  '25-34': 28,
  '35-44': 38,
  '45-55': 50,
  '65+': 68,
}

const HEIGHT_LABEL: Record<InfluencerHeight, string> = {
  short: 'shorter than average',
  average: 'average height',
  tall: 'tall',
}

const MAKEUP_PROMPT_LABEL: Record<string, string> = {
  natural: 'natural, barely-there makeup',
  'no-makeup': 'no makeup, natural complexion',
  glam: 'glam makeup',
  bold: 'bold makeup',
}

const PHOTO_STYLE_CUE: Record<InfluencerPhotoStyle, string> = {
  'ugc-phone':
    'Phone photo from a creator who already posts: natural HDR, a little wide, feed-ready color, still candid.',
  'creator-camera':
    'Creator camera: shallow depth, intentional frame, Instagram-grid polish in a real room.',
  'studio-polish':
    'Polished creator light in a real set: flattering and Pinterest-clean, not a blank backdrop.',
}

/** Positive photoreal footer. Camera and place come from Shot, Scene, or the reference — not from this line. */
export const INFLUENCER_EXCLUSIONS_BASE =
  'Photoreal photo from a creator who already posts on Instagram, TikTok, and Pinterest. ' +
  'Visible natural pores on the nose and inner cheeks, real facial texture, natural asymmetry, light social retouch. ' +
  'Practical light, real depth, feed-ready color. Close portraits keep a sharp face.'

/** Appended after enhance so pore texture cannot be dropped. */
export const INFLUENCER_SKIN_LOCK_FOOTER =
  'Visible natural pores on the nose and inner cheeks, real facial texture, natural asymmetry, light social retouch only.'

export const INFLUENCER_EXCLUSIONS_REF_ADDENDUM =
  ' Attached photos own the scene, palette, framing, and light. Identity owns the person.'

function expandAccessories(accessories: string[] | undefined): string[] {
  if (!accessories?.length) return []
  return accessories
    .map(id => INFLUENCER_ACCESSORY_PROMPTS[id] ?? id.replace(/-/g, ' '))
    .filter(Boolean)
}

/** Dedupe distinguishing features that overlap with accessories (e.g. glasses). */
function featuresWithoutAccessoryOverlap(
  features: string[] | undefined,
  accessories: string[] | undefined,
): string[] {
  if (!features?.length) return []
  if (!accessories?.length) return features
  const accessorySet = new Set(accessories.map(item => item.toLowerCase()))
  return features.filter(feature => {
    const lower = feature.toLowerCase()
    if (accessorySet.has(lower)) return false
    if (lower.includes('glasses') && (accessorySet.has('glasses') || accessorySet.has('sunglasses'))) {
      return false
    }
    return true
  })
}

/**
 * Locked identity prose — reused byte-identical on every shot.
 * Scene / camera / wardrobe / accessories belong in the shot prompt, not here.
 */
export function buildInfluencerBasePromptFragment(input: BuildInfluencerBasePromptInput): string {
  const { gender, ageRange, ethnicity, appearance, characterSheet } = input
  const person = GENDER_LABEL[gender]
  const age = AGE_REPRESENTATIVE[ageRange]
  const height = appearance.height ? `, ${HEIGHT_LABEL[appearance.height]}` : ''
  const ethnicityClause = ethnicity?.trim() ? ` of ${ethnicity.trim()} heritage` : ''
  const featureList = featuresWithoutAccessoryOverlap(appearance.distinguishingFeatures, appearance.accessories)
  const features = featureList.length > 0 ? `, ${featureList.join(', ')}` : ''

  const facialHair =
    appearance.facialHair && appearance.facialHair !== 'none' ? ` Facial hair: ${appearance.facialHair}.` : ''
  const makeup =
    appearance.makeup && appearance.makeup !== 'none'
      ? ` ${MAKEUP_PROMPT_LABEL[appearance.makeup] ?? `Makeup: ${appearance.makeup}`}.`
      : ''

  const subject = `A ${age}-year-old ${person}${ethnicityClause}, a real social-media creator.`
  const faceStructure = [
    characterSheet?.face?.shape,
    characterSheet?.face?.brows,
    characterSheet?.face?.nose,
  ]
    .map(part => part?.trim())
    .filter((part): part is string => Boolean(part))
  const faceDetail = faceStructure.length > 0 ? `, ${faceStructure.join(', ')}` : ''
  const hairLength = characterSheet?.hair?.length?.trim()
  const hairPart = characterSheet?.hair?.part?.trim()
  const hairDetail = [hairLength, hairPart].filter(Boolean).join(', ')
  const hairLine = hairDetail
    ? ` Hair: ${appearance.hairColor}, ${appearance.hairStyle}, ${hairDetail}.`
    : ` Hair: ${appearance.hairColor}, ${appearance.hairStyle}.`

  if (characterSheet) {
    const signatures =
      characterSheet.signatureDetails.length > 0
        ? ` Signature: ${characterSheet.signatureDetails.join('; ')}.`
        : ''
    return (
      `${subject} ${characterSheet.identityLock}${signatures}` +
      hairLine +
      ` Face: ${appearance.skinTone} complexion, ${appearance.eyeColor} eyes${faceDetail}${features}.${facialHair}${makeup}` +
      ` Build: ${appearance.bodyShape}${height}.` +
      ` Believable real-world light.`
    )
  }

  return (
    `${subject}` +
    ` Face: ${appearance.skinTone} complexion, ${appearance.eyeColor} eyes${features}.${facialHair}${makeup}` +
    ` Hair: ${appearance.hairColor}, ${appearance.hairStyle}.` +
    ` Build: ${appearance.bodyShape}${height}.` +
    ` Believable real-world light.`
  )
}

type InfluencerPromptScene = {
  id?: string
  wardrobe?: string
  environment?: string
  action?: string
}

function pickFromArray<T>(items: T[] | undefined, index: number): T | undefined {
  if (!items || items.length === 0) return undefined
  return items[index % items.length]
}

function expandUserScene(sceneId: string | undefined): InfluencerScenePrompt | undefined {
  if (!sceneId) return undefined
  return INFLUENCER_SCENE_PROMPTS[sceneId]
}

/** Resolve wardrobe + setting + action from sheet → user scenes → niche fallback. */
function resolveInfluencerPromptScene(
  shot: InfluencerShot,
  ctx?: BuildInfluencerShotPromptContext,
): InfluencerPromptScene | undefined {
  const mode = ctx?.referenceMode ?? 'none'
  if (mode !== 'none') return undefined
  if (!shot.useNicheScene) return undefined

  const index = ctx?.shotIndex ?? 0
  const sheetWardrobe = ctx?.characterSheet?.wardrobe?.[shot.wardrobeSlot]
  const sheetEnv = pickFromArray(ctx?.characterSheet?.environments, index)

  const userScenes = ctx?.scenes?.filter(Boolean) ?? []
  if (userScenes.length > 0) {
    const sceneId = pickFromArray(userScenes, index)
    const scene = expandUserScene(sceneId)
    if (scene) {
      return {
        id: sceneId,
        wardrobe: scene.wardrobeHint ?? sheetWardrobe,
        environment: scene.environment ?? sheetEnv,
        action: scene.actionCue,
      }
    }
  }

  if (sheetWardrobe || sheetEnv) {
    return {
      wardrobe: sheetWardrobe || undefined,
      environment: sheetEnv || undefined,
    }
  }

  const niches = ctx?.niche?.filter(Boolean) ?? []
  const primary = niches[0]
  const secondary = niches[1]
  const primaryScene = primary ? INFLUENCER_NICHE_SCENES[primary] : undefined
  const secondaryScene = secondary ? INFLUENCER_NICHE_SCENES[secondary] : undefined

  const wardrobe = pickFromArray(primaryScene?.wardrobe, index) ?? pickFromArray(secondaryScene?.wardrobe, index)
  const environment =
    pickFromArray(primaryScene?.environments, index) ?? pickFromArray(secondaryScene?.environments, index)

  if (!wardrobe && !environment) return undefined
  return { wardrobe, environment }
}

function buildLookalikeRefInstructions(referenceCount: number, mode: InfluencerReferenceMode, shotIndex: number): string {
  if (mode === 'cover' || shotIndex > 0) {
    return (
      'The attached cover is this same person: same face structure, hair, and complexion. ' +
      'Keep the cover color grade and light. Use the angle and crop in Shot.'
    )
  }

  const n = Math.min(Math.max(referenceCount, 1), 3)
  const imageLabel = n === 1 ? 'Image 1' : n === 2 ? 'Images 1–2' : 'Images 1–3'
  return (
    `${imageLabel} sets the scene, palette, wardrobe colors, framing, pose, props, and light. ` +
    'Render the Identity person in that frame, in equivalent unbranded clothing and props.'
  )
}

function adaptShotSuffixForRefs(suffix: string, mode: InfluencerReferenceMode, shotIndex: number): string {
  if (mode === 'user' && shotIndex === 0) {
    return 'Framing, camera distance, crop, and pose match the attached reference. The person is the Identity subject.'
  }
  return suffix
}

type InfluencerPromptDoc = {
  identity: string
  shot: string
  scene?: InfluencerPromptScene
  accessories?: string[]
  photoStyle?: string
  aesthetics?: string[]
  vibes?: string[]
  directions?: string
  referenceGuidance?: string
  quality: string
}

function buildInfluencerPromptDoc(
  identity: string,
  shot: InfluencerShot,
  ctx?: BuildInfluencerShotPromptContext,
): InfluencerPromptDoc {
  const mode = ctx?.referenceMode ?? 'none'
  const refMode = mode !== 'none'
  const shotIndex = ctx?.shotIndex ?? 0
  const coverRefMode = mode === 'user' && shotIndex === 0
  const accessories = expandAccessories(ctx?.accessories)
  const directions = ctx?.directions?.trim() || undefined
  const aesthetics = coverRefMode ? undefined : ctx?.aestheticTags?.filter(Boolean).slice(0, 2)
  const vibes = coverRefMode
    ? undefined
    : ctx?.vibeTags
        ?.filter(Boolean)
        .slice(0, 2)
        .map(id => INFLUENCER_VIBE_PROMPTS[id] ?? id.replace(/-/g, ' '))
        .filter(Boolean)
  const photoStyle = coverRefMode ? undefined : ctx?.photoStyle ? PHOTO_STYLE_CUE[ctx.photoStyle] : undefined
  const scene = resolveInfluencerPromptScene(shot, ctx)

  return {
    identity: identity.trim(),
    shot: refMode ? adaptShotSuffixForRefs(shot.promptSuffix.trim(), mode, shotIndex) : shot.promptSuffix.trim(),
    scene,
    accessories: coverRefMode ? undefined : accessories.length > 0 ? accessories : undefined,
    photoStyle,
    aesthetics: aesthetics && aesthetics.length > 0 ? aesthetics : undefined,
    vibes: vibes && vibes.length > 0 ? vibes : undefined,
    directions,
    referenceGuidance: refMode
      ? buildLookalikeRefInstructions(ctx?.referenceCount ?? 1, mode, shotIndex)
      : undefined,
    quality: INFLUENCER_EXCLUSIONS_BASE + (coverRefMode ? INFLUENCER_EXCLUSIONS_REF_ADDENDUM : ''),
  }
}

function formatSceneSection(scene: InfluencerPromptScene): string {
  const parts = [
    scene.wardrobe ? `Outfit: ${scene.wardrobe}` : null,
    scene.environment ?? null,
    scene.action ?? null,
  ].filter((part): part is string => Boolean(part))
  return parts.map(part => (part.endsWith('.') ? part.slice(0, -1) : part)).join('. ')
}

function renderInfluencerPrompt(doc: InfluencerPromptDoc): string {
  const sections: string[] = [`Identity: ${doc.identity}`, `Shot: ${doc.shot}`]

  if (doc.referenceGuidance) {
    sections.push(doc.referenceGuidance)
  }

  if (doc.scene && (doc.scene.wardrobe || doc.scene.environment || doc.scene.action)) {
    sections.push(`Scene: ${formatSceneSection(doc.scene)}.`)
  }

  if (doc.accessories && doc.accessories.length > 0) {
    sections.push(`Accessories: ${doc.accessories.join('; ')}.`)
  }

  const styleBits = [
    doc.photoStyle,
    doc.aesthetics && doc.aesthetics.length > 0 ? `Aesthetic vibe: ${doc.aesthetics.join(', ')}.` : null,
  ].filter(Boolean)
  if (styleBits.length > 0) {
    sections.push(`Style: ${styleBits.join(' ')}`)
  }

  if (doc.vibes && doc.vibes.length > 0) {
    sections.push(`Vibe: ${doc.vibes.join('; ')}.`)
  }

  if (doc.directions) {
    sections.push(`Direction: ${doc.directions}`)
  }

  sections.push(`Quality: ${doc.quality}`)

  return softenInfluencerImagePrompt(sections.join('\n'))
}

/**
 * Image safety checks score words like chest, bare, and nude even on clothed portraits.
 * Rewrite those before the image call. Does not change the shot or the scene.
 */
export function softenInfluencerImagePrompt(prompt: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bbare skin\b/gi, 'natural complexion'],
    [/\boff[-\s]?the[-\s]?shoulder\b/gi, 'everyday top'],
    [/\boff[-\s]?shoulder\b/gi, 'everyday top'],
    [/\b(cleavage|lingerie|bikini|underwear|panties|strapless|low-cut|see-through|sheer|braless|plunging)\b/gi, ''],
    [/\b(sensual|seductive|erotic|provocative|sexy)\b/gi, ''],
    [/\bnaked\b/gi, ''],
    [/\bnude\b/gi, 'neutral'],
    [/\bintimate\b/gi, 'close'],
    [/\b(below|past|to) (?:her |his |their )?chest\b/gi, '$1 the shoulders'],
    [/\bchest\b/gi, 'shoulders'],
    [/\bfuller lower lip\b/gi, 'lower lip'],
    [/\bfull lips\b/gi, 'lips'],
    [/\bcupid['’]s bow\b/gi, 'lip line'],
    [/\b(glistening|dewy|wet) skin\b/gi, 'natural complexion'],
  ]

  let text = prompt
  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement)
  }
  return text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([.,;])/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Identity, then shot. Scene and style are omitted on a user-reference cover so the photo owns the frame.
 */
export function buildInfluencerAnchorPrompt(
  basePromptFragment: string,
  shot: InfluencerShot,
  ctx?: BuildInfluencerShotPromptContext,
): string {
  return renderInfluencerPrompt(buildInfluencerPromptDoc(basePromptFragment, shot, ctx))
}

export type BuildCloneCoverPromptInput = {
  name: string
  promptSuffix?: string
}

/** Cover/gallery prompts for self-clone — identity comes from reference images. */
export function buildCloneCoverPrompt(input: BuildCloneCoverPromptInput): string {
  const suffix =
    input.promptSuffix ??
    'Front-facing head-and-shoulders portrait, light matching the reference photos, sharp face, lived-in creator environment behind.'

  return softenInfluencerImagePrompt(
    [
      'Identity: The person in the reference photos — same face structure, jaw, complexion, and hair. Light matches those photos.',
      `Shot: ${suffix}`,
      `Quality: ${INFLUENCER_EXCLUSIONS_BASE}`,
    ].join('\n'),
  )
}
