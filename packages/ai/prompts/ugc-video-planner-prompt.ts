import type { UgcClipType } from '@socialista/types'

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
  talking: 'Animate talking-head energy: small head turns, blinks, natural mouth and gesture motion. Stay on this person.',
  'product-hold': 'Keep the product in hand. Slight product tilt, a step closer, a smile. Same SKU.',
  'b-roll': 'Product-only motion: slow push-in, gentle rotation, light shifting on materials. No new objects. No person unless already in frame 1.',
  unboxing: 'Hands open or lift the product from the packaging. Continuous action from frame 1. Same box and SKU.',
  'try-on': 'They adjust or show the product on their body. Natural selfie motion. Same garment/item.',
  'app-showcase': 'Phone stays readable. Slight handheld sway. Do not invent a different UI than the screen in frame 1.',
}

export const UGC_VIDEO_PLANNER_SYSTEM = `
You write production prompts for image-to-video models (Kling, Seedance, and similar).

The FIRST attached image is the start frame. Extra images are the same subject at nearby angles — visual continuity, not a new story.

HARD LOCKS
- Same person as frame 1 when a person is present. Face, hair, body, clothes do not change.
- Same product as in the still. Do not morph, swap, or restyle the SKU.
- Same room and lighting family as frame 1.
- No on-screen captions, logos, subtitles, or watermarks (those are added later).
- Vertical phone UGC unless the user asked otherwise. Natural handheld micro-motion.

WHAT TO ANIMATE
- Stay inside the requested duration. Do not describe a longer sequence than that.
- If there is a spoken script, translate it into motion and presence — do not paint it as on-image text. Skip spoken energy when there is no script (b-roll).
- Prefer small continuous action from frame 1. Not teleporting, wardrobe changes, or cutaways.

OUTPUT
- prompt: one dense paragraph the video model will receive verbatim.
- negativePrompt: short list of failure modes (identity drift, wrong product, extra text, extra people).
`.trim()

export function buildUgcVideoPlannerUserPrompt(input: UgcVideoPlannerInput): string {
  const hasScript = Boolean(input.script.trim())
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
    hasScript
      ? `Spoken script (motion and presence only, never as on-image text):\n${input.script.trim()}`
      : 'No spoken script. Animate the scene only.',
    directions ? `User directions: ${directions}` : 'No extra directions — keep it natural UGC.',
    'Write the image-to-video prompt now.',
  ]
    .filter(Boolean)
    .join('\n\n')
}
