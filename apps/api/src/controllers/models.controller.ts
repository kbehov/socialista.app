import { getQueryString, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  createModel as createModelFromDb,
  deleteModel as deleteModelFromDb,
  getModelById,
  getModels as getModelsFromDb,
  updateModel as updateModelFromDb,
} from '@socialista/db'
import type { Context } from 'hono'

export const getModels = async (c: Context) => {
  const { models, meta } = await getModelsFromDb(getQueryString(c.req.url))
  return successResponse(c, 200, { models }, meta)
}

export const getModel = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'model ID')
  const data = await getModelById(id)
  if (!data) {
    throw new HttpError(404, 'Model not found')
  }
  return successResponse(c, 200, data)
}

export const createModel = async (c: Context) => {
  const input = await c.req.json()
  const data = await createModelFromDb(input)
  return successResponse(c, 201, data)
}

export const updateModel = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'model ID')
  const input = await c.req.json()
  await updateModelFromDb(id, input)
  return successResponse(c, 200, { message: 'Model updated successfully' })
}

export const deleteModel = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'model ID')
  await deleteModelFromDb(id)
  return successResponse(c, 200, { message: 'Model deleted successfully' })
}
