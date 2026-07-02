import { SlideshowModel } from '../models/slideshow.model.js'
import type { ISlideshow } from '../types/slideshow.types.js'
import { buildFilters } from '../utils/build-filters.js'

export const createSlideshow = async (slideshow: Partial<ISlideshow>) => {
  return await SlideshowModel.create(slideshow)
}

export const getSlideshowById = async (id: string) => {
  return await SlideshowModel.findById(id).lean()
}

export const updateSlideshow = async (id: string, updates: Partial<ISlideshow>) => {
  return await SlideshowModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean()
}

export const deleteSlideshow = async (id: string) => {
  return await SlideshowModel.findByIdAndDelete(id).lean()
}

export const getSlideshows = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const slideshows = await SlideshowModel.find(match)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort(sort)
    .lean()
  const total = await SlideshowModel.countDocuments(match)
  return {
    slideshows,
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
