import { HydratedDocument, Types } from 'mongoose'

export enum SlideshowStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export type SlideshowCanvas = {
  width: number
  height: number
}

export type SlideshowTextShadow = {
  offsetX: number
  offsetY: number
  blur: number
  color: string
}

export type SlideshowTextLayerStyle = {
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  color: string
  backgroundColor: string | null
  textAlign: 'left' | 'center' | 'right'
  letterSpacing?: number
  lineHeight?: number
  padding?: number
  borderRadius?: number
  textStrokeColor?: string | null
  textStrokeWidth?: number
  textShadow?: SlideshowTextShadow[] | null
}

export type SlideshowTextLayer = {
  id: string
  type: 'text'
  content: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  style: SlideshowTextLayerStyle
}

export type SlideshowCropArea = {
  x: number
  y: number
  width: number
  height: number
}

export type SlideshowBackgroundImageFilterType =
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'blur'
  | 'grayscale'

export type SlideshowBackgroundImageFilter = {
  type: SlideshowBackgroundImageFilterType
  value: number
}

export type SlideshowBackgroundImageAdjustment =
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
      positionX: number
      positionY: number
    }
  | {
      type: 'crop'
      crop: { x: number; y: number }
      zoom: number
      area: SlideshowCropArea
    }

export type SlideshowSlide = {
  id: string
  backgroundColor: string
  backgroundImageUrl: string
  backgroundImageAdjustment: SlideshowBackgroundImageAdjustment
  backgroundImageFilters: SlideshowBackgroundImageFilter[]
  layers: SlideshowTextLayer[]
  order: number
}

export interface ISlideshow {
  _id: Types.ObjectId
  name: string
  status: SlideshowStatus
  workspace: Types.ObjectId
  createdBy: Types.ObjectId
  canvas: SlideshowCanvas
  aspectRatioId: string
  slides: SlideshowSlide[]
  createdAt: Date
  updatedAt: Date
}

export type SlideshowDocument = HydratedDocument<ISlideshow>
