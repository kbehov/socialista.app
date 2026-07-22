import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  cloneSlides,
  DEFAULT_ASPECT_RATIO_ID,
  DEFAULT_SLIDESHOW_CANVAS,
  duplicateSlideshowName,
  getSlideshowForMember,
  serializeSlideshow,
  serializeSlideshowSummary,
} from '@/utils/slideshow.utils.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  createSlideshow as createSlideshowInDb,
  deleteSlideshow as deleteSlideshowInDb,
  getSlideshows,
  toObjectId,
  updateSlideshow as updateSlideshowInDb,
  type ISlideshow,
  SlideshowStatus,
} from '@socialista/db'
import type { Context } from 'hono'

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

export const createSlideshow = async (c: Context<AppContext>): Promise<Response> => {
  const userId = c.get('userId')
  const input = (await c.req.json()) as CreateSlideshowPayload
  const workspaceId = parseParamId(input.workspaceId, 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : 'Untitled slideshow'

  const slideshow = await createSlideshowInDb({
    name,
    status: SlideshowStatus.DRAFT,
    workspace: toObjectId(workspaceId),
    createdBy: toObjectId(userId),
    canvas: input.canvas ?? DEFAULT_SLIDESHOW_CANVAS,
    aspectRatioId: input.aspectRatioId ?? DEFAULT_ASPECT_RATIO_ID,
    slides: input.slides ?? [],
  })

  return successResponse(c, 201, { slideshow: serializeSlideshow(slideshow.toObject()) })
}

export const getWorkspaceSlideshows = async (c: Context<AppContext>): Promise<Response> => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const params = new URLSearchParams(getQueryString(c.req.url))
  params.set('workspace', workspaceId)

  const data = await getSlideshows(params.toString())
  return successResponse(c, 200, {
    slideshows: data.slideshows.map(slideshow => serializeSlideshowSummary(slideshow as ISlideshow)),
    meta: data.meta,
  })
}

export const getSlideshow = async (c: Context<AppContext>): Promise<Response> => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'slideshow ID')
  const slideshow = await getSlideshowForMember(id, userId)
  return successResponse(c, 200, { slideshow: serializeSlideshow(slideshow as ISlideshow) })
}

export const updateSlideshow = async (c: Context<AppContext>): Promise<Response> => {
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

export const deleteSlideshow = async (c: Context<AppContext>): Promise<Response> => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'slideshow ID')
  await getSlideshowForMember(id, userId)

  const deleted = await deleteSlideshowInDb(id)
  if (!deleted) {
    throw new HttpError(404, 'Slideshow not found')
  }

  return successResponse(c, 200, { id })
}

export const duplicateSlideshow = async (c: Context<AppContext>): Promise<Response> => {
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
