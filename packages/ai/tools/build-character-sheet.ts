import type {
  InfluencerAgeRange,
  InfluencerAppearance,
  InfluencerCharacterSheet,
  InfluencerGender,
  InfluencerPhotoStyle,
} from '@socialista/types'
import { generateObject } from 'ai'
import { z } from 'zod'

import { INFLUENCER_ACCESSORY_PROMPTS, INFLUENCER_SCENE_PROMPTS } from '../prompts/influencer-prompt.js'

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

function buildUserPayload(input: BuildCharacterSheetInput): string {
  const lines = [
    `Name: ${input.name}`,
    `Gender: ${input.gender}`,
    `Age range: ${input.ageRange}`,
    input.ethnicity?.trim() ? `Ethnicity / heritage: ${input.ethnicity.trim()}` : null,
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
    input.directions?.trim() ? `Creative direction (optional refine): ${input.directions.trim()}` : null,
    input.bio?.trim() ? `Bio: ${input.bio.trim()}` : null,
  ].filter(Boolean)

  return (
    'Build a character sheet from this influencer form:\n' +
    lines.join('\n') +
    '\n\nReturn identityLock, signatureDetails, wardrobe slots, exactly 3 environments, and expressionRange. ' +
    'Environments must feel like this creator’s world (selected scenes when present, else niche + aesthetic), with concrete props/light — not empty rooms. ' +
    'Wardrobe must fit the scenes and include selected accessories when wearable or holdable.'
  )
}

/** LLM character sheet — runs once at generation start; cached on identity. */
export async function buildInfluencerCharacterSheet(
  input: BuildCharacterSheetInput,
): Promise<InfluencerCharacterSheet> {
  const result = await generateObject({
    model: CHARACTER_SHEET_MODEL,
    schema: characterSheetSchema,
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTIONS },
      { role: 'user', content: buildUserPayload(input) },
    ],
  })

  return result.object
}
