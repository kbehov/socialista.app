import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import {
  VideoStatus,
  type DbClip,
  type DbSerializedMediaAsset,
  type DbTextOverlay,
  type DbTextOverlayStyle,
  type DbTrack,
  type DbTransition,
  type DbVideoFilter,
  type IVideo,
} from '../types/video.types.js'

const transitionSchema = new Schema<DbTransition>(
  {
    type: {
      type: String,
      enum: enumValues({ CUT: 'cut', FADE: 'fade', DISSOLVE: 'dissolve', WIPE_LEFT: 'wipe-left', WIPE_RIGHT: 'wipe-right' } as const),
      required: true,
    },
    duration: { type: Number, required: true },
  },
  { _id: false },
)

const videoFilterSchema = new Schema<DbVideoFilter>(
  {
    type: {
      type: String,
      enum: ['brightness', 'contrast', 'saturation', 'blur', 'grayscale'],
      required: true,
    },
    value: { type: Number, required: true },
  },
  { _id: false },
)

// Clips use a permissive schema (strict:false) because video/audio/image variants
// have different optional fields. The `type` field discriminates at runtime.
const clipSchema = new Schema<DbClip>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['video', 'audio', 'image'], required: true },
    assetId: { type: String, required: true },
    trackId: { type: String, required: true },
    startTime: { type: Number, required: true },
    duration: { type: Number, required: true },
    trimIn: { type: Number, required: true },
    trimOut: { type: Number, required: true },
    volume: { type: Number, required: true },
    speed: { type: Number, default: 1 },
    filters: { type: [videoFilterSchema], default: [] },
    transition: { type: transitionSchema, default: null },
    fadeIn: { type: Number, default: 0 },
    fadeOut: { type: Number, default: 0 },
  },
  { _id: false, strict: false },
)

const trackSchema = new Schema<DbTrack>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['video', 'audio'], required: true },
    name: { type: String, required: true },
    muted: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
    clips: { type: [String], default: [] },
  },
  { _id: false },
)

const textOverlayStyleSchema = new Schema<DbTextOverlayStyle>(
  {
    fontFamily: { type: String, required: true },
    fontSize: { type: Number, required: true },
    fontWeight: { type: String, enum: ['normal', 'bold'], required: true },
    color: { type: String, required: true },
    backgroundColor: { type: String, default: null },
    textAlign: { type: String, enum: ['left', 'center', 'right'], required: true },
    padding: { type: Number },
    borderRadius: { type: Number },
    letterSpacing: { type: Number },
    lineHeight: { type: Number },
    animation: { type: String, enum: ['fade', 'slide-up', 'slide-down', 'none'] },
  },
  { _id: false },
)

const textOverlaySchema = new Schema<DbTextOverlay>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['text'], required: true },
    content: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    rotation: { type: Number, required: true },
    zIndex: { type: Number, required: true },
    style: { type: textOverlayStyleSchema, required: true },
  },
  { _id: false },
)

const assetSchema = new Schema<DbSerializedMediaAsset>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['video', 'audio', 'image'], required: true },
    hash: { type: String, required: true },
    duration: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false },
)

const videoSchema = new Schema<IVideo>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: enumValues(VideoStatus), default: VideoStatus.DRAFT },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resolution: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    fps: { type: Number, required: true, default: 30 },
    duration: { type: Number, required: true, default: 0 },
    tracks: { type: [trackSchema], default: [] },
    clips: { type: [clipSchema], default: [] },
    textOverlays: { type: [textOverlaySchema], default: [] },
    assets: { type: [assetSchema], default: [] },
  },
  { timestamps: true },
)

videoSchema.index({ workspace: 1, status: 1, updatedAt: -1 })

export const VideoModel = model<IVideo>('Video', videoSchema)
