import { AspectRatio } from './image-generation.types.js'

export const SLIDESHOW_CONTENT_TYPES = [
  'story',
  'guide',
  'list',
  'routine',
  'comparison',
  'myth',
] as const

export type SlideshowContentType = (typeof SLIDESHOW_CONTENT_TYPES)[number]

export type GenerateSlideshowInput = {
  hook: string
  slideCount: number
}

export type GenerateSlideshowResult = {
  contentType: SlideshowContentType
  texts: string[]
}

export const VIDEO_SCRIPT_SEGMENT_ROLES = ['hook', 'body', 'cta'] as const

export type VideoScriptSegmentRole = (typeof VIDEO_SCRIPT_SEGMENT_ROLES)[number]

export const VIDEO_SCRIPT_TONES = ['casual', 'educational', 'hype', 'professional'] as const

export type VideoScriptTone = (typeof VIDEO_SCRIPT_TONES)[number]

export type VideoScriptSegment = {
  text: string
  startTime: number
  endTime: number
  role: VideoScriptSegmentRole
}

export type GenerateVideoScriptInput = {
  description: string
  duration: number
  tone?: VideoScriptTone
}

export type GenerateVideoScriptResult = {
  title: string
  segments: VideoScriptSegment[]
}

export type SanitizedMedia = {
  imageUrl: string
}

export type GenerateImagePayload = {
  prompt: string
  media?: SanitizedMedia[]
}

export type UploadGeneratedImageInput = {
  workspaceId: string
  userId: string
  bytes: Uint8Array
  mediaType: string
  filename?: string
}

export type UploadGeneratedImageResponse = {
  success: boolean
  data?: {
    url: string
    _id: string
  }
  message?: string
}
export type GenerateImageOptions = {
  model: string
  prompt: string
  aspectRatio: AspectRatio
  workspaceId: string
  userId: string
  imageUrl?: string
  imageUrls?: string[]
  onProgress?: (progress: number, label: string) => void
}

export type GeneratedImage = {
  url: string
  width: number
  height: number
  content_type: string
  file_name?: string
}

export type EditImageResult = { success: true; data: GeneratedImage } | { success: false; error: string }

export type GeneratedVideo = {
  url: string
  content_type?: string
  file_name?: string
}

export type EditVideoResolution = 'auto' | '480p' | '720p'

export type EditVideoResult = { success: true; data: GeneratedVideo } | { success: false; error: string }

export type AnimateImageResult = { success: true; data: GeneratedVideo } | { success: false; error: string }
