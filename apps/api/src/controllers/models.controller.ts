import { getQueryString, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  createModel as createModelFromDb,
  deleteModel as deleteModelFromDb,
  getModelById,
  getModels as getModelsFromDb,
  updateModel as updateModelFromDb,
  type IModel,
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

function attachCompanyId(input: Record<string, unknown>) {
  const company = input.company
  if (company === undefined || company === null || company === '') {
    throw new HttpError(400, 'Company is required')
  }
  input.company = parseParamId(String(company), 'company ID')
  return input
}

export const createModel = async (c: Context) => {
  const input = attachCompanyId((await c.req.json()) as Record<string, unknown>)
  delete input.chef
  const data = await createModelFromDb(input as Partial<IModel>)
  return successResponse(c, 201, data)
}

export const updateModel = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'model ID')
  const input = (await c.req.json()) as Record<string, unknown>
  delete input.chef
  const { company, ...rest } = input
  const update: Record<string, unknown> = { ...rest, $unset: { chef: 1 } }
  if (company === null || company === '') {
    throw new HttpError(400, 'Company is required')
  }
  if (company !== undefined) {
    update.company = parseParamId(String(company), 'company ID')
  }
  await updateModelFromDb(id, update)
  return successResponse(c, 200, { message: 'Model updated successfully' })
}

export const deleteModel = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'model ID')
  await deleteModelFromDb(id)
  return successResponse(c, 200, { message: 'Model deleted successfully' })
}
