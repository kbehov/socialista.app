import type { CanvasDimensions, LayerId, TextAlign, FontWeight, TextShadow } from './carousel.types.js'
import type { MetaResponse } from './common.types.js'

export type TrackId = string
export type ClipId = string

export type MediaType = 'video' | 'audio' | 'image'

export type ClipType = 'video' | 'audio' | 'image'

export type TransitionType = 'cut' | 'fade' | 'dissolve' | 'wipe-left' | 'wipe-right'

export type VideoFilterType = 'brightness' | 'contrast' | 'saturation' | 'blur' | 'grayscale'

export type TextAnimation = 'fade' | 'slide-up' | 'slide-down' | 'none'

export type ExportQuality = 'low' | 'medium' | 'high'

export type VideoStatus = 'draft' | 'published'

/** Persisted media reference. The File/objectUrl/waveform live only client-side. */
export interface SerializedMediaAsset {
  id: string
  name: string
  type: MediaType
  /** SHA-1 of file bytes; used to re-link media on reload. */
  hash: string
  duration: number
  width?: number
  height?: number
  /** CDN URL after upload to workspace files. */
  url?: string
  /** Workspace file id (`Image` model). */
  fileId?: string
}

export interface Transition {
  type: TransitionType
  /** Seconds. */
  duration: number
}

export interface VideoFilter {
  type: VideoFilterType
  value: number
}

/** Spatial transform on the canvas preview (percent of frame, 0–100). */
export interface ClipTransform {
  x: number
  y: number
  width: number
  rotation: number
}

export interface VideoClip {
  id: ClipId
  type: 'video' | 'image'
  assetId: string
  trackId: TrackId
  /** Position on the timeline (seconds). */
  startTime: number
  /** How long the clip plays on the timeline (seconds). */
  duration: number
  /** Trim from asset start (seconds). */
  trimIn: number
  /** Trim from asset end (seconds). */
  trimOut: number
  /** 0–1. */
  volume: number
  /** 0.25–4. */
  speed: number
  filters: VideoFilter[]
  /** Transition into this clip. */
  transition?: Transition
  /** Canvas position/size. When omitted, media is cover-fit centered. */
  transform?: ClipTransform
}

export interface AudioClip {
  id: ClipId
  type: 'audio'
  assetId: string
  trackId: TrackId
  startTime: number
  duration: number
  trimIn: number
  trimOut: number
  /** 0–1. */
  volume: number
  /** Fade duration in seconds. */
  fadeIn?: number
  /** Fade duration in seconds. */
  fadeOut?: number
}

export type Clip = VideoClip | AudioClip

export interface Track {
  id: TrackId
  type: 'video' | 'audio'
  name: string
  muted: boolean
  locked: boolean
  /** Clip ids ordered by startTime. */
  clips: ClipId[]
}

export interface TextOverlayStyle {
  fontFamily: string
  /** Reference font size at canvas width 1080. */
  fontSize: number
  fontWeight: FontWeight
  color: string
  backgroundColor: string | null
  textAlign: TextAlign
  padding?: number
  borderRadius?: number
  letterSpacing?: number
  lineHeight?: number
  /** Outline stroke color, or null for none. */
  textStrokeColor?: string | null
  /** Outline width in px at reference canvas width. */
  textStrokeWidth?: number
  /** Drop shadows / glows at reference canvas scale. */
  textShadow?: TextShadow[] | null
  animation?: TextAnimation
}

export interface TextOverlay {
  id: LayerId
  type: 'text'
  content: string
  /** When the overlay appears (seconds). */
  startTime: number
  /** When the overlay disappears (seconds). */
  endTime: number
  /** Position and size in percent (0–100) of the canvas. */
  x: number
  y: number
  width: number
  rotation: number
  zIndex: number
  style: TextOverlayStyle
}

export interface Project {
  id: string
  name: string
  /** Total timeline length (seconds). */
  duration: number
  resolution: CanvasDimensions
  /** 24 | 30 | 60. */
  fps: number
  tracks: Track[]
  clips: Record<ClipId, Clip>
  textOverlays: TextOverlay[]
  /** Persisted asset metadata (no File/blob). */
  assets: SerializedMediaAsset[]
}

export type VideoResponse = {
  id: string
  name: string
  status: VideoStatus
  workspaceId: string
  createdBy: string
  resolution: CanvasDimensions
  fps: number
  duration: number
  tracks: Track[]
  clips: Record<ClipId, Clip>
  textOverlays: TextOverlay[]
  assets: SerializedMediaAsset[]
  createdAt: Date
  updatedAt: Date
}

export type VideoSummaryResponse = Pick<
  VideoResponse,
  | 'id'
  | 'name'
  | 'status'
  | 'workspaceId'
  | 'resolution'
  | 'fps'
  | 'duration'
  | 'createdAt'
  | 'updatedAt'
> & {
  trackCount: number
  clipCount: number
  /** First video/image asset URL for list preview. */
  previewUrl?: string
  previewType?: 'video' | 'image'
}

export type CreateVideoPayload = {
  workspaceId: string
  name?: string
  resolution?: CanvasDimensions
  fps?: number
  tracks?: Track[]
  clips?: Record<ClipId, Clip>
  textOverlays?: TextOverlay[]
  assets?: SerializedMediaAsset[]
  duration?: number
}

export type UpdateVideoPayload = {
  name?: string
  status?: VideoStatus
  resolution?: CanvasDimensions
  fps?: number
  duration?: number
  tracks?: Track[]
  clips?: Record<ClipId, Clip>
  textOverlays?: TextOverlay[]
  assets?: SerializedMediaAsset[]
}

export type DuplicateVideoPayload = {
  name?: string
}

export type GetVideosResponse = {
  videos: VideoSummaryResponse[]
  meta: MetaResponse
}

export type ExportSettings = {
  resolution: CanvasDimensions
  fps: number
  quality: ExportQuality
}
