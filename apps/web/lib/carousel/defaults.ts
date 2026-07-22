import type {
  BackgroundImageAdjustment,
  BackgroundImageFilter,
  BackgroundImageTransform,
  ImageLayer,
  OverlayLayer,
  Slide,
  SlideLayer,
  TextLayer,
} from '@socialista/types'
import { createLayerId, createSlideId } from './id'

export const DEFAULT_BACKGROUND_TRANSFORM: BackgroundImageTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
}

export const DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT: BackgroundImageAdjustment = {
  type: 'frame',
  ...DEFAULT_BACKGROUND_TRANSFORM,
}

export const MIN_BACKGROUND_SCALE = 1
export const MAX_BACKGROUND_SCALE = 4

export const DEFAULT_VIEWPORT_ZOOM = 1
export const DEFAULT_VIDEO_PREVIEW_ZOOM = 1
export const MIN_VIEWPORT_ZOOM = 0.25
export const MAX_VIEWPORT_ZOOM = 2
export const VIEWPORT_ZOOM_STEP = 0.1

export const DEFAULT_CANVAS = { width: 1080, height: 1350 } as const

export const DEFAULT_SLIDE_BACKGROUND = '#f4f4f5'

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
    id: createLayerId(),
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

export function createImageLayer(
  partial: Partial<ImageLayer> & { zIndex: number; imageUrl?: string },
): ImageLayer {
  return {
    id: createLayerId(),
    type: 'image',
    imageUrl: partial.imageUrl ?? '',
    x: 30,
    y: 30,
    width: 40,
    height: 40,
    rotation: 0,
    objectFit: 'contain',
    opacity: 1,
    filters: [],
    ...partial,
  }
}

export function createOverlayLayer(partial: Partial<OverlayLayer> & { zIndex: number }): OverlayLayer {
  return {
    id: createLayerId(),
    type: 'overlay',
    color: '#000000',
    opacity: 0.4,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    borderRadius: 0,
    ...partial,
  }
}

export function createSlide(order: number, backgroundImageUrl = '', backgroundColor = DEFAULT_SLIDE_BACKGROUND): Slide {
  return {
    id: createSlideId(),
    backgroundColor,
    backgroundImageUrl,
    backgroundImageAdjustment: DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT,
    backgroundImageFilters: [],
    layers: [],
    order,
  }
}

export function isBlankSlide(slide: Slide): boolean {
  return !slide.backgroundImageUrl && slide.layers.length === 0
}

export function createGeneratedTextLayer(text: string, zIndex: number): TextLayer {
  return createTextLayer({
    zIndex,
    content: text,
    x: 8,
    y: 38,
    width: 84,
    height: 18,
  })
}

/** Apply AI-generated copy to a slide without changing its background or id. */
export function applyGeneratedTextToSlide(slide: Slide, text: string): Slide {
  const primaryTextLayer = sortLayers(slide.layers).find(layer => layer.type === 'text')
  if (primaryTextLayer) {
    return {
      ...slide,
      layers: slide.layers.map(layer =>
        layer.id === primaryTextLayer.id ? { ...layer, content: text } : layer,
      ),
    }
  }

  return {
    ...slide,
    layers: reindexLayers([
      ...slide.layers,
      createGeneratedTextLayer(text, slide.layers.length),
    ]),
  }
}

export function createSlideWithGeneratedText(text: string, order: number): Slide {
  const slide = createSlide(order)
  slide.layers = [createGeneratedTextLayer(text, 0)]
  return slide
}

export function createSlidesFromContent(texts: string[]): Slide[] {
  return texts.map((text, order) => createSlideWithGeneratedText(text, order))
}

/** Merge AI texts into existing slides; create only the slides that are missing. */
export function mergeGeneratedTextsIntoSlides(existingSlides: Slide[], texts: string[]): Slide[] {
  const workingSlides =
    existingSlides.length === 1 && existingSlides[0] && isBlankSlide(existingSlides[0])
      ? []
      : existingSlides

  const merged: Slide[] = []

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]!
    if (i < workingSlides.length) {
      merged.push(applyGeneratedTextToSlide(workingSlides[i]!, text))
    } else {
      merged.push(createSlideWithGeneratedText(text, i))
    }
  }

  if (workingSlides.length > texts.length) {
    merged.push(
      ...workingSlides.slice(texts.length).map((slide, index) => ({
        ...slide,
        order: texts.length + index,
      })),
    )
  }

  return merged.map((slide, order) => ({ ...slide, order }))
}

export function sortLayers(layers: SlideLayer[]): SlideLayer[] {
  return [...layers].sort((a, b) => a.zIndex - b.zIndex)
}

/** Reassign zIndex values sequentially from array order (0 = back, n-1 = front). */
export function reindexLayers(layers: SlideLayer[]): SlideLayer[] {
  return layers.map((layer, index) => ({ ...layer, zIndex: index }))
}

export function cloneLayer(layer: SlideLayer): SlideLayer {
  if (layer.type === 'text') {
    return { ...layer, style: { ...layer.style } }
  }
  if (layer.type === 'image') {
    return { ...layer, filters: [...layer.filters] }
  }
  return { ...layer }
}

export function normalizeLayer(layer: SlideLayer): SlideLayer {
  if (layer.type === 'text') {
    return layer
  }
  if (layer.type === 'overlay') {
    return {
      ...layer,
      opacity: typeof layer.opacity === 'number' ? layer.opacity : 0.4,
      borderRadius: typeof layer.borderRadius === 'number' ? layer.borderRadius : 0,
    }
  }
  return {
    ...layer,
    objectFit: layer.objectFit === 'cover' ? 'cover' : 'contain',
    opacity: typeof layer.opacity === 'number' ? layer.opacity : 1,
    filters: normalizeSlideBackgroundFilters(layer.filters),
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function normalizeSlideBackgroundAdjustment(
  adjustment: BackgroundImageAdjustment | undefined | null,
): BackgroundImageAdjustment {
  if (!adjustment) return DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT

  if (adjustment.type === 'frame') {
    return {
      type: 'frame',
      scale:
        typeof adjustment.scale === 'number'
          ? adjustment.scale
          : DEFAULT_BACKGROUND_TRANSFORM.scale,
      offsetX:
        typeof adjustment.offsetX === 'number'
          ? adjustment.offsetX
          : DEFAULT_BACKGROUND_TRANSFORM.offsetX,
      offsetY:
        typeof adjustment.offsetY === 'number'
          ? adjustment.offsetY
          : DEFAULT_BACKGROUND_TRANSFORM.offsetY,
    }
  }

  if (adjustment.type === 'zoom') {
    return {
      type: 'zoom',
      scale: typeof adjustment.scale === 'number' ? adjustment.scale : 1,
      positionX: typeof adjustment.positionX === 'number' ? adjustment.positionX : 0,
      positionY: typeof adjustment.positionY === 'number' ? adjustment.positionY : 0,
    }
  }

  return adjustment
}

export function normalizeSlideBackgroundFilters(
  filters: BackgroundImageFilter[] | undefined | null,
): BackgroundImageFilter[] {
  if (!filters?.length) return []
  return filters.filter(
    (filter): filter is BackgroundImageFilter =>
      typeof filter?.type === 'string' && typeof filter?.value === 'number',
  )
}

export function normalizeSlide(slide: Slide): Slide {
  return {
    ...slide,
    backgroundImageAdjustment: normalizeSlideBackgroundAdjustment(slide.backgroundImageAdjustment),
    backgroundImageFilters: normalizeSlideBackgroundFilters(slide.backgroundImageFilters),
    layers: slide.layers.map(normalizeLayer),
  }
}
