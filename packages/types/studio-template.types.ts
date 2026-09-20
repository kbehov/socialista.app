import type { CanvasDimensions, Slide } from './carousel.types.js'
import type { AspectRatio } from './image-generation.types.js'
import type {
  UgcClipType,
  UgcProjectModels,
  UgcSceneCount,
} from './ugc-project.types.js'
import type { VideoAspectRatio, VideoResolution } from './video-generation.types.js'

export const StudioTemplateKind = {
  IMAGE: 'image',
  VIDEO: 'video',
  UGC: 'ugc',
  SLIDESHOW: 'slideshow',
} as const

export type StudioTemplateKind = (typeof StudioTemplateKind)[keyof typeof StudioTemplateKind]

export const STUDIO_TEMPLATE_KIND_VALUES = Object.values(StudioTemplateKind)

const STUDIO_TEMPLATE_KIND_SET = new Set<string>(STUDIO_TEMPLATE_KIND_VALUES)

export function isStudioTemplateKind(value: unknown): value is StudioTemplateKind {
  return typeof value === 'string' && STUDIO_TEMPLATE_KIND_SET.has(value)
}

export const STUDIO_TEMPLATE_PAGE_SIZE = 24

export const STUDIO_TEMPLATE_MANAGED_KIND_VALUES = [
  StudioTemplateKind.IMAGE,
  StudioTemplateKind.VIDEO,
] as const

export type StudioTemplateManagedKind = (typeof STUDIO_TEMPLATE_MANAGED_KIND_VALUES)[number]

export function isStudioTemplateManagedKind(value: unknown): value is StudioTemplateManagedKind {
  return value === StudioTemplateKind.IMAGE || value === StudioTemplateKind.VIDEO
}

export type StudioTemplateImagePayload = {
  prompt?: string
  model?: string
  aspectRatio?: AspectRatio
  referenceImageUrls?: string[]
}

export type StudioTemplateVideoPayload = {
  prompt?: string
  model?: string
  aspectRatio?: VideoAspectRatio
  durationSec?: number
  resolution?: VideoResolution
  generateAudio?: boolean
  referenceImageUrl?: string
}

export type StudioTemplateSlideshowPayload = {
  canvas: CanvasDimensions
  aspectRatioId: string
  slides: Slide[]
}

export type StudioTemplateUgcClipPayload = {
  type: UgcClipType
  name?: string
  durationSec?: number
  sceneCount?: UgcSceneCount
  script?: string
  scenePrompt?: string
  directions?: string
  imagePrompt?: string
}

export type StudioTemplateUgcPayload = {
  aspectRatio?: string
  models?: Partial<UgcProjectModels>
  script?: string
  directions?: string
  clips: StudioTemplateUgcClipPayload[]
}

export type StudioTemplatePayload =
  | StudioTemplateImagePayload
  | StudioTemplateVideoPayload
  | StudioTemplateSlideshowPayload
  | StudioTemplateUgcPayload

type StudioTemplateDtoBase = {
  _id: string
  categories: string[]
  previewImageUrl: string
  name?: string
  description?: string
  createdAt: Date
}

export type StudioTemplateDto = StudioTemplateDtoBase &
  (
    | { kind: typeof StudioTemplateKind.IMAGE; payload: StudioTemplateImagePayload }
    | { kind: typeof StudioTemplateKind.VIDEO; payload: StudioTemplateVideoPayload }
    | { kind: typeof StudioTemplateKind.SLIDESHOW; payload: StudioTemplateSlideshowPayload }
    | { kind: typeof StudioTemplateKind.UGC; payload: StudioTemplateUgcPayload }
  )

export type StudioTemplateCategoryDto = {
  _id: string
  kind: StudioTemplateKind
  name: string
  slug: string
  templatesCount: number
  createdAt: Date
}

export type StudioTemplateListResponse = {
  templates: StudioTemplateDto[]
}

export type StudioTemplateCategoriesListResponse = {
  categories: StudioTemplateCategoryDto[]
}

export type CreateSlideshowFromTemplatePayload = {
  workspaceId: string
  projectId?: string
  templateId: string
  name?: string
}

export type CreateUgcProjectFromTemplatePayload = {
  workspaceId: string
  projectId?: string
  templateId: string
  name?: string
}

export type CreateStudioTemplateBody = {
  kind: StudioTemplateManagedKind
  categories: string[]
  prompt?: string
  imageUrl: string
  name?: string
  description?: string
}

export type CreateStudioTemplateCategoryBody = {
  name: string
}

export type UploadStudioTemplatePreviewResponse = {
  url: string
}
