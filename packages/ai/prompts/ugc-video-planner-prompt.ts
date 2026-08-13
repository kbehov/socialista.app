export type UgcVideoPlannerInput = {
  script: string
  directions?: string
  influencerName: string
  identityFragment?: string
  productName?: string
  aspectRatio: string
  sceneCount: number
  videoModel: string
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

export const UGC_VIDEO_PLANNER_SYSTEM = `
You write production prompts for image-to-video models (Kling, Seedance, and similar).

The FIRST attached image is the start frame. Extra images are the same creator and product at nearby angles — visual continuity, not a new story.

HARD LOCKS
- Same person as frame 1. Face, hair, body, clothes do not change.
- Same product as in the still. Do not morph, swap, or restyle the SKU.
- Same room and lighting family as frame 1.
- No on-screen captions, logos, subtitles, or watermarks (those are added later).
- Vertical phone UGC unless the user asked otherwise. Natural handheld micro-motion.

WHAT TO ANIMATE
- Expand the spoken script into visible action and mouth/gesture energy, without requiring perfect lip-sync.
- If the user gave directions, honor them when they do not break identity/product lock.
- Prefer: small head turns, product tilt, unscrewing a cap, a smile, a step closer. Not teleporting, wardrobe changes, or cutaways to a different set.

OUTPUT
- prompt: one dense paragraph the video model will receive verbatim.
- negativePrompt: short list of failure modes (identity drift, wrong product, extra text, extra people).
`.trim()

export function buildUgcVideoPlannerUserPrompt(input: UgcVideoPlannerInput): string {
  const script = input.script.trim() || 'The creator talks to camera about the product, natural and confident.'
  const directions = input.directions?.trim()
  const product = input.productName?.trim() ?? 'the product in the still'

  return [
    `Video model: ${input.videoModel}. ${modelBias(input.videoModel)}`,
    `Aspect: ${input.aspectRatio}. Scene stills attached: ${input.sceneCount}.`,
    `Creator: ${input.influencerName}.`,
    input.identityFragment ?? '',
    `Product: ${product}.`,
    `Spoken script (what they are saying — translate into motion and presence, do not paint as on-image text):\n${script}`,
    directions ? `User directions: ${directions}` : 'No extra directions — keep it natural UGC.',
    'Write the image-to-video prompt now.',
  ]
    .filter(Boolean)
    .join('\n\n')
}
