import type { CanvasDimensions } from '@socialista/types'

export type VideoFormatPreset = {
  id: string
  label: string
  platform: string
  dimensions: CanvasDimensions
}

export const VIDEO_FORMAT_PRESETS = [
  {
    id: 'instagram-story',
    label: 'Story / Reel',
    platform: 'Instagram',
    dimensions: { width: 1080, height: 1920 },
  },
  {
    id: 'instagram-square',
    label: 'Square',
    platform: 'Instagram',
    dimensions: { width: 1080, height: 1080 },
  },
  {
    id: 'instagram-portrait',
    label: 'Portrait',
    platform: 'Instagram',
    dimensions: { width: 1080, height: 1350 },
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    platform: 'TikTok',
    dimensions: { width: 1080, height: 1920 },
  },
  {
    id: 'facebook-story',
    label: 'Story / Reel',
    platform: 'Facebook',
    dimensions: { width: 1080, height: 1920 },
  },
  {
    id: 'facebook-square',
    label: 'Square',
    platform: 'Facebook',
    dimensions: { width: 1080, height: 1080 },
  },
  {
    id: 'facebook-portrait',
    label: 'Portrait',
    platform: 'Facebook',
    dimensions: { width: 1080, height: 1350 },
  },
  {
    id: 'facebook',
    label: 'Landscape',
    platform: 'Facebook',
    dimensions: { width: 1200, height: 630 },
  },
  {
    id: 'linkedin-story',
    label: 'Story',
    platform: 'LinkedIn',
    dimensions: { width: 1080, height: 1920 },
  },
  {
    id: 'linkedin',
    label: 'Square',
    platform: 'LinkedIn',
    dimensions: { width: 1080, height: 1080 },
  },
  {
    id: 'linkedin-portrait',
    label: 'Portrait',
    platform: 'LinkedIn',
    dimensions: { width: 1080, height: 1350 },
  },
  {
    id: 'linkedin-landscape',
    label: 'Landscape',
    platform: 'LinkedIn',
    dimensions: { width: 1200, height: 627 },
  },
  {
    id: 'pinterest-story',
    label: 'Story / Idea pin',
    platform: 'Pinterest',
    dimensions: { width: 1080, height: 1920 },
  },
  {
    id: 'pinterest-pin',
    label: 'Pin',
    platform: 'Pinterest',
    dimensions: { width: 1000, height: 1500 },
  },
  {
    id: 'pinterest-square',
    label: 'Square',
    platform: 'Pinterest',
    dimensions: { width: 1000, height: 1000 },
  },
  {
    id: 'twitter',
    label: 'Post',
    platform: 'X',
    dimensions: { width: 1600, height: 900 },
  },
] as const satisfies readonly VideoFormatPreset[]

export type VideoFormatPresetId = (typeof VIDEO_FORMAT_PRESETS)[number]['id']

export const VIDEO_FORMAT_PRESET_IDS: readonly VideoFormatPresetId[] = VIDEO_FORMAT_PRESETS.map(
  preset => preset.id,
)

export const DEFAULT_VIDEO_FORMAT_PRESET_ID: VideoFormatPresetId = 'tiktok'

export function dimensionsMatch(a: CanvasDimensions, b: CanvasDimensions): boolean {
  return a.width === b.width && a.height === b.height
}

export function getVideoFormatPreset(id: string): VideoFormatPreset | undefined {
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
