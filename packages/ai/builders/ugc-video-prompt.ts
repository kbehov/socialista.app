import type { UgcAudioMode, UgcClipType, UgcProductKind } from '@socialista/types'

import { ugcVideoModelBias } from './ugc-video-planner.js'

export type UgcVideoPromptInput = {
  productName?: string
  productDescription?: string
  productKind?: UgcProductKind
  influencerName?: string
  clipType?: UgcClipType
  durationSec?: number
  aspectRatio: string
  videoModel: string
  audioMode?: UgcAudioMode
  directions?: string
  /** Spoken line. Pass only when audio for this clip already exists. */
  script?: string
}

const TYPE_BEAT: Record<UgcClipType, string> = {
  talking: 'Talking-head to camera. One delivery beat on this person.',
  'product-hold': 'They keep the product in hand and show it. Same SKU.',
  'b-roll': 'Product-only motion. No new objects. No person unless already in Image 1.',
  unboxing: 'Hands open or lift the product from the packaging already in Image 1.',
  cta: 'They lean in slightly and deliver one ask to camera. No on-screen buttons.',
  demo: 'One continuous how-it-works action with the product from Image 1.',
  'try-on': 'They adjust or show the product on their body. Same garment or item.',
  review: 'One honest take to camera. Product can stay in hand or nearby.',
  reaction: 'One real beat of surprise or delight, then they settle. Product stays in frame.',
  'before-after': 'Hold the setup from Image 1. A small turn, show, or compare. No graphic split-screen.',
  'app-showcase': 'Phone or laptop stays readable. Slight handheld sway. Do not invent a different UI.',
  custom: 'One small continuous action from Image 1. Follow the user notes when given.',
}

function writerBias(input: UgcVideoPromptInput): string {
  const script = input.script?.trim()
  if (script) return ugcVideoModelBias(input.videoModel, input.clipType)
  const id = input.videoModel.toLowerCase()
  if (id.includes('omnihuman') || input.clipType === 'talking') {
    return 'Write for image-to-video: start from Image 1, animate the existing scene, do not invent a new location or person. No recorded audio — keep any mouth relaxed and closed.'
  }
  return ugcVideoModelBias(input.videoModel, input.clipType)
}

function scriptBlock(input: UgcVideoPromptInput): string {
  const script = input.script?.trim()
  const duration = input.durationSec ?? 8
  if (!script) {
    return 'No recorded audio. Animate the scene only. If a person is in Image 1, keep the mouth relaxed and closed.'
  }
  if (input.audioMode === 'voiceover') {
    return `Voiceover is already recorded and will be mixed in post. Do not have anyone speak on camera — any person keeps a relaxed, closed mouth. Motion should illustrate this line (~${duration}s):\n${script}`
  }
  if (input.audioMode === 'lip-sync' || input.clipType === 'talking') {
    return `Spoken audio is already recorded and will be lip-synced to the person in Image 1. Describe delivery only — emotion, gaze, expression, small head movement. Do not write the words into the prompt (~${duration}s):\n${script}`
  }
  return `Spoken audio is already recorded (~${duration}s). Shape the motion around this line. Never render the words as on-screen text:\n${script}`
}

export function buildUgcVideoPromptUserPrompt(input: UgcVideoPromptInput): string {
  const directions = input.directions?.trim()
  const product = input.productName?.trim() || 'the product in the still'
  const durationLine = input.durationSec ? `Clip duration: ${input.durationSec} seconds.` : ''

  return [
    'Image 1 is the start frame. Look at it first. Write one image-to-video prompt that animates this exact frame.',
    `Video model: ${input.videoModel}. ${writerBias(input)}`,
    `Aspect: ${input.aspectRatio}. ${durationLine}`.trim(),
    input.clipType ? `Clip type: ${input.clipType}. ${TYPE_BEAT[input.clipType]}` : '',
    input.influencerName ? `Creator: ${input.influencerName}.` : 'No named creator — use whoever is in Image 1, or product only if the frame has no person.',
    input.productKind ? `Product type: ${input.productKind}.` : '',
    `Product: ${product}.`,
    input.productDescription?.trim() ? `Product context: ${input.productDescription.trim()}` : '',
    scriptBlock(input),
    directions
      ? `Directions to hit: ${directions}`
      : 'No extra directions. Invent one engaging beat from Image 1 and the product. Do not change the room, the person, or the SKU.',
    'Return the prompt now.',
  ]
    .filter(Boolean)
    .join('\n\n')
}
