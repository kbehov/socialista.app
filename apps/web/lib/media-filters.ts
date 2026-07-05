export type MediaFilterType = 'brightness' | 'contrast' | 'saturation' | 'blur' | 'grayscale'

export type MediaFilter = {
  type: MediaFilterType
  value: number
}

export const MEDIA_FILTER_DEFS: {
  type: MediaFilterType
  label: string
  min: number
  max: number
  step: number
}[] = [
  { type: 'brightness', label: 'Brightness', min: -1, max: 1, step: 0.05 },
  { type: 'contrast', label: 'Contrast', min: -1, max: 1, step: 0.05 },
  { type: 'saturation', label: 'Saturation', min: -1, max: 1, step: 0.05 },
  { type: 'blur', label: 'Blur', min: 0, max: 20, step: 0.5 },
  { type: 'grayscale', label: 'Grayscale', min: 0, max: 1, step: 0.05 },
]

export function filtersToCss(filters: readonly MediaFilter[] | undefined): string {
  if (!filters?.length) return ''

  const parts: string[] = []
  for (const filter of filters) {
    switch (filter.type) {
      case 'brightness':
        parts.push(`brightness(${1 + filter.value})`)
        break
      case 'contrast':
        parts.push(`contrast(${1 + filter.value})`)
        break
      case 'saturation':
        parts.push(`saturate(${1 + filter.value})`)
        break
      case 'blur':
        parts.push(`blur(${filter.value}px)`)
        break
      case 'grayscale':
        parts.push(`grayscale(${filter.value})`)
        break
    }
  }

  return parts.join(' ')
}
