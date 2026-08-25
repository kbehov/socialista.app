import type { CanvasDimensions, Slide } from './carousel.types.js'

export type SlideshowStatus = 'draft' | 'published'

export type SlideshowResponse = {
  id: string
  name: string
  status: SlideshowStatus
  workspaceId: string
  projectId?: string
  createdBy: string
  canvas: CanvasDimensions
  aspectRatioId: string
  slides: Slide[]
  createdAt: Date
  updatedAt: Date
}

export type SlideshowSummaryResponse = Pick<
  SlideshowResponse,
  'id' | 'name' | 'status' | 'workspaceId' | 'projectId' | 'canvas' | 'aspectRatioId' | 'createdAt' | 'updatedAt'
> & {
  slideCount: number
  previewSlide?: Slide
}

export type CreateSlideshowPayload = {
  workspaceId: string
  projectId?: string
  name?: string
  canvas?: CanvasDimensions
  aspectRatioId?: string
  slides?: Slide[]
}

export type UpdateSlideshowPayload = {
  name?: string
  status?: SlideshowStatus
  canvas?: CanvasDimensions
  aspectRatioId?: string
  slides?: Slide[]
}

export type DuplicateSlideshowPayload = {
  name?: string
}

export type GetSlideshowsResponse = {
  slideshows: SlideshowSummaryResponse[]
}
