import { HttpError } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  getSlideshowById,
  SlideshowStatus,
  type ISlideshow,
} from '@socialista/db'

export const DEFAULT_SLIDESHOW_CANVAS = { width: 1080, height: 1350 } as const
export const DEFAULT_ASPECT_RATIO_ID = 'instagram-portrait'

export type SlideshowResponse = {
  id: string
  name: string
  status: SlideshowStatus
  workspaceId: string
  createdBy: string
  canvas: ISlideshow['canvas']
  aspectRatioId: string
  slides: ISlideshow['slides']
  createdAt: Date
  updatedAt: Date
}

export type SlideshowSummaryResponse = Pick<
  SlideshowResponse,
  'id' | 'name' | 'status' | 'workspaceId' | 'canvas' | 'aspectRatioId' | 'createdAt' | 'updatedAt'
> & {
  slideCount: number
  previewSlide?: ISlideshow['slides'][number]
}

export function createEntityId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function cloneSlides(slides: ISlideshow['slides']): ISlideshow['slides'] {
  return slides.map((slide, index) => {
    const copy = structuredClone(slide)
    copy.id = createEntityId('slide')
    copy.order = index
    copy.layers = copy.layers.map(layer => ({
      ...layer,
      id: createEntityId('layer'),
    }))
    return copy
  })
}

export function duplicateSlideshowName(sourceName: string, requestedName?: string): string {
  if (typeof requestedName === 'string' && requestedName.trim()) {
    return requestedName.trim()
  }
  return `${sourceName} (copy)`
}

export function serializeSlideshow(slideshow: ISlideshow): SlideshowResponse {
  return {
    id: slideshow._id.toString(),
    name: slideshow.name,
    status: slideshow.status,
    workspaceId: slideshow.workspace.toString(),
    createdBy: slideshow.createdBy.toString(),
    canvas: slideshow.canvas,
    aspectRatioId: slideshow.aspectRatioId,
    slides: slideshow.slides,
    createdAt: slideshow.createdAt,
    updatedAt: slideshow.updatedAt,
  }
}

export function serializeSlideshowSummary(slideshow: ISlideshow): SlideshowSummaryResponse {
  return {
    id: slideshow._id.toString(),
    name: slideshow.name,
    status: slideshow.status,
    workspaceId: slideshow.workspace.toString(),
    canvas: slideshow.canvas,
    aspectRatioId: slideshow.aspectRatioId,
    slideCount: slideshow.slides.length,
    previewSlide: slideshow.slides[0],
    createdAt: slideshow.createdAt,
    updatedAt: slideshow.updatedAt,
  }
}

export async function getSlideshowForMember(id: string, userId: string) {
  const slideshow = await getSlideshowById(id)
  if (!slideshow) {
    throw new HttpError(404, 'Slideshow not found')
  }
  await getWorkspaceAsMember(slideshow.workspace.toString(), userId)
  return slideshow
}
