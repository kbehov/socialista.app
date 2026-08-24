import {
  INFLUENCER_MAX_USER_REFERENCE_IMAGES,
  type InfluencerAgeRange,
  type InfluencerAppearance,
  type InfluencerCharacterSheet,
  type InfluencerGender,
  type InfluencerPhotoStyle,
} from '@socialista/types'
import { generateObject } from 'ai'
import { z } from 'zod'

import { INFLUENCER_ACCESSORY_PROMPTS, INFLUENCER_SCENE_PROMPTS } from '../builders/influencer.js'

const CHARACTER_SHEET_MODEL = 'anthropic/claude-sonnet-4.6'

const characterSheetSchema = z.object({
  identityLock: z
    .string()
    .describe(
      '2-3 sentences of physical facts only: face shape, bone structure, brow, nose, lips, jaw, eye set, skin character. No beauty adjectives.',
    ),
  signatureDetails: z
    .array(z.string())
    .min(2)
    .max(3)
    .describe('2-3 memorable physical specifics reused verbatim in every generation.'),
  wardrobe: z.object({
    casual: z.string().describe('Everyday outfit that matches niche, scenes, and aesthetic.'),
    onCamera: z.string().describe('Outfit for talking-head / selfie content, still on-brand.'),
    active: z.string().describe('Outfit for movement / outdoor / activity shots.'),
  }),
  environments: z
    .array(z.string())
    .min(3)
    .max(3)
    .describe(
      'Exactly 3 concrete, vibe-rich locations with light/atmosphere — never blank walls or studio seamless. When user scenes are provided, each environment must be a concrete variation of those situations (same place family, different angle/light). Otherwise match niche.',
    ),
  expressionRange: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe('Natural expressions this person commonly shows on camera.'),
})

export type BuildCharacterSheetInput = {
  name: string
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  ethnicity?: string
  appearance: Pick<
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
  niche?: string[]
  scenes?: string[]
  aestheticTags?: string[]
  directions?: string
  bio?: string
  photoStyle?: InfluencerPhotoStyle
  /** Optional hybrid refs — face cues + aesthetic; form attributes win on conflicts. */
  referenceImageUrls?: string[]
}

const SYSTEM_INSTRUCTIONS =
  'You author locked identity sheets for photoreal AI influencers used in Instagram, TikTok, and Pinterest UGC. ' +
  'Rules: (1) physical facts only — never beautiful/stunning/gorgeous; ' +
  '(2) never contradict supplied form attributes; ' +
  '(3) add specific bone structure, face shape, brow/nose/lip/jaw detail where silent; ' +
  '(4) no celebrity likeness; (5) plausibly real person with natural asymmetry; ' +
  '(6) wardrobe and environments must scream scroll-stopping creator UGC — lived-in, atmospheric, specific light and place; ' +
  'never blank walls, passport studios, or sterile seamless backdrops; ' +
  '(7) identityLock must be reusable byte-for-byte across many image prompts; ' +
  '(8) when scenes are provided, the 3 environments MUST be concrete variations of those situations (same place family, different angles/light/props); ' +
  '(9) when accessories are provided, weave wearable/holdable ones into wardrobe and onCamera descriptions naturally; ' +
  '(10) prefer scroll-stopping creator photography over sterile headshots; keep it photoreal, not fashion-editorial extremes.'

const LOOKALIKE_REF_SYSTEM_ADDENDUM =
  ' STYLE REFERENCE MODE: reference photos are the creative template for scene, colors, and photographic world — NOT identity. ' +
  'Author identityLock and signatureDetails entirely from the form fields (face, hair, skin, body). ' +
  'From references, extract and echo: setting/location, dominant color palette, lighting direction, lens/DOF character, and Pinterest-ready polish. ' +
  'Wardrobe slots: match reference outfit COLOR FAMILY and styling vibe in equivalent garments for the new person — not a pixel copy. ' +
  'Environments: describe exactly 3 concrete variations of the reference setting (same place family, different angles/light/props) — do NOT invent unrelated generic locations. ' +
  'Do NOT reproduce faces, bodies, or distinctive marks from the references. ' +
  'Do not copy watermarks, logos, UI chrome, or celebrity likeness.'

/** @deprecated Use LOOKALIKE_REF_SYSTEM_ADDENDUM */
const HYBRID_REF_SYSTEM_ADDENDUM = LOOKALIKE_REF_SYSTEM_ADDENDUM

function formatSceneHints(scenes: string[] | undefined): string | null {
  if (!scenes?.length) return null
  const lines = scenes.map(id => {
    const prompt = INFLUENCER_SCENE_PROMPTS[id]
    if (!prompt) return `- ${id}`
    const bits = [prompt.environment]
    if (prompt.wardrobeHint) bits.push(`wardrobe: ${prompt.wardrobeHint}`)
    if (prompt.actionCue) bits.push(`action: ${prompt.actionCue}`)
    return `- ${id}: ${bits.join('; ')}`
  })
  return `Selected scenes (anchor environments to these):\n${lines.join('\n')}`
}

function formatAccessoryHints(accessories: string[] | undefined): string | null {
  if (!accessories?.length) return null
  const lines = accessories.map(id => {
    const phrase = INFLUENCER_ACCESSORY_PROMPTS[id] ?? id.replace(/-/g, ' ')
    return `- ${id}: ${phrase}`
  })
  return `Selected accessories (include in wardrobe / onCamera where natural):\n${lines.join('\n')}`
}

function buildUserPayload(input: BuildCharacterSheetInput, hasRefs: boolean): string {
  const lines = [
    `Name: ${input.name}`,
    `Gender: ${input.gender}`,
    `Age range: ${input.ageRange}`,
    input.ethnicity?.trim() ? `Ethnicity / heritage: ${input.ethnicity.trim()}` : null,
    hasRefs
      ? 'Note: reference images define scene, color palette, and photographic world — author identity from form fields only.'
      : null,
    `Hair: ${input.appearance.hairColor}, ${input.appearance.hairStyle}`,
    `Eyes: ${input.appearance.eyeColor}`,
    `Skin: ${input.appearance.skinTone}`,
    `Body: ${input.appearance.bodyShape}${input.appearance.height ? `, ${input.appearance.height}` : ''}`,
    input.appearance.distinguishingFeatures?.length
      ? `Distinguishing features: ${input.appearance.distinguishingFeatures.join(', ')}`
      : null,
    input.appearance.facialHair && input.appearance.facialHair !== 'none'
      ? `Facial hair: ${input.appearance.facialHair}`
      : null,
    input.appearance.makeup && input.appearance.makeup !== 'none'
      ? `Makeup: ${input.appearance.makeup}`
      : null,
    formatAccessoryHints(input.appearance.accessories),
    input.niche?.length ? `Niche: ${input.niche.join(', ')}` : null,
    formatSceneHints(input.scenes),
    input.aestheticTags?.length ? `Aesthetic: ${input.aestheticTags.join(', ')}` : null,
    input.photoStyle ? `Photo style preference: ${input.photoStyle}` : null,
    input.directions?.trim()
      ? `Creative brief (HIGHEST PRIORITY — follow this for vibe, scenes, and mood): ${input.directions.trim()}`
      : null,
    input.bio?.trim() ? `Bio: ${input.bio.trim()}` : null,
  ].filter(Boolean)

  const hybridTail = hasRefs
    ? ' Reference images are attached — PERSON REPLACEMENT mode. ' +
      'identityLock + signatureDetails: from form fields only (never copy reference faces). ' +
      'Wardrobe: equivalent color palette and styling vibe from references, fitted to the new person. ' +
      'Environments: exactly 3 concrete variations of the reference scene/setting (same location family, different angles/light) — read from the attached photos, not generic niche defaults. ' +
      'Return identityLock, signatureDetails, wardrobe slots, exactly 3 environments, and expressionRange.'
    : 'Return identityLock, signatureDetails, wardrobe slots, exactly 3 environments, and expressionRange. ' +
      'Environments must feel like this creator’s world (selected scenes when present, else niche + aesthetic), with concrete props/light — not empty rooms. ' +
      'Wardrobe must fit the scenes and include selected accessories when wearable or holdable.'

  return (
    'Build a character sheet from this influencer form:\n' +
    lines.join('\n') +
    '\n\n' +
    hybridTail
  )
}

/** LLM character sheet — runs once at generation start; cached on identity. */
export async function buildInfluencerCharacterSheet(
  input: BuildCharacterSheetInput,
): Promise<InfluencerCharacterSheet> {
  const refs = (input.referenceImageUrls ?? [])
    .map(url => url.trim())
    .filter(Boolean)
    .slice(0, INFLUENCER_MAX_USER_REFERENCE_IMAGES)
  const hasRefs = refs.length > 0

  const userText = buildUserPayload(input, hasRefs)
  const system = hasRefs ? SYSTEM_INSTRUCTIONS + LOOKALIKE_REF_SYSTEM_ADDENDUM : SYSTEM_INSTRUCTIONS

  const result = await generateObject({
    model: CHARACTER_SHEET_MODEL,
    schema: characterSheetSchema,
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: hasRefs
          ? [
              { type: 'text' as const, text: userText },
              ...refs.map(image => ({ type: 'image' as const, image })),
            ]
          : userText,
      },
    ],
  })

  return result.object
}
