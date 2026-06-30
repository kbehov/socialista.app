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

export interface TextLayer {
  id: LayerId
  type: 'text'
  content: string
  /** Position and size in percent (0–100) of the canvas, so the slide scales freely. */
  x: number
  y: number
  width: number
  height: number
  /** Rotation in degrees. */
  rotation: number
  zIndex: number
  style: TextLayerStyle
}

export interface Slide {
  id: SlideId
  /** Solid fill behind optional background image. */
  backgroundColor: string
  backgroundImageUrl: string
  layers: TextLayer[]
  order: number
}

export type CarouselProject = {
  canvas: CanvasDimensions
  slides: Slide[]
}

export type CarouselExportFormat = 'png'
