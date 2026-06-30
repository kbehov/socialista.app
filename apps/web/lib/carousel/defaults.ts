import type { Slide, TextLayer } from '@socialista/types'

export const DEFAULT_CANVAS = { width: 1080, height: 1350 } as const

export const DEFAULT_SLIDE_BACKGROUND = '#1a1a2e'

export const FONT_FAMILIES = [
  'Inter, system-ui, sans-serif',
  'Georgia, serif',
  '"Times New Roman", serif',
  'Arial, sans-serif',
  '"Courier New", monospace',
  'Impact, sans-serif',
  '"Comic Sans MS", cursive',
] as const

export const DEFAULT_LAYER_STYLE: TextLayer['style'] = {
  fontFamily: FONT_FAMILIES[0],
  fontSize: 64,
  fontWeight: 'bold',
  color: '#ffffff',
  backgroundColor: null,
  textAlign: 'center',
  letterSpacing: 0,
  lineHeight: 1.2,
  padding: 12,
  borderRadius: 8,
  textStrokeColor: null,
  textStrokeWidth: 0,
  textShadow: null,
}

export function createTextLayer(partial: Partial<TextLayer> & { zIndex: number }): TextLayer {
  return {
    id: `layer_${Math.random().toString(36).slice(2, 10)}`,
    type: 'text',
    content: 'Your text here',
    x: 10,
    y: 40,
    width: 80,
    height: 12,
    rotation: 0,
    ...partial,
    style: { ...DEFAULT_LAYER_STYLE, ...partial.style },
  }
}

export function createSlide(order: number, backgroundImageUrl = '', backgroundColor = DEFAULT_SLIDE_BACKGROUND): Slide {
  return {
    id: `slide_${Math.random().toString(36).slice(2, 10)}`,
    backgroundColor,
    backgroundImageUrl,
    layers: [],
    order,
  }
}

export function createSlidesFromContent(texts: string[]): Slide[] {
  return texts.map((text, order) => {
    const slide = createSlide(order)
    slide.layers = [
      createTextLayer({
        zIndex: 0,
        content: text,
        x: 8,
        y: 38,
        width: 84,
        height: 18,
      }),
    ]
    return slide
  })
}

export function sortLayers(layers: TextLayer[]): TextLayer[] {
  return [...layers].sort((a, b) => a.zIndex - b.zIndex)
}

/** Reassign zIndex values sequentially based on current order (0..n-1). */
export function reindexLayers(layers: TextLayer[]): TextLayer[] {
  return sortLayers(layers).map((layer, index) => ({ ...layer, zIndex: index }))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
