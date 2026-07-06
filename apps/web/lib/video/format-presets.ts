import {
  ASPECT_RATIO_PRESETS,
  type AspectRatioPreset,
} from '@/lib/carousel/aspect-ratios'
import type { CanvasDimensions } from '@socialista/types'

export const VIDEO_FORMAT_PRESET_IDS = [
  'instagram-story',
  'tiktok',
  'instagram-square',
  'twitter',
] as const

export type VideoFormatPresetId = (typeof VIDEO_FORMAT_PRESET_IDS)[number]

export const VIDEO_FORMAT_PRESETS: AspectRatioPreset[] = ASPECT_RATIO_PRESETS.filter(p =>
  (VIDEO_FORMAT_PRESET_IDS as readonly string[]).includes(p.id),
)

export const DEFAULT_VIDEO_FORMAT_PRESET_ID: VideoFormatPresetId = 'tiktok'

export function dimensionsMatch(a: CanvasDimensions, b: CanvasDimensions): boolean {
  return a.width === b.width && a.height === b.height
}

export function getVideoFormatPreset(id: string): AspectRatioPreset | undefined {
  return VIDEO_FORMAT_PRESETS.find(preset => preset.id === id)
}

/** Resolve preset id from resolution, keeping the current id when dimensions still match. */
export function resolveVideoFormatPresetId(
  resolution: CanvasDimensions,
  currentPresetId?: string,
): VideoFormatPresetId {
  const current = currentPresetId ? getVideoFormatPreset(currentPresetId) : undefined
  if (current && dimensionsMatch(current.dimensions, resolution)) {
    return currentPresetId as VideoFormatPresetId
  }

  const match = VIDEO_FORMAT_PRESETS.find(preset => dimensionsMatch(preset.dimensions, resolution))
  return (match?.id as VideoFormatPresetId | undefined) ?? DEFAULT_VIDEO_FORMAT_PRESET_ID
}
