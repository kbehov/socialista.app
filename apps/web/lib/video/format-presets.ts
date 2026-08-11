import type { CanvasDimensions } from '@socialista/types'

/** Percent insets for platform UI dead zones (top / bottom / left / right). */
export type SafeZoneInsets = {
  top: number
  bottom: number
  left: number
  right: number
}

export type VideoFormatPreset = {
  id: string
  label: string
  platform: string
  dimensions: CanvasDimensions
  /** Optional safe-zone guides for social UI (captions, buttons, etc.). */
  safeZone?: SafeZoneInsets
}

/** Vertical 9:16 platforms share TikTok/Reels-style UI insets. */
const VERTICAL_SAFE_ZONE: SafeZoneInsets = {
  top: 8,
  bottom: 18,
  left: 4,
  right: 4,
}

const SQUARE_SAFE_ZONE: SafeZoneInsets = {
  top: 6,
  bottom: 12,
  left: 4,
  right: 4,
}

const LANDSCAPE_SAFE_ZONE: SafeZoneInsets = {
  top: 6,
  bottom: 10,
  left: 4,
  right: 4,
}

export const VIDEO_FORMAT_PRESETS = [
  {
    id: 'instagram-story',
    label: 'Story / Reel',
    platform: 'Instagram',
    dimensions: { width: 1080, height: 1920 },
    safeZone: VERTICAL_SAFE_ZONE,
  },
  {
    id: 'instagram-square',
    label: 'Square',
    platform: 'Instagram',
    dimensions: { width: 1080, height: 1080 },
    safeZone: SQUARE_SAFE_ZONE,
  },
  {
    id: 'instagram-portrait',
    label: 'Portrait',
    platform: 'Instagram',
    dimensions: { width: 1080, height: 1350 },
    safeZone: { top: 6, bottom: 14, left: 4, right: 4 },
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    platform: 'TikTok',
    dimensions: { width: 1080, height: 1920 },
    safeZone: VERTICAL_SAFE_ZONE,
  },
  {
    id: 'facebook-story',
    label: 'Story / Reel',
    platform: 'Facebook',
    dimensions: { width: 1080, height: 1920 },
    safeZone: VERTICAL_SAFE_ZONE,
  },
  {
    id: 'facebook-square',
    label: 'Square',
    platform: 'Facebook',
    dimensions: { width: 1080, height: 1080 },
    safeZone: SQUARE_SAFE_ZONE,
  },
  {
    id: 'facebook-portrait',
    label: 'Portrait',
    platform: 'Facebook',
    dimensions: { width: 1080, height: 1350 },
    safeZone: { top: 6, bottom: 14, left: 4, right: 4 },
  },
  {
    id: 'facebook',
    label: 'Landscape',
    platform: 'Facebook',
    dimensions: { width: 1200, height: 630 },
    safeZone: LANDSCAPE_SAFE_ZONE,
  },
  {
    id: 'linkedin-story',
    label: 'Story',
    platform: 'LinkedIn',
    dimensions: { width: 1080, height: 1920 },
    safeZone: VERTICAL_SAFE_ZONE,
  },
  {
    id: 'linkedin',
    label: 'Square',
    platform: 'LinkedIn',
    dimensions: { width: 1080, height: 1080 },
    safeZone: SQUARE_SAFE_ZONE,
  },
  {
    id: 'linkedin-portrait',
    label: 'Portrait',
    platform: 'LinkedIn',
    dimensions: { width: 1080, height: 1350 },
    safeZone: { top: 6, bottom: 14, left: 4, right: 4 },
  },
  {
    id: 'linkedin-landscape',
    label: 'Landscape',
    platform: 'LinkedIn',
    dimensions: { width: 1200, height: 628 },
    safeZone: LANDSCAPE_SAFE_ZONE,
  },
  {
    id: 'pinterest-story',
    label: 'Story / Idea pin',
    platform: 'Pinterest',
    dimensions: { width: 1080, height: 1920 },
    safeZone: VERTICAL_SAFE_ZONE,
  },
  {
    id: 'pinterest-pin',
    label: 'Pin',
    platform: 'Pinterest',
    dimensions: { width: 1000, height: 1500 },
    safeZone: { top: 6, bottom: 12, left: 4, right: 4 },
  },
  {
    id: 'pinterest-square',
    label: 'Square',
    platform: 'Pinterest',
    dimensions: { width: 1000, height: 1000 },
    safeZone: SQUARE_SAFE_ZONE,
  },
  {
    id: 'twitter',
    label: 'Post',
    platform: 'X',
    dimensions: { width: 1600, height: 900 },
    safeZone: LANDSCAPE_SAFE_ZONE,
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
