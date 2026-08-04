import type { MediaFilter } from '@/utils/media-filters'

/**
 * Instagram-style filter presets for slideshow / image / video editors.
 * Edit or add presets here — single source of truth for the filter carousel.
 */
export type MediaFilterPresetId =
  | 'original'
  | 'clarendon'
  | 'gingham'
  | 'moon'
  | 'lark'
  | 'reyes'
  | 'juno'
  | 'slumber'
  | 'crema'
  | 'ludwig'
  | 'aden'
  | 'perpetua'
  | 'amaro'
  | 'mayfair'
  | 'valencia'
  | 'xpro'
  | 'lofi'
  | 'inkwell'
  | 'nashville'
  | 'willow'

export type MediaFilterPreset = {
  id: MediaFilterPresetId
  label: string
  /** Filter stack applied when the preset is selected. Empty = Original / no filter. */
  filters: MediaFilter[]
}

export const MEDIA_FILTER_PRESETS: MediaFilterPreset[] = [
  { id: 'original', label: 'Original', filters: [] },
  {
    id: 'clarendon',
    label: 'Clarendon',
    filters: [
      { type: 'brightness', value: 0.1 },
      { type: 'contrast', value: 0.2 },
      { type: 'saturation', value: 0.25 },
    ],
  },
  {
    id: 'gingham',
    label: 'Gingham',
    filters: [
      { type: 'brightness', value: 0.08 },
      { type: 'saturation', value: -0.2 },
    ],
  },
  {
    id: 'moon',
    label: 'Moon',
    filters: [
      { type: 'grayscale', value: 1 },
      { type: 'contrast', value: 0.15 },
      { type: 'brightness', value: 0.05 },
    ],
  },
  {
    id: 'lark',
    label: 'Lark',
    filters: [
      { type: 'brightness', value: 0.12 },
      { type: 'contrast', value: -0.05 },
      { type: 'saturation', value: -0.15 },
    ],
  },
  {
    id: 'reyes',
    label: 'Reyes',
    filters: [
      { type: 'brightness', value: 0.15 },
      { type: 'contrast', value: -0.15 },
      { type: 'saturation', value: -0.25 },
    ],
  },
  {
    id: 'juno',
    label: 'Juno',
    filters: [
      { type: 'contrast', value: 0.15 },
      { type: 'saturation', value: 0.35 },
      { type: 'brightness', value: 0.05 },
    ],
  },
  {
    id: 'slumber',
    label: 'Slumber',
    filters: [
      { type: 'brightness', value: 0.05 },
      { type: 'saturation', value: -0.35 },
      { type: 'contrast', value: -0.1 },
    ],
  },
  {
    id: 'crema',
    label: 'Crema',
    filters: [
      { type: 'brightness', value: 0.05 },
      { type: 'contrast', value: -0.1 },
      { type: 'saturation', value: -0.1 },
    ],
  },
  {
    id: 'ludwig',
    label: 'Ludwig',
    filters: [
      { type: 'brightness', value: 0.05 },
      { type: 'contrast', value: 0.1 },
      { type: 'saturation', value: -0.15 },
    ],
  },
  {
    id: 'aden',
    label: 'Aden',
    filters: [
      { type: 'brightness', value: 0.1 },
      { type: 'contrast', value: -0.1 },
      { type: 'saturation', value: -0.2 },
    ],
  },
  {
    id: 'perpetua',
    label: 'Perpetua',
    filters: [
      { type: 'brightness', value: 0.08 },
      { type: 'contrast', value: 0.1 },
      { type: 'saturation', value: -0.05 },
    ],
  },
  {
    id: 'amaro',
    label: 'Amaro',
    filters: [
      { type: 'brightness', value: 0.15 },
      { type: 'contrast', value: 0.1 },
      { type: 'saturation', value: 0.2 },
    ],
  },
  {
    id: 'mayfair',
    label: 'Mayfair',
    filters: [
      { type: 'contrast', value: 0.15 },
      { type: 'saturation', value: 0.15 },
      { type: 'brightness', value: 0.05 },
    ],
  },
  {
    id: 'valencia',
    label: 'Valencia',
    filters: [
      { type: 'brightness', value: 0.12 },
      { type: 'contrast', value: 0.08 },
      { type: 'saturation', value: 0.1 },
    ],
  },
  {
    id: 'xpro',
    label: 'X-Pro II',
    filters: [
      { type: 'contrast', value: 0.3 },
      { type: 'saturation', value: 0.2 },
      { type: 'brightness', value: 0.05 },
    ],
  },
  {
    id: 'lofi',
    label: 'Lo-Fi',
    filters: [
      { type: 'contrast', value: 0.35 },
      { type: 'saturation', value: 0.2 },
    ],
  },
  {
    id: 'inkwell',
    label: 'Inkwell',
    filters: [
      { type: 'grayscale', value: 1 },
      { type: 'contrast', value: 0.2 },
    ],
  },
  {
    id: 'nashville',
    label: 'Nashville',
    filters: [
      { type: 'brightness', value: 0.1 },
      { type: 'contrast', value: -0.05 },
      { type: 'saturation', value: 0.2 },
    ],
  },
  {
    id: 'willow',
    label: 'Willow',
    filters: [
      { type: 'grayscale', value: 0.65 },
      { type: 'contrast', value: -0.05 },
      { type: 'brightness', value: 0.08 },
    ],
  },
]

function filterSignature(filters: readonly MediaFilter[]): string {
  return [...filters]
    .map(f => `${f.type}:${f.value}`)
    .sort()
    .join('|')
}

/** Returns the matching preset id, or null when filters are a custom mix. */
export function getActiveMediaFilterPresetId(
  filters: readonly MediaFilter[] | undefined,
): MediaFilterPresetId | null {
  const signature = filterSignature(filters ?? [])
  const match = MEDIA_FILTER_PRESETS.find(preset => filterSignature(preset.filters) === signature)
  return match?.id ?? null
}
