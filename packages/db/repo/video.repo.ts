import { VideoModel } from '../models/video.model.js'
import type { IVideo } from '../types/video.types.js'
import { buildFilters } from '../utils/build-filters.js'

export const createVideo = async (video: Partial<IVideo>) => {
  return await VideoModel.create(video)
}

export const getVideoById = async (id: string) => {
  return await VideoModel.findById(id).lean()
}

export const updateVideo = async (id: string, updates: Partial<IVideo>) => {
  return await VideoModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean()
}

export const deleteVideo = async (id: string) => {
  return await VideoModel.findByIdAndDelete(id).lean()
}

export const getVideos = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [videos, total] = await Promise.all([
    VideoModel.find(match).skip(pagination.skip).limit(pagination.limit).sort(sort).lean(),
    VideoModel.countDocuments(match),
  ])
  return {
    videos,
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
