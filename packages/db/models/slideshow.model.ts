import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import {
  SlideshowStatus,
  type ISlideshow,
  type SlideshowBackgroundImageAdjustment,
  type SlideshowSlide,
  type SlideshowTextLayer,
  type SlideshowTextLayerStyle,
  type SlideshowTextShadow,
} from '../types/slideshow.types.js'

const textShadowSchema = new Schema<SlideshowTextShadow>(
  {
    offsetX: { type: Number, required: true },
    offsetY: { type: Number, required: true },
    blur: { type: Number, required: true },
    color: { type: String, required: true },
  },
  { _id: false },
)

const textLayerStyleSchema = new Schema<SlideshowTextLayerStyle>(
  {
    fontFamily: { type: String, required: true },
    fontSize: { type: Number, required: true },
    fontWeight: { type: String, enum: ['normal', 'bold'], required: true },
    color: { type: String, required: true },
    backgroundColor: { type: String, default: null },
    textAlign: { type: String, enum: ['left', 'center', 'right'], required: true },
    letterSpacing: { type: Number },
    lineHeight: { type: Number },
    padding: { type: Number },
    borderRadius: { type: Number },
    textStrokeColor: { type: String, default: null },
    textStrokeWidth: { type: Number },
    textShadow: { type: [textShadowSchema], default: null },
  },
  { _id: false },
)

const textLayerSchema = new Schema<SlideshowTextLayer>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['text'], required: true },
    content: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    rotation: { type: Number, required: true },
    zIndex: { type: Number, required: true },
    style: { type: textLayerStyleSchema, required: true },
  },
  { _id: false },
)

const backgroundImageAdjustmentSchema = new Schema<SlideshowBackgroundImageAdjustment>(
  {
    type: { type: String, enum: ['cover', 'frame', 'zoom', 'crop'], required: true },
    scale: { type: Number, default: 1 },
    offsetX: { type: Number, default: 0 },
    offsetY: { type: Number, default: 0 },
    positionX: { type: Number },
    positionY: { type: Number },
    crop: {
      x: { type: Number },
      y: { type: Number },
    },
    zoom: { type: Number },
    area: {
      x: { type: Number },
      y: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
  },
  { _id: false },
)

const slideSchema = new Schema<SlideshowSlide>(
  {
    id: { type: String, required: true },
    backgroundColor: { type: String, required: true },
    backgroundImageUrl: { type: String, default: '' },
    backgroundImageAdjustment: { type: backgroundImageAdjustmentSchema, required: true },
    layers: { type: [textLayerSchema], default: [] },
    order: { type: Number, required: true },
  },
  { _id: false },
)

const slideshowSchema = new Schema<ISlideshow>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: enumValues(SlideshowStatus), default: SlideshowStatus.DRAFT },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    canvas: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    aspectRatioId: { type: String, required: true },
    slides: { type: [slideSchema], default: [] },
  },
  { timestamps: true },
)

slideshowSchema.index({ workspace: 1, status: 1, updatedAt: -1 })

export const SlideshowModel = model<ISlideshow>('Slideshow', slideshowSchema)
