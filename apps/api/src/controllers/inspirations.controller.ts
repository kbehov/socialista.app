import { assertHasUpdates, getQueryString, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  createInspirationCategory as createInspirationCategoryFromDb,
  createInspiration as createInspirationFromDb,
  createInspirationNiche as createInspirationNicheFromDb,
  deleteInspirationCategory as deleteInspirationCategoryFromDb,
  deleteInspiration as deleteInspirationFromDb,
  deleteInspirationNiche as deleteInspirationNicheFromDb,
  getInspirationById as getInspirationByIdFromDb,
  getInspirationCategories as getInspirationCategoriesFromDb,
  getInspiration as getInspirationFromDb,
  getInspirationNiches as getInspirationNichesFromDb,
  incrementInspirationViews,
  updateInspirationCategory as updateInspirationCategoryFromDb,
  updateInspiration as updateInspirationFromDb,
  updateInspirationNiche as updateInspirationNicheFromDb,
} from '@socialista/db'
import type { Context } from 'hono'
export const getInspirations = async (c: Context) => {
  const query = getQueryString(c.req.url)
  const { inspirations, meta } = await getInspirationFromDb(query)
  return successResponse(c, 200, { inspirations, meta })
}

export const createInspiration = async (c: Context) => {
  const body = await c.req.json()
  const inspiration = await createInspirationFromDb(body)
  return successResponse(c, 201, { inspiration })
}

export const updateInspiration = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'inspiration ID')
  const body = await c.req.json()
  const inspiration = await getInspirationByIdFromDb(id)
  if (!inspiration) {
    throw new HttpError(404, 'Inspiration not found')
  }
  assertHasUpdates(body)
  await updateInspirationFromDb(inspiration._id.toString(), body)

  return successResponse(c, 200, { inspiration })
}
export const deleteInspiration = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'inspiration ID')
  const inspiration = await getInspirationByIdFromDb(id)
  if (!inspiration) {
    throw new HttpError(404, 'Inspiration not found')
  }
  await deleteInspirationFromDb(inspiration._id.toString())
  return successResponse(c, 200, { message: 'Inspiration deleted successfully' })
}
export const viewInspiration = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'inspiration ID')
  await incrementInspirationViews(id)
  return successResponse(c, 200, { message: 'Inspiration viewed successfully' })
}

export const getInspirationCategories = async (c: Context) => {
  const query = getQueryString(c.req.url)
  const { categories, meta } = await getInspirationCategoriesFromDb(query)
  return successResponse(c, 200, { categories, meta })
}
export const getInspirationNiches = async (c: Context) => {
  const query = getQueryString(c.req.url)
  const { niches, meta } = await getInspirationNichesFromDb(query)
  return successResponse(c, 200, { niches, meta })
}

export const createInspirationCategory = async (c: Context) => {
  const body = await c.req.json()
  const category = await createInspirationCategoryFromDb(body)
  return successResponse(c, 201, { category })
}
export const createInspirationNiche = async (c: Context) => {
  const body = await c.req.json()
  const niche = await createInspirationNicheFromDb(body)
  return successResponse(c, 201, { niche })
}

export const updateInspirationCategory = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'inspiration category ID')
  const body = await c.req.json()
  const category = await updateInspirationCategoryFromDb(id, body)
  return successResponse(c, 200, { category })
}

export const updateInspirationNiche = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'inspiration niche ID')
  const body = await c.req.json()
  const niche = await updateInspirationNicheFromDb(id, body)
  return successResponse(c, 200, { niche })
}
export const deleteInspirationCategory = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'inspiration category ID')
  await deleteInspirationCategoryFromDb(id)
  return successResponse(c, 200, { message: 'Inspiration category deleted successfully' })
}
export const deleteInspirationNiche = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'inspiration niche ID')
  await deleteInspirationNicheFromDb(id)
  return successResponse(c, 200, { message: 'Inspiration niche deleted successfully' })
}
