import { uploadBufferToR2 } from '@/lib/aws.js'
import { assertHasUpdates, getQueryString, parseParamId } from '@/utils/common.utils.js'
import { downloadImage, downloadVideo } from '@/utils/download-image.js'
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
  InspirationCategoryModel,
  InspirationContentType,
  InspirationNicheModel,
  mongoose,
  updateInspirationCategory as updateInspirationCategoryFromDb,
  updateInspiration as updateInspirationFromDb,
  updateInspirationNiche as updateInspirationNicheFromDb,
} from '@socialista/db'
import type { Context } from 'hono'
import sharp from 'sharp'

type CreateInspirationBody = {
  contentType: 'slideshow' | 'video'
  images?: string[]
  videoUrl?: string
  videoUrls?: string[]
  author?: {
    username?: string
    nickName?: string
    avatarUrl?: string
  }
  stats?: {
    likes?: number
    comments?: number
    shares?: number
    plays?: number
  }
  categories?: string[]
  niches?: string[]
}

const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

async function uploadImageFromUrl(url: string) {
  const buffer = await downloadImage(url)
  const image = sharp(buffer)
  const metadata = await image.metadata()
  const compressedBuffer = await image.webp({ quality: 80 }).toBuffer()
  const key = `inspirations/images/${crypto.randomUUID()}.webp`
  const uploadedUrl = await uploadBufferToR2(key, compressedBuffer, 'image/webp')

  return {
    url: uploadedUrl,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  }
}

export const getInspirations = async (c: Context) => {
  const query = getQueryString(c.req.url)
  const { inspirations, meta } = await getInspirationFromDb(query)
  return successResponse(c, 200, { inspirations, meta })
}

export const createInspiration = async (c: Context) => {
  const body = (await c.req.json()) as CreateInspirationBody

  if (!body.contentType) {
    throw new HttpError(400, 'contentType is required')
  }

  const imageUrls = body.images ?? []
  if (imageUrls.length === 0) {
    throw new HttpError(400, 'At least one image is required')
  }

  const uploadedImages = await Promise.all(imageUrls.map(uploadImageFromUrl))
  const firstImage = uploadedImages[0]!

  const author = { ...body.author }
  if (author.avatarUrl) {
    const avatar = await uploadImageFromUrl(author.avatarUrl)
    author.avatarUrl = avatar.url
  }

  let playUrl = firstImage.url
  let downloadUrl = firstImage.url

  if (body.contentType === 'video') {
    if (body.videoUrl) {
      playUrl = body.videoUrl
      downloadUrl = body.videoUrl
    } else if (body.videoUrls?.length) {
      const videoBuffer = await downloadVideo(body.videoUrls)
      const key = `inspirations/videos/${crypto.randomUUID()}.mp4`
      const uploadedVideoUrl = await uploadBufferToR2(key, videoBuffer, 'video/mp4')
      playUrl = uploadedVideoUrl
      downloadUrl = uploadedVideoUrl
    }
  }

  const inspiration = await createInspirationFromDb({
    contentType: body.contentType === 'video' ? InspirationContentType.VIDEO : InspirationContentType.SLIDESHOW,
    images: uploadedImages,
    author,
    stats: {
      likes: body.stats?.likes ?? 0,
      comments: body.stats?.comments ?? 0,
      shares: body.stats?.shares ?? 0,
      plays: body.stats?.plays ?? 0,
    },
    video: {
      playUrl,
      coverUrl: firstImage.url,
      downloadUrl,
      duration: 0,
      width: firstImage.width,
      height: firstImage.height,
    },
    categories: (body.categories ?? []).map(id => new mongoose.Types.ObjectId(id)),
    niches: (body.niches ?? []).map(id => new mongoose.Types.ObjectId(id)),
  })
  await Promise.all([
    InspirationCategoryModel.updateMany({ _id: { $in: body.categories } }, { $inc: { count: 1 } }),
    InspirationNicheModel.updateMany({ _id: { $in: body.niches } }, { $inc: { count: 1 } }),
  ])
  return successResponse(c, 201, { inspiration })
}

export const uploadInspirationVideo = async (c: Context) => {
  const body = await c.req.parseBody()
  const file = body.video

  if (!file || typeof file === 'string') {
    throw new HttpError(400, 'video file is required')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.length > MAX_VIDEO_SIZE_BYTES) {
    throw new HttpError(400, 'Video exceeds maximum size (50 MB)')
  }

  const key = `inspirations/videos/${crypto.randomUUID()}.mp4`
  const url = await uploadBufferToR2(key, buffer, file.type || 'video/mp4')

  return successResponse(c, 201, { url })
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
