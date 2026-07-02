import type { BackgroundImageAdjustment, Slide, TextLayer } from '@socialista/types'

export const DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT: BackgroundImageAdjustment = { type: 'cover' }

export const DEFAULT_CANVAS = { width: 1080, height: 1350 } as const

export const DEFAULT_SLIDE_BACKGROUND = '#22c55e'

export const FONT_FAMILIES = [
  'Arial, Helvetica, sans-serif',
  'Impact, Haettenschweiler, sans-serif',
  'Inter, system-ui, sans-serif',
  'Helvetica, Arial, sans-serif',
  'Verdana, Geneva, sans-serif',
  '"Trebuchet MS", Helvetica, sans-serif',
  '"Arial Black", Gadget, sans-serif',
  'Georgia, serif',
  '"Times New Roman", Times, serif',
  '"Courier New", Courier, monospace',
  '"Comic Sans MS", cursive',
  '"Segoe UI", Tahoma, sans-serif',
  'system-ui, sans-serif',
] as const

export type FontFamily = (typeof FONT_FAMILIES)[number]

export const FONT_LABELS: Record<FontFamily, string> = {
  'Arial, Helvetica, sans-serif': 'Arial',
  'Impact, Haettenschweiler, sans-serif': 'Impact',
  'Inter, system-ui, sans-serif': 'Inter',
  'Helvetica, Arial, sans-serif': 'Helvetica',
  'Verdana, Geneva, sans-serif': 'Verdana',
  '"Trebuchet MS", Helvetica, sans-serif': 'Trebuchet MS',
  '"Arial Black", Gadget, sans-serif': 'Arial Black',
  'Georgia, serif': 'Georgia',
  '"Times New Roman", Times, serif': 'Times New Roman',
  '"Courier New", Courier, monospace': 'Courier New',
  '"Comic Sans MS", cursive': 'Comic Sans',
  '"Segoe UI", Tahoma, sans-serif': 'Segoe UI',
  'system-ui, sans-serif': 'System UI',
}

export const DEFAULT_FONT = FONT_FAMILIES[0]

export const DEFAULT_LAYER_STYLE: TextLayer['style'] = {
  fontFamily: DEFAULT_FONT,
  fontSize: 48,
  fontWeight: 'bold',
  color: '#ffffff',
  backgroundColor: null,
  textAlign: 'center',
  letterSpacing: 0,
  lineHeight: 1.2,
  padding: 0,
  borderRadius: 0,
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
    backgroundImageAdjustment: DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT,
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
