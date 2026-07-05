import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { assertWorkspaceMember, getWorkspaceOrThrow } from '@/utils/workspace.utils.js'
import {
  createSlideshow as createSlideshowInDb,
  deleteSlideshow as deleteSlideshowInDb,
  getSlideshowById,
  getSlideshows,
  toObjectId,
  updateSlideshow as updateSlideshowInDb,
  type ISlideshow,
  SlideshowStatus,
} from '@socialista/db'
import type { Context } from 'hono'

const DEFAULT_CANVAS = { width: 1080, height: 1350 } as const
const DEFAULT_ASPECT_RATIO_ID = 'instagram-portrait'

type SlideshowResponse = {
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

type SlideshowSummaryResponse = Pick<
  SlideshowResponse,
  'id' | 'name' | 'status' | 'workspaceId' | 'canvas' | 'aspectRatioId' | 'createdAt' | 'updatedAt'
> & {
  slideCount: number
  previewSlide?: ISlideshow['slides'][number]
}

type CreateSlideshowPayload = {
  workspaceId: string
  name?: string
  canvas?: ISlideshow['canvas']
  aspectRatioId?: string
  slides?: ISlideshow['slides']
}

type UpdateSlideshowPayload = {
  name?: string
  status?: SlideshowStatus
  canvas?: ISlideshow['canvas']
  aspectRatioId?: string
  slides?: ISlideshow['slides']
}

type DuplicateSlideshowPayload = {
  name?: string
}

function createEntityId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function cloneSlides(slides: ISlideshow['slides']): ISlideshow['slides'] {
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

function duplicateSlideshowName(sourceName: string, requestedName?: string): string {
  if (typeof requestedName === 'string' && requestedName.trim()) {
    return requestedName.trim()
  }
  return `${sourceName} (copy)`
}

function serializeSlideshow(slideshow: ISlideshow): SlideshowResponse {
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

function serializeSlideshowSummary(slideshow: ISlideshow): SlideshowSummaryResponse {
  const firstSlide = slideshow.slides[0]
  return {
    id: slideshow._id.toString(),
    name: slideshow.name,
    status: slideshow.status,
    workspaceId: slideshow.workspace.toString(),
    canvas: slideshow.canvas,
    aspectRatioId: slideshow.aspectRatioId,
    slideCount: slideshow.slides.length,
    previewSlide: firstSlide,
    createdAt: slideshow.createdAt,
    updatedAt: slideshow.updatedAt,
  }
}

async function getSlideshowForMember(id: string, userId: string) {
  const slideshow = await getSlideshowById(id)
  if (!slideshow) {
    throw new HttpError(404, 'Slideshow not found')
  }
  const workspace = await getWorkspaceOrThrow(slideshow.workspace.toString())
  assertWorkspaceMember(workspace, userId)
  return slideshow
}

export const createSlideshow = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = (await c.req.json()) as CreateSlideshowPayload
  const workspaceId = parseParamId(input.workspaceId, 'workspace ID')
  const workspace = await getWorkspaceOrThrow(workspaceId)
  assertWorkspaceMember(workspace, userId)

  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : 'Untitled slideshow'

  const slideshow = await createSlideshowInDb({
    name,
    status: SlideshowStatus.DRAFT,
    workspace: toObjectId(workspaceId),
    createdBy: toObjectId(userId),
    canvas: input.canvas ?? DEFAULT_CANVAS,
    aspectRatioId: input.aspectRatioId ?? DEFAULT_ASPECT_RATIO_ID,
    slides: input.slides ?? [],
  })

  return successResponse(c, 201, { slideshow: serializeSlideshow(slideshow.toObject()) })
}

export const getWorkspaceSlideshows = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  const workspace = await getWorkspaceOrThrow(workspaceId)
  assertWorkspaceMember(workspace, userId)

  const existingQuery = getQueryString(c.req.url)
  const params = new URLSearchParams(existingQuery)
  params.set('workspace', workspaceId)

  const data = await getSlideshows(params.toString())
  return successResponse(c, 200, {
    slideshows: data.slideshows.map(slideshow => serializeSlideshowSummary(slideshow as ISlideshow)),
    meta: data.meta,
  })
}

export const getSlideshow = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'slideshow ID')
  const slideshow = await getSlideshowForMember(id, userId)
  return successResponse(c, 200, { slideshow: serializeSlideshow(slideshow as ISlideshow) })
}

export const updateSlideshow = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'slideshow ID')
  const input = (await c.req.json()) as UpdateSlideshowPayload
  await getSlideshowForMember(id, userId)

  const updates: Partial<ISlideshow> = {}
  if (typeof input.name === 'string' && input.name.trim()) {
    updates.name = input.name.trim()
  }
  if (input.status === SlideshowStatus.DRAFT || input.status === SlideshowStatus.PUBLISHED) {
    updates.status = input.status
  }
  if (input.canvas) {
    updates.canvas = input.canvas
  }
  if (typeof input.aspectRatioId === 'string' && input.aspectRatioId) {
    updates.aspectRatioId = input.aspectRatioId
  }
  if (Array.isArray(input.slides)) {
    updates.slides = input.slides
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }

  const slideshow = await updateSlideshowInDb(id, updates)
  if (!slideshow) {
    throw new HttpError(404, 'Slideshow not found')
  }

  return successResponse(c, 200, { slideshow: serializeSlideshow(slideshow as ISlideshow) })
}

export const deleteSlideshow = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'slideshow ID')
  await getSlideshowForMember(id, userId)

  const deleted = await deleteSlideshowInDb(id)
  if (!deleted) {
    throw new HttpError(404, 'Slideshow not found')
  }

  return successResponse(c, 200, { id })
}

export const duplicateSlideshow = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'slideshow ID')
  const source = await getSlideshowForMember(id, userId)

  let input: DuplicateSlideshowPayload = {}
  try {
    input = (await c.req.json()) as DuplicateSlideshowPayload
  } catch {
    input = {}
  }

  const slideshow = await createSlideshowInDb({
    name: duplicateSlideshowName(source.name, input.name),
    status: SlideshowStatus.DRAFT,
    workspace: source.workspace,
    createdBy: toObjectId(userId),
    canvas: source.canvas,
    aspectRatioId: source.aspectRatioId,
    slides: cloneSlides(source.slides),
  })

  return successResponse(c, 201, { slideshow: serializeSlideshow(slideshow.toObject()) })
}
