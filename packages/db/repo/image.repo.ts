import { ImageCollectionModel, ImageModel } from '../models/image.model.js'
import type { IImage, IImageCollection } from '../types/image.types.js'
import { buildFilters } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'

export const createImage = async (image: Partial<IImage>) => {
  return await ImageModel.create(image)
}

export const createWorkspaceImageFile = async (input: {
  workspaceId: string
  userId: string
  url: string
  key: string
  width: number
  height: number
  size: number
}) => {
  return createImage({
    url: input.url,
    key: input.key,
    width: input.width,
    height: input.height,
    size: input.size,
    workspace: toObjectId(input.workspaceId),
    uploadedBy: toObjectId(input.userId),
  })
}

export const getImage = async (id: string) => {
  return await ImageModel.findById(id)
}

export const updateImage = async (id: string, image: IImage) => {
  return await ImageModel.findByIdAndUpdate(id, image, { new: true })
}

export const deleteImage = async (id: string) => {
  return await ImageModel.findByIdAndDelete(id).lean()
}

export const getImagesByCollection = async (collectionId: string) => {
  return await ImageModel.find({ collectionId }).lean()
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

export const createImageCollection = async (collection: Partial<IImageCollection>) => {
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

export const incrementCollectionImagesCount = async (collectionId: string, count = 1) => {
  return await ImageCollectionModel.findByIdAndUpdate(
    collectionId,
    { $inc: { imagesCount: count } },
    { new: true },
  ).lean()
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
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      sort,
      hasNextPage: pagination.page < Math.ceil(total / pagination.limit),
      hasPreviousPage: pagination.page > 1,
    },
  }
}
