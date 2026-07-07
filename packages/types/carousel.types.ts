export type SlideId = string
export type LayerId = string

export type CanvasDimensions = {
  width: number
  height: number
}

export type TextAlign = 'left' | 'center' | 'right'

export type FontWeight = 'normal' | 'bold'

export interface TextShadow {
  offsetX: number
  offsetY: number
  blur: number
  color: string
}

export interface TextLayerStyle {
  fontFamily: string
  /** Font size in px at the canvas's reference width (e.g. 1080). Scales with display. */
  fontSize: number
  fontWeight: FontWeight
  color: string
  /** Background fill behind the text, or null for transparent. */
  backgroundColor: string | null
  textAlign: TextAlign
  letterSpacing?: number
  lineHeight?: number
  padding?: number
  borderRadius?: number
  /** Outline stroke color, or null for none. */
  textStrokeColor?: string | null
  /** Outline width in px at reference canvas width. */
  textStrokeWidth?: number
  /** Drop shadows / glows at reference canvas scale. */
  textShadow?: TextShadow[] | null
}

export interface LayerGeometry {
  /** Position and size in percent (0–100) of the canvas, so the slide scales freely. */
  x: number
  y: number
  width: number
  height: number
  /** Rotation in degrees. */
  rotation: number
  zIndex: number
}

export interface TextLayer extends LayerGeometry {
  id: LayerId
  type: 'text'
  content: string
  style: TextLayerStyle
}

export type ImageLayerObjectFit = 'contain' | 'cover'

export interface ImageLayer extends LayerGeometry {
  id: LayerId
  type: 'image'
  imageUrl: string
  objectFit: ImageLayerObjectFit
  /** 0–1 */
  opacity: number
  filters: BackgroundImageFilter[]
}

export type SlideLayer = TextLayer | ImageLayer

/** Percentage rectangle of the source image (react-easy-crop). */
export interface CropAreaPercentages {
  x: number
  y: number
  width: number
  height: number
}

/** Zoom/pan transform for a full-bleed background image on the slide canvas. */
export interface BackgroundImageTransform {
  /** 1 = cover-fit; values above 1 zoom into the image. */
  scale: number
  /** Pan offset as a fraction of canvas width. */
  offsetX: number
  /** Pan offset as a fraction of canvas height. */
  offsetY: number
}

export type BackgroundImageFilterType = 'brightness' | 'contrast' | 'saturation' | 'blur' | 'grayscale'

export interface BackgroundImageFilter {
  type: BackgroundImageFilterType
  value: number
}

export type BackgroundImageAdjustment =
  | { type: 'cover' }
  | {
      type: 'frame'
      scale: number
      offsetX: number
      offsetY: number
    }
  | {
      type: 'zoom'
      scale: number
      /** Pan offset as a fraction of viewport width when saved. */
      positionX: number
      /** Pan offset as a fraction of viewport height when saved. */
      positionY: number
    }
  | {
      type: 'crop'
      crop: { x: number; y: number }
      zoom: number
      area: CropAreaPercentages
    }

export interface Slide {
  id: SlideId
  /** Solid fill behind optional background image. */
  backgroundColor: string
  backgroundImageUrl: string
  /** How the background image is framed inside the slide. */
  backgroundImageAdjustment: BackgroundImageAdjustment
  /** CSS-style image filters applied to the background photo. */
  backgroundImageFilters: BackgroundImageFilter[]
  layers: SlideLayer[]
  order: number
}

export type CarouselProject = {
  canvas: CanvasDimensions
  slides: Slide[]
}

export type CarouselExportFormat = 'png'
