import type { Types } from 'mongoose'
import { InspirationCategoryModel, InspirationModel, InspirationNicheModel } from '../models/inspiration.model.js'
import type { IInspirationCategory, IInspirationNiche, IIspiration } from '../types/inspiration.types.js'
import { buildFilters } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'

function applyArrayIdFilter(match: Record<string, unknown>, field: 'categories' | 'niches') {
  const value = match[field]
  if (typeof value !== 'string' || !value) return

  const ids = value
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
    .map(id => {
      try {
        return toObjectId(id)
      } catch {
        return null
      }
    })
    .filter((id): id is Types.ObjectId => id !== null)

  if (ids.length === 0) {
    delete match[field]
    return
  }

  match[field] = ids.length === 1 ? ids[0] : { $in: ids }
}

export const getInspirationById = async (id: string) => {
  return await InspirationModel.findById(id).lean()
}

export const getInspiration = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  applyArrayIdFilter(match, 'categories')
  applyArrayIdFilter(match, 'niches')

  const [inspirations, total] = await Promise.all([
    InspirationModel.find(match)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort(sort)
      .populate('categories', 'name icon')
      .populate('niches', 'name icon')
      .lean(),
    InspirationModel.countDocuments(match),
  ])

  return {
    inspirations,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasNextPage: pagination.page < Math.ceil(total / pagination.limit),
      hasPreviousPage: pagination.page > 1,
      sort,
    },
  }
}

export const createInspiration = async (body: Partial<IIspiration>) => {
  return await InspirationModel.create(body)
}

export const updateInspiration = async (id: string, body: Partial<IIspiration>) => {
  return await InspirationModel.findByIdAndUpdate(id, { $set: body }, { new: true })
}

export const deleteInspiration = async (id: string) => {
  return await InspirationModel.findByIdAndDelete(id)
}

export const incrementInspirationViews = async (id: string) => {
  return await InspirationModel.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
}

export const incrementInspirationCategoryCounts = async (ids: string[], amount = 1) => {
  if (ids.length === 0) return
  await InspirationCategoryModel.updateMany({ _id: { $in: ids } }, { $inc: { count: amount } })
}

export const incrementInspirationNicheCounts = async (ids: string[], amount = 1) => {
  if (ids.length === 0) return
  await InspirationNicheModel.updateMany({ _id: { $in: ids } }, { $inc: { count: amount } })
}

export const getInspirationCategories = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [categories, total] = await Promise.all([
    InspirationCategoryModel.find(match).skip(pagination.skip).limit(pagination.limit).sort(sort).lean(),
    InspirationCategoryModel.countDocuments(match),
  ])
  return {
    categories,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
    },
  }
}

export const updateInspirationCategory = async (id: string, body: Partial<IInspirationCategory>) => {
  return await InspirationCategoryModel.findByIdAndUpdate(id, { $set: body }, { new: true })
}

export const deleteInspirationCategory = async (id: string) => {
  return await InspirationCategoryModel.findByIdAndDelete(id)
}

export const createInspirationCategory = async (body: Partial<IInspirationCategory>) => {
  return await InspirationCategoryModel.create(body)
}

export const getInspirationNiches = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [niches, total] = await Promise.all([
    InspirationNicheModel.find(match).skip(pagination.skip).limit(pagination.limit).sort(sort).lean(),
    InspirationNicheModel.countDocuments(match),
  ])
  return {
    niches,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
    },
  }
}

export const updateInspirationNiche = async (id: string, body: Partial<IInspirationNiche>) => {
  return await InspirationNicheModel.findByIdAndUpdate(id, { $set: body }, { new: true })
}

export const deleteInspirationNiche = async (id: string) => {
  return await InspirationNicheModel.findByIdAndDelete(id)
}

export const createInspirationNiche = async (body: Partial<IInspirationNiche>) => {
  return await InspirationNicheModel.create(body)
}
