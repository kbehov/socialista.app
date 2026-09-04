import type {
  BackgroundImageAdjustment,
  CanvasDimensions,
  OverlayLayer,
  Slide,
  SlideLayer,
  SlideshowPlan,
  SlideshowPlanSlide,
  SlideshowPlanTheme,
  TextLayer,
  TextLayerStyle,
} from '@socialista/types'

const DEFAULT_BACKGROUND_ADJUSTMENT: BackgroundImageAdjustment = {
  type: 'frame',
  scale: 1,
  offsetX: 0,
  offsetY: 0,
}

const DEFAULT_LAYER_STYLE: TextLayerStyle = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 48,
  fontWeight: 'bold',
  color: '#ffffff',
  backgroundColor: null,
  textAlign: 'center',
  letterSpacing: -0.4,
  lineHeight: 1.15,
  padding: 0,
  borderRadius: 0,
  textStrokeColor: null,
  textStrokeWidth: 0,
  textShadow: null,
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

function textStyle(theme: SlideshowPlanTheme, color: string, extra?: Partial<TextLayerStyle>): TextLayerStyle {
  return {
    ...DEFAULT_LAYER_STYLE,
    fontFamily: theme.fontFamily || DEFAULT_LAYER_STYLE.fontFamily,
    color,
    ...extra,
  }
}

function createTextLayer(partial: Partial<TextLayer> & { zIndex: number; content: string; style: TextLayerStyle }): TextLayer {
  return {
    id: createId('layer'),
    type: 'text',
    x: 8,
    y: 38,
    width: 84,
    height: 24,
    rotation: 0,
    ...partial,
  }
}

function createOverlayLayer(partial: Partial<OverlayLayer> & { zIndex: number }): OverlayLayer {
  return {
    id: createId('layer'),
    type: 'overlay',
    color: '#000000',
    opacity: 0.42,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    borderRadius: 0,
    ...partial,
  }
}

function buildFullBleedSlide(
  planned: SlideshowPlanSlide,
  theme: SlideshowPlanTheme,
  imageUrl: string | undefined,
  order: number,
): Slide {
  if (!imageUrl) {
    return buildMinimalSlide(planned, theme, order)
  }

  const layers: SlideLayer[] = [
    createOverlayLayer({ zIndex: 0 }),
    createTextLayer({
      zIndex: 1,
      content: planned.text,
      x: 7,
      y: 36,
      width: 86,
      height: 32,
      style: textStyle(theme, '#ffffff', {
        textAlign: 'center',
        fontSize: order === 0 ? 56 : 48,
        textShadow: [{ offsetX: 0, offsetY: 2, blur: 14, color: 'rgba(0,0,0,0.55)' }],
      }),
    }),
  ]

  return {
    id: createId('slide'),
    backgroundColor: theme.backgroundColor,
    backgroundImageUrl: imageUrl,
    backgroundImageAdjustment: DEFAULT_BACKGROUND_ADJUSTMENT,
    backgroundImageFilters: [],
    layers,
    order,
  }
}

function buildMinimalSlide(planned: SlideshowPlanSlide, theme: SlideshowPlanTheme, order: number): Slide {
  return {
    id: createId('slide'),
    backgroundColor: theme.backgroundColor,
    backgroundImageUrl: '',
    backgroundImageAdjustment: DEFAULT_BACKGROUND_ADJUSTMENT,
    backgroundImageFilters: [],
    layers: [
      createTextLayer({
        zIndex: 0,
        content: planned.text,
        x: 8,
        y: 32,
        width: 84,
        height: 36,
        style: textStyle(theme, theme.textColor, {
          textAlign: 'center',
          fontSize: order === 0 ? 56 : 48,
        }),
      }),
    ],
    order,
  }
}

export function buildSlideshowSlides(
  plan: SlideshowPlan,
  imageUrlsBySlide: Array<string | undefined>,
  _canvas: CanvasDimensions,
): Slide[] {
  return plan.slides.map((planned, order) => {
    const imageUrl = imageUrlsBySlide[order]
    if (imageUrl) {
      return buildFullBleedSlide(planned, plan.theme, imageUrl, order)
    }
    return buildMinimalSlide(planned, plan.theme, order)
  })
}

export function canvasToImageAspectRatio(canvas: CanvasDimensions): '1:1' | '16:9' | '9:16' | '4:3' {
  const ratio = canvas.width / canvas.height
  if (ratio >= 1.4) return '16:9'
  if (ratio >= 1.15) return '4:3'
  if (ratio >= 0.9) return '1:1'
  return '9:16'
}

export function buildSlideImagePrompt(imageQuery: string): string {
  const query = imageQuery.trim()
  return `${query}, cinematic editorial photography, high-end social content, natural lighting, no text, no watermark, no logos, no captions`
}
