import { HydratedDocument, Types } from 'mongoose'

export enum VideoStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export type DbMediaType = 'video' | 'audio' | 'image'

export type DbTransitionType = 'cut' | 'fade' | 'dissolve' | 'wipe-left' | 'wipe-right'

export type DbVideoFilterType = 'brightness' | 'contrast' | 'saturation' | 'blur' | 'grayscale'

export type DbTextAnimation = 'fade' | 'slide-up' | 'slide-down' | 'none'

export type ClipId = string

export interface DbTransition {
  type: DbTransitionType
  duration: number
}

export interface DbVideoFilter {
  type: DbVideoFilterType
  value: number
}

export interface DbVideoClip {
  id: ClipId
  type: 'video' | 'image'
  assetId: string
  trackId: string
  startTime: number
  duration: number
  trimIn: number
  trimOut: number
  volume: number
  speed: number
  filters: DbVideoFilter[]
  transition?: DbTransition
}

export interface DbAudioClip {
  id: ClipId
  type: 'audio'
  assetId: string
  trackId: string
  startTime: number
  duration: number
  trimIn: number
  trimOut: number
  volume: number
  fadeIn?: number
  fadeOut?: number
}

export type DbClip = DbVideoClip | DbAudioClip

export interface DbTrack {
  id: string
  type: 'video' | 'audio'
  name: string
  muted: boolean
  locked: boolean
  clips: ClipId[]
}

export interface DbTextOverlayStyle {
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  color: string
  backgroundColor: string | null
  textAlign: 'left' | 'center' | 'right'
  padding?: number
  borderRadius?: number
  letterSpacing?: number
  lineHeight?: number
  animation?: DbTextAnimation
}

export interface DbTextOverlay {
  id: string
  type: 'text'
  content: string
  startTime: number
  endTime: number
  x: number
  y: number
  width: number
  rotation: number
  zIndex: number
  style: DbTextOverlayStyle
}

export interface DbSerializedMediaAsset {
  id: string
  name: string
  type: DbMediaType
  hash: string
  duration: number
  width?: number
  height?: number
  url?: string
  fileId?: string
}

export interface IVideo {
  _id: Types.ObjectId
  name: string
  status: VideoStatus
  workspace: Types.ObjectId
  createdBy: Types.ObjectId
  resolution: { width: number; height: number }
  fps: number
  duration: number
  tracks: DbTrack[]
  /** Clips stored as an array; the API serializer converts to/from Record<ClipId, Clip>. */
  clips: DbClip[]
  textOverlays: DbTextOverlay[]
  assets: DbSerializedMediaAsset[]
  createdAt: Date
  updatedAt: Date
}

export type VideoDocument = HydratedDocument<IVideo>
