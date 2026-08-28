import { ModelModel } from '../models/model.js'
import { IModel } from '../types/models.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'

const COMPANY_POPULATE = { path: 'company', select: 'name logo' } as const

export const createModel = async (model: Partial<IModel>) => {
  const created = await ModelModel.create(model)
  return created.populate(COMPANY_POPULATE)
}

export const getModelById = async (id: string) => {
  return await ModelModel.findById(id).populate(COMPANY_POPULATE)
}

export const getModelByValue = async (value: string) => {
  return await ModelModel.findOne({ value }).populate(COMPANY_POPULATE).lean()
}

/**
 * `contextSupports=text,image` → models that support ALL listed modalities.
 */
function applyContextSupportsFilter(match: Record<string, unknown>) {
  const value = match.contextSupports
  if (value == null) return

  if (typeof value === 'object' && value !== null && '$in' in value) {
    const modalities = (value as { $in: string[] }).$in
    match.contextSupports = modalities.length === 1 ? modalities[0] : { $all: modalities }
    return
  }

  match.contextSupports = value
}

export const getModels = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  applyContextSupportsFilter(match)
  const [models, total] = await Promise.all([
    ModelModel.find(match)
      .populate(COMPANY_POPULATE)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    ModelModel.countDocuments(match),
  ])
  return {
    models,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const updateModel = async (id: string, model: Record<string, unknown>) => {
  return await ModelModel.findByIdAndUpdate(id, model, { new: true }).populate(COMPANY_POPULATE)
}

export const deleteModel = async (id: string) => {
  return await ModelModel.findByIdAndDelete(id)
}

export const incrementModelUsage = async (id: string, amount = 1) => {
  return await ModelModel.findByIdAndUpdate(id, { $inc: { usageCount: amount } }, { new: true })
    .populate(COMPANY_POPULATE)
    .lean()
}

export const countModelsByCompany = async (companyId: string) => {
  return ModelModel.countDocuments({ company: toObjectId(companyId) })
}
