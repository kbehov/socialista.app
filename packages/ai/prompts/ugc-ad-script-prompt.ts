import { clampUgcDuration, ugcScriptTargetChars, type UgcClipType } from '@socialista/types'

export type UgcAdScriptPromptInput = {
  productName?: string
  influencerName?: string
  directions?: string
  clipType?: UgcClipType
  durationSec?: number
}

const TYPE_VOICE: Record<UgcClipType, string> = {
  talking: 'Talking-head testimonial to camera. They speak the whole time.',
  'product-hold': 'They hold the product up and talk about it casually.',
  unboxing: 'They open or just opened the package and react out loud.',
  'try-on': 'They are wearing or using it and talk about how it feels.',
  'app-showcase': 'They show the app on their phone and talk through one moment.',
  'b-roll': 'No spoken script needed — return a very short on-camera mutter if anything.',
}

export function buildUgcAdScriptSystem(durationSec = 8): string {
  const target = ugcScriptTargetChars(durationSec)
  return `
You write short spoken UGC ad scripts for TikTok / Reels / Shorts.

Rules:
- First person, peer-to-peer, like a real creator talking to their phone.
- Hook first. One proof beat. One clear CTA.
- Hard limit: ${target} characters including spaces. ${clampUgcDuration(durationSec)} seconds when spoken. Contractions. No hashtags, emojis, or markdown.
- Never say "game-changer", "unlock", "in today's fast-paced world", or "as an AI".
- If a product name is given, use it once naturally. Do not invent medical or income claims.
`.trim()
}

/** @deprecated Use buildUgcAdScriptSystem(durationSec). */
export const UGC_AD_SCRIPT_SYSTEM = buildUgcAdScriptSystem(8)

export function buildUgcAdScriptUserPrompt(input: UgcAdScriptPromptInput): string {
  const product = input.productName?.trim() || 'the product'
  const creator = input.influencerName?.trim()
  const directions = input.directions?.trim()
  const durationSec = clampUgcDuration(input.durationSec)
  const target = ugcScriptTargetChars(durationSec)
  const typeLine = input.clipType ? TYPE_VOICE[input.clipType] : ''

  return [
    `Write one spoken UGC ad script about ${product}.`,
    `Duration: ${durationSec} seconds. Maximum ${target} characters. Shorter is better.`,
    typeLine,
    creator ? `The on-camera creator is ${creator}.` : '',
    directions ? `Extra notes: ${directions}` : '',
    'Return only the spoken script, nothing else.',
  ]
    .filter(Boolean)
    .join('\n')
}
