import { clampInfluencerShotCount, type AspectRatio, type InfluencerShotId } from '@socialista/types'

export type InfluencerWardrobeSlot = 'casual' | 'onCamera' | 'active'

export type InfluencerShot = {
  id: InfluencerShotId
  label: string
  aspectRatio: AspectRatio
  /** Tight 1–2 sentence IG / TikTok / Pinterest camera direction. */
  promptSuffix: string
  wardrobeSlot: InfluencerWardrobeSlot
  /** When true, append wardrobe + setting from niche / character sheet. */
  useNicheScene?: boolean
}

/**
 * Generation shots. Suffixes stay short — models attend better to ~2 sentences than prompt soup.
 */
export const INFLUENCER_GENERATION_SHOTS: InfluencerShot[] = [
  {
    id: 'front-portrait',
    label: 'Front portrait',
    aspectRatio: '1:1',
    promptSuffix:
      'Instagram profile portrait: tight head-and-shoulders crop, eye-level 85mm look, face fills the frame as identity anchor, calm half-smile to camera. The place behind is their usual posting spot — styled, lived-in, and grid-ready, never a blank wall.',
    wardrobeSlot: 'casual',
    useNicheScene: true,
  },
  {
    id: 'full-body',
    label: 'Full body',
    aspectRatio: '9:16',
    promptSuffix:
      'TikTok / Reels full-body vertical: head-to-shoes with breathing room, 35mm eye-level, relaxed weight-on-one-leg stance. Outfit and place look like a post already on their grid. Same person.',
    wardrobeSlot: 'casual',
    useNicheScene: true,
  },
  {
    id: 'selfie-talking',
    label: 'Selfie talking',
    aspectRatio: '9:16',
    promptSuffix:
      "TikTok talking-head selfie: arm's-length phone front camera, face in upper third, eyes locked to lens, mid-sentence expression with open mouth, slight wide-angle HDR phone look. Handheld in the spot they actually film, not a studio.",
    wardrobeSlot: 'onCamera',
    useNicheScene: true,
  },
]

/** Ordered shots for influencer creation — portrait, full body, distinct UGC frame. */
export function getInfluencerGenerationShots(count?: number): InfluencerShot[] {
  if (count == null) return INFLUENCER_GENERATION_SHOTS
  return INFLUENCER_GENERATION_SHOTS.slice(0, clampInfluencerShotCount(count))
}
