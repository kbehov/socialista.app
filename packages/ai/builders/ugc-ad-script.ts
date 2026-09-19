import {
  clampUgcDuration,
  UGC_SCRIPT_MAX_CHARS,
  ugcClipShowsScript,
  ugcScriptTargetChars,
  type UgcClipType,
} from '@socialista/types'

export type UgcAdScriptPromptInput = {
  productName?: string
  productDescription?: string
  productKind?: string
  influencerName?: string
  directions?: string
  clipType?: UgcClipType
  durationSec?: number
}

export type UgcAdScriptSceneInput = {
  id: string
  type: UgcClipType
  durationSec?: number
}

const TYPE_VOICE: Record<UgcClipType, string> = {
  hook: 'Spoken hook to camera. One punchy opening line they say out loud — pattern interrupt, curiosity gap, or bold specific claim. Not on-screen text.',
  talking: 'Talking-head to camera. They speak the whole time.',
  'product-hold': 'They hold the product up and talk about it casually.',
  unboxing: 'They open or just opened the package and react out loud.',
  cta: 'Spoken close to camera. One clear ask — what to do next. Not “learn more.”',
  demo: 'They talk through one how-it-works step while using it.',
  'try-on': 'They are wearing or using it and talk about how it feels.',
  review: 'Honest review to camera. One specific result or detail, not a feature list.',
  reaction: 'First reaction out loud — surprise, delight, or a real first-use comment.',
  'before-after': 'They name the before, then the after, in one short spoken beat.',
  'app-showcase': 'Off-camera or casual voiceover over the phone screen. Empty if silent.',
  'b-roll': 'Off-camera voiceover over product footage. Describe the product; they are not talking to camera. Empty if silent.',
  custom: 'Optional spoken line. Follow the user notes. Empty string if they did not ask for talking.',
}

export function buildUgcAdScriptUserPrompt(input: UgcAdScriptPromptInput): string {
  const product = input.productName?.trim() || 'the product'
  const creator = input.influencerName?.trim()
  const directions = input.directions?.trim()
  const durationSec = clampUgcDuration(input.durationSec)
  const target = ugcScriptTargetChars(durationSec)
  const typeLine = input.clipType ? TYPE_VOICE[input.clipType] : ''

  return [
    `Write one spoken UGC ad script about ${product}.`,
    input.productDescription?.trim() ? `Product context: ${input.productDescription.trim()}` : '',
    `Duration: ${durationSec} seconds. Aim around ${target} characters, never over ${UGC_SCRIPT_MAX_CHARS}. Shorter is better — one breath.`,
    typeLine,
    creator ? `The on-camera creator is ${creator}.` : '',
    directions ? `Extra notes: ${directions}` : '',
    'Return only the spoken script, nothing else.',
  ]
    .filter(Boolean)
    .join('\n')
}

export function buildUgcAdScriptSegmentsUserPrompt(input: {
  productName?: string
  productDescription?: string
  productKind?: string
  influencerName?: string
  directions?: string
  scenes: UgcAdScriptSceneInput[]
}): string {
  const product = input.productName?.trim() || 'the product'
  const creator = input.influencerName?.trim()
  const sceneLines = input.scenes.map((scene, index) => {
    const durationSec = clampUgcDuration(scene.durationSec)
    const target = ugcScriptTargetChars(durationSec)
    const talking = ugcClipShowsScript(scene.type)
    return [
      `${index + 1}. id=${scene.id} type=${scene.type} duration=${durationSec}s maxChars=${target}`,
      talking ? TYPE_VOICE[scene.type] : 'No spoken line. Return an empty string for this scene.',
    ].join('\n')
  })

  return [
    `Write a spoken ad as ${input.scenes.length} ordered scene segments about ${product}.`,
    input.productKind ? `Product type: ${input.productKind}.` : '',
    input.productDescription?.trim() ? `Product context: ${input.productDescription.trim()}` : '',
    creator ? `The on-camera creator is ${creator}.` : '',
    input.directions?.trim() ? `Extra notes: ${input.directions.trim()}` : '',
    `Each segment must stay within its character budget (max ${UGC_SCRIPT_MAX_CHARS} characters). Contractions. No hashtags, emojis, or markdown.`,
    'The segments should feel like one continuous ad: hook, proof, close.',
    'Return one object per scene with that scene id and its spoken text (empty string if no talking).',
    sceneLines.join('\n\n'),
  ]
    .filter(Boolean)
    .join('\n')
}
