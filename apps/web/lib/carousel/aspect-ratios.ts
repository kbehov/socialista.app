import type { CanvasDimensions } from '@socialista/types'

export type AspectRatioPreset = {
  id: string
  label: string
  platform: string
  dimensions: CanvasDimensions
}

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  {
    id: 'instagram-portrait',
    label: 'Portrait',
    platform: 'Instagram',
    dimensions: { width: 1080, height: 1350 },
  },
  {
    id: 'instagram-square',
    label: 'Square',
    platform: 'Instagram',
    dimensions: { width: 1080, height: 1080 },
  },
  {
    id: 'instagram-story',
    label: 'Story / Reel',
    platform: 'Instagram',
    dimensions: { width: 1080, height: 1920 },
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    platform: 'TikTok',
    dimensions: { width: 1080, height: 1920 },
  },
  {
    id: 'linkedin',
    label: 'Post',
    platform: 'LinkedIn',
    dimensions: { width: 1080, height: 1080 },
  },
  {
    id: 'twitter',
    label: 'Post',
    platform: 'X',
    dimensions: { width: 1600, height: 900 },
  },
  {
    id: 'facebook',
    label: 'Link preview',
    platform: 'Facebook',
    dimensions: { width: 1200, height: 630 },
  },
]

export const DEFAULT_ASPECT_RATIO_ID = 'instagram-portrait'

export function getAspectRatioPreset(id: string): AspectRatioPreset {
  return ASPECT_RATIO_PRESETS.find(p => p.id === id) ?? ASPECT_RATIO_PRESETS[0]
}

export function findAspectRatioId(dimensions: CanvasDimensions): string {
  const match = ASPECT_RATIO_PRESETS.find(
    preset =>
      preset.dimensions.width === dimensions.width && preset.dimensions.height === dimensions.height,
  )
  return match?.id ?? DEFAULT_ASPECT_RATIO_ID
}

export function formatAspectRatio(dimensions: CanvasDimensions): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(dimensions.width, dimensions.height)
  return `${dimensions.width / divisor}:${dimensions.height / divisor}`
}
