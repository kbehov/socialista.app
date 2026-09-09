import type { UgcAudioMode, UgcClipType } from '@socialista/types'

export type UgcVideoPlannerInput = {
  script: string
  directions?: string
  influencerName?: string
  identityFragment?: string
  productName?: string
  aspectRatio: string
  sceneCount: number
  videoModel: string
  clipType?: UgcClipType
  durationSec?: number
  audioMode?: UgcAudioMode
}

function modelBias(videoModel: string): string {
  const id = videoModel.toLowerCase()
  if (id.includes('kling')) {
    return 'Write for Kling image-to-video: concrete camera moves, subject motion, and what must stay locked to frame 1. Short clauses. No film-school jargon dump.'
  }
  if (id.includes('seedance')) {
    return 'Write for Seedance image-to-video: natural human motion, product continuity, handheld UGC energy. Describe action in time, not a shot list of new scenes.'
  }
  return 'Write for image-to-video: start from frame 1, animate the existing scene, do not invent a new location or person.'
}

const TYPE_MOTION: Record<UgcClipType, string> = {
  hook: 'This is a text-hook clip. Keep the on-screen line fully readable the whole time. Subtle kinetic type or handheld micro-motion only. Do not invent a talking person. Do not add extra slogans.',
  talking: 'Animate talking-head energy: natural mouth shapes for the spoken line, blinks, small head turns, and a handheld phone feel. Stay on this person.',
  'product-hold': 'Keep the product in hand. Slight product tilt, a step closer, a smile. Same SKU.',
  'b-roll': 'Product-only motion: slow push-in, gentle rotation, light shifting on materials. No new objects. No person unless already in frame 1.',
  unboxing: 'Hands open or lift the product from the packaging. Continuous action from frame 1. Same box and SKU.',
  'try-on': 'They adjust or show the product on their body. Natural selfie motion. Same garment/item.',
  'app-showcase': 'Phone stays readable. Slight handheld sway. Do not invent a different UI than the screen in frame 1.',
}

function scriptBlock(input: UgcVideoPlannerInput): string {
  const script = input.script.trim()
  const duration = input.durationSec ?? 8
  if (input.clipType === 'hook') {
    return script
      ? `On-screen HOOK TEXT (paint this exact line in the video, never spoken):\n${script}`
      : 'On-screen text hook. Invent one short punchy line and keep it readable. No talking.'
  }
  if (!script) {
    return 'No spoken script. Animate the scene only. Keep the mouth relaxed if a person is present.'
  }
  if (input.audioMode === 'voiceover') {
    return `Voiceover added in post, NOT spoken on camera — any person keeps a relaxed, closed mouth; product motion should illustrate the line (~${duration}s):\n${script}`
  }
  if (input.audioMode === 'lip-sync') {
    return `Spoken line, lip-synced in post — animate confident talking to camera, mouth shapes matching a short spoken line (~${duration}s):\n${script}`
  }
  return `Spoken script (~${duration}s, motion and lip presence only, never as on-image text):\n${script}`
}

export function buildUgcVideoPlannerUserPrompt(input: UgcVideoPlannerInput): string {
  const directions = input.directions?.trim()
  const product = input.productName?.trim() ?? 'the product in the still'
  const typeLine = input.clipType ? TYPE_MOTION[input.clipType] : ''
  const durationLine = input.durationSec ? `Clip duration: ${input.durationSec} seconds.` : ''

  return [
    `Video model: ${input.videoModel}. ${modelBias(input.videoModel)}`,
    `Aspect: ${input.aspectRatio}. Scene stills attached: ${input.sceneCount}. ${durationLine}`.trim(),
    input.clipType ? `Clip type: ${input.clipType}. ${typeLine}` : '',
    input.influencerName ? `Creator: ${input.influencerName}.` : 'No on-camera creator — product or device only.',
    input.identityFragment ?? '',
    `Product: ${product}.`,
    scriptBlock(input),
    directions ? `User directions: ${directions}` : 'No extra directions — keep it natural UGC.',
    'Write the image-to-video prompt now.',
  ]
    .filter(Boolean)
    .join('\n\n')
}
