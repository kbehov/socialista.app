import type { CanvasDimensions, Slide } from './carousel.types.js'
import type { MetaResponse } from './common.types.js'

export type SlideshowStatus = 'draft' | 'published'

export type SlideshowResponse = {
  id: string
  name: string
  status: SlideshowStatus
  workspaceId: string
  createdBy: string
  canvas: CanvasDimensions
  aspectRatioId: string
  slides: Slide[]
  createdAt: Date
  updatedAt: Date
}

export type SlideshowSummaryResponse = Pick<
  SlideshowResponse,
  'id' | 'name' | 'status' | 'workspaceId' | 'canvas' | 'aspectRatioId' | 'createdAt' | 'updatedAt'
> & {
  slideCount: number
  previewSlide?: Slide
}

export type CreateSlideshowPayload = {
  workspaceId: string
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

export type GetSlideshowsResponse = {
  slideshows: SlideshowSummaryResponse[]
  meta: MetaResponse
}
