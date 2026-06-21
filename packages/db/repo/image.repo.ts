import { ImageCollectionModel, ImageModel } from '../models/image.model.js'
import type { IImage, IImageCollection } from '../types/image.types.js'
import { buildFilters } from '../utils/build-filters.js'

export const createImage = async (image: IImage) => {
  return await ImageModel.create(image)
}

export const getImage = async (id: string) => {
  return await ImageModel.findById(id)
}

export const updateImage = async (id: string, image: IImage) => {
  return await ImageModel.findByIdAndUpdate(id, image, { new: true })
}

export const deleteImage = async (id: string) => {
  return await ImageModel.findByIdAndDelete(id)
}

export const getImages = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const images = await ImageModel.find(match).skip(pagination.skip).limit(pagination.limit).sort(sort).lean()
  const total = await ImageModel.countDocuments(match)
  return {
    images,
    meta: { total, page: pagination.page, limit: pagination.limit },
  }
}

export const createImageCollection = async (collection: IImageCollection) => {
  return await ImageCollectionModel.create(collection)
}

export const getImageCollection = async (id: string) => {
  return await ImageCollectionModel.findById(id)
}

export const updateImageCollection = async (id: string, collection: IImageCollection) => {
  return await ImageCollectionModel.findByIdAndUpdate(id, collection, { new: true })
}

export const deleteImageCollection = async (id: string) => {
  return await ImageCollectionModel.findByIdAndDelete(id)
}

export const getImageCollections = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const collections = await ImageCollectionModel.find(match)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort(sort)
    .lean()
  const total = await ImageCollectionModel.countDocuments(match)
  return {
    collections,
    meta: { total, page: pagination.page, limit: pagination.limit },
  }
}
