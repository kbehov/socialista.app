import { ModelModel } from '../models/model.js'
import { IModel } from '../types/models.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'

export const createModel = async (model: Partial<IModel>) => {
  return await ModelModel.create(model)
}

export const getModelById = async (id: string) => {
  return await ModelModel.findById(id)
}

export const getModelByValue = async (value: string) => {
  return await ModelModel.findOne({ value }).lean()
}

export const getModels = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [models, total] = await Promise.all([
    ModelModel.find(match).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    ModelModel.countDocuments(match),
  ])
  return {
    models,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const updateModel = async (id: string, model: Partial<IModel>) => {
  return await ModelModel.findByIdAndUpdate(id, model, { new: true })
}

export const deleteModel = async (id: string) => {
  return await ModelModel.findByIdAndDelete(id)
}

export const incrementModelUsage = async (id: string, amount = 1) => {
  return await ModelModel.findByIdAndUpdate(id, { $inc: { usageCount: amount } }, { new: true }).lean()
}
