import { ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '@/config/api.config.js'
import { R2_CDN_BASE_URL, R2_PUBLIC_BASE_URL, uploadBufferToR2 } from '@/lib/aws.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString, optionalTrimmedString, parseParamId, requireTrimmedString } from '@/utils/common.utils.js'
import { downloadImage, downloadVideo } from '@/utils/download-image.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  createStudioTemplate as createTemplateFromDb,
  deactivateStudioTemplate,
  deactivateStudioTemplateCategoriesByName,
  getStudioTemplateBySourceUrl,
  getStudioTemplateCategoryById,
  isDuplicateKeyError,
  listStudioTemplateCategories as listCategoriesFromDb,
  listStudioTemplates as listTemplatesFromDb,
  renameStudioTemplateCategory,
  syncStudioTemplateCategoryTemplatesCount,
  upsertStudioTemplateCategoryForManagedKinds,
  type IStudioTemplate,
  type IStudioTemplateCategory,
} from '@socialista/db'
import {
  isStudioTemplateKind,
  isStudioTemplateManagedKind,
  STUDIO_TEMPLATE_MANAGED_KIND_VALUES,
  StudioTemplateKind,
  type StudioTemplateCategoryDto,
  type StudioTemplateDto,
  type StudioTemplateImagePayload,
  type StudioTemplateManagedKind,
  type StudioTemplatePayload,
  type StudioTemplateSlideshowPayload,
  type StudioTemplateUgcPayload,
  type StudioTemplateVideoPayload,
} from '@socialista/types'
import type { Context } from 'hono'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'

const PREVIEW_IMAGE_MIME_TYPES = new Set(
  [...ALLOWED_MIME_TYPES].filter(type => type.startsWith('image/') && type !== 'image/svg+xml'),
)
const PREVIEW_VIDEO_MIME_TYPES = new Set([...ALLOWED_MIME_TYPES].filter(type => type.startsWith('video/')))
const VIDEO_URL_EXT = /\.(mp4|webm|mov|m4v|ogv|ogg)$/i

function serializeTemplate(template: IStudioTemplate): StudioTemplateDto {
  const base = {
    _id: template._id.toString(),
    categories: template.categories,
    previewImageUrl: template.previewImageUrl,
    ...(template.name ? { name: template.name } : {}),
    ...(template.description ? { description: template.description } : {}),
    createdAt: template.createdAt,
  }
  if (template.kind === StudioTemplateKind.VIDEO) {
    return {
      ...base,
      kind: StudioTemplateKind.VIDEO,
      payload: (template.payload ?? {}) as StudioTemplateVideoPayload,
    }
  }
  if (template.kind === StudioTemplateKind.SLIDESHOW) {
    return {
      ...base,
      kind: StudioTemplateKind.SLIDESHOW,
      payload: (template.payload ?? {}) as StudioTemplateSlideshowPayload,
    }
  }
  if (template.kind === StudioTemplateKind.UGC) {
    return {
      ...base,
      kind: StudioTemplateKind.UGC,
      payload: (template.payload ?? {}) as StudioTemplateUgcPayload,
    }
  }
  return {
    ...base,
    kind: StudioTemplateKind.IMAGE,
    payload: (template.payload ?? {}) as StudioTemplateImagePayload,
  }
}

function serializeCategory(category: IStudioTemplateCategory): StudioTemplateCategoryDto {
  return {
    _id: category._id.toString(),
    kind: category.kind,
    name: category.name,
    slug: category.slug,
    templatesCount: category.templatesCount,
    createdAt: category.createdAt,
  }
}

function requireManagedKind(value: unknown, label = 'kind'): StudioTemplateManagedKind {
  if (!isStudioTemplateManagedKind(value)) {
    throw new HttpError(400, `${label} must be image or video`)
  }
  return value
}

function requireHttpUrl(value: unknown, label: string): string {
  const url = requireTrimmedString(value, label)
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new HttpError(400, `${label} must be an http(s) URL`)
    }
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(400, `${label} must be a valid URL`)
  }
  return url
}

function parseCategories(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new HttpError(400, 'categories is required')
  }
  const categories = [
    ...new Set(value.map(item => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)),
  ]
  if (categories.length === 0) {
    throw new HttpError(400, 'At least one category is required')
  }
  return categories
}

function isStoredPreviewUrl(url: string): boolean {
  const bases = [R2_CDN_BASE_URL, R2_PUBLIC_BASE_URL]
    .filter((base): base is string => Boolean(base))
    .map(base => base.replace(/\/$/, ''))
  return bases.some(base => url.startsWith(`${base}/`))
}

function nameFromSourceUrl(url: string): string {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname)
    const base = pathname.split('/').pop() ?? 'template'
    return base.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'template'
  } catch {
    return 'template'
  }
}

function isVideoPreviewUrl(url: string): boolean {
  try {
    return VIDEO_URL_EXT.test(new URL(url).pathname)
  } catch {
    return false
  }
}

function videoExtension(mimeType: string): string {
  if (mimeType === 'video/webm') return 'webm'
  if (mimeType === 'video/ogg') return 'ogv'
  if (mimeType === 'video/quicktime') return 'mov'
  return 'mp4'
}

function videoMimeFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname.toLowerCase()
    if (pathname.endsWith('.webm')) return 'video/webm'
    if (pathname.endsWith('.ogv') || pathname.endsWith('.ogg')) return 'video/ogg'
    if (pathname.endsWith('.mov')) return 'video/quicktime'
  } catch {
    // fall through to mp4
  }
  return 'video/mp4'
}

async function compressPreviewBuffer(buffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(buffer).rotate()
    const { width, height } = await image.metadata()
    if (!width || !height) {
      throw new HttpError(400, 'Could not read image')
    }
    return image.webp({ quality: 80 }).toBuffer()
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(400, 'Could not process image')
  }
}

async function uploadImagePreview(kind: StudioTemplateManagedKind, buffer: Buffer): Promise<string> {
  const compressed = await compressPreviewBuffer(buffer)
  const key = `studio-templates/${kind}/${crypto.randomUUID()}.webp`
  return uploadBufferToR2(key, compressed, 'image/webp')
}

async function uploadVideoPreview(
  kind: StudioTemplateManagedKind,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const ext = videoExtension(mimeType)
  const key = `studio-templates/${kind}/${crypto.randomUUID()}.${ext}`
  return uploadBufferToR2(key, buffer, mimeType || 'video/mp4')
}

async function resolvePreviewUrls(
  kind: StudioTemplateManagedKind,
  mediaUrl: string,
): Promise<{ previewImageUrl: string; sourceImageUrl: string }> {
  if (isStoredPreviewUrl(mediaUrl)) {
    return { previewImageUrl: mediaUrl, sourceImageUrl: mediaUrl }
  }

  const asVideo = kind === StudioTemplateKind.VIDEO && isVideoPreviewUrl(mediaUrl)
  try {
    if (asVideo) {
      const buffer = await downloadVideo(mediaUrl)
      const previewImageUrl = await uploadVideoPreview(kind, buffer, videoMimeFromUrl(mediaUrl))
      return { previewImageUrl, sourceImageUrl: mediaUrl }
    }
    const buffer = await downloadImage(mediaUrl)
    const previewImageUrl = await uploadImagePreview(kind, buffer)
    return { previewImageUrl, sourceImageUrl: mediaUrl }
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(400, asVideo ? 'Could not download video from URL' : 'Could not download image from URL')
  }
}

async function syncCategoryCounts(names: string[]) {
  await Promise.all(
    names.flatMap(name =>
      STUDIO_TEMPLATE_MANAGED_KIND_VALUES.map(kind => syncStudioTemplateCategoryTemplatesCount(kind, name)),
    ),
  )
}

export const listStudioTemplates = async (c: Context<AppContext>) => {
  const query = getQueryString(c.req.url)
  const { templates, meta } = await listTemplatesFromDb(query)
  return successResponse(c, 200, { templates: templates.map(serializeTemplate) }, meta)
}

export const listStudioTemplateCategories = async (c: Context<AppContext>) => {
  const kindParam = c.req.query('kind')
  if (!isStudioTemplateKind(kindParam)) {
    return successResponse(c, 200, { categories: [] })
  }
  const categories = await listCategoriesFromDb(kindParam)
  return successResponse(c, 200, { categories: categories.map(serializeCategory) })
}

export const uploadStudioTemplatePreview = async (c: Context<AppContext>) => {
  const formData = await c.req.formData()
  const file = formData.get('file')
  const kind = requireManagedKind(formData.get('kind') ?? c.req.query('kind'))

  if (!file || !(file instanceof File)) {
    throw new HttpError(400, 'File is required')
  }

  const isVideo = PREVIEW_VIDEO_MIME_TYPES.has(file.type)
  const isImage = PREVIEW_IMAGE_MIME_TYPES.has(file.type)
  if (kind === StudioTemplateKind.VIDEO) {
    if (!isVideo && !isImage) {
      throw new HttpError(400, 'Choose a video (MP4, WebM) or an image')
    }
  } else if (!isImage) {
    throw new HttpError(400, 'Choose a JPEG, PNG, WebP, GIF, or AVIF image')
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    throw new HttpError(400, 'Video is too large')
  }
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    throw new HttpError(400, 'Image is too large')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = isVideo
    ? await uploadVideoPreview(kind, buffer, file.type)
    : await uploadImagePreview(kind, buffer)
  return successResponse(c, 201, { url })
}

export const createStudioTemplate = async (c: Context<AppContext>) => {
  const body = (await c.req.json()) as Record<string, unknown>
  const kind = requireManagedKind(body.kind)
  const categories = parseCategories(body.categories)
  const prompt = optionalTrimmedString(body.prompt)
  const imageUrl = requireHttpUrl(body.imageUrl, 'imageUrl')
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''

  if (kind === StudioTemplateKind.IMAGE && isVideoPreviewUrl(imageUrl) && !isStoredPreviewUrl(imageUrl)) {
    throw new HttpError(400, 'Image templates require an image URL')
  }

  const existing = await getStudioTemplateBySourceUrl(imageUrl)
  if (existing) {
    throw new HttpError(409, 'A template with this media already exists')
  }

  const { previewImageUrl, sourceImageUrl } = await resolvePreviewUrls(kind, imageUrl)

  for (const categoryName of categories) {
    await upsertStudioTemplateCategoryForManagedKinds(categoryName)
  }

  const payload: StudioTemplatePayload = prompt ? { prompt } : {}

  try {
    const template = await createTemplateFromDb({
      kind,
      categories,
      previewImageUrl,
      sourceImageUrl,
      payload,
      name: name || nameFromSourceUrl(sourceImageUrl),
      description: description || undefined,
    })
    await syncCategoryCounts(categories)
    return successResponse(c, 201, { template: serializeTemplate(template) })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new HttpError(409, 'A template with this media already exists')
    }
    throw error
  }
}

export const deleteStudioTemplate = async (c: Context<AppContext>) => {
  const id = parseParamId(c.req.param('id'), 'template ID')
  const template = await deactivateStudioTemplate(id)
  if (!template) {
    throw new HttpError(404, 'Template not found')
  }

  await syncCategoryCounts(template.categories)
  return successResponse(c, 200, { message: 'Template deleted successfully' })
}

export const createStudioTemplateCategory = async (c: Context<AppContext>) => {
  const body = (await c.req.json()) as Record<string, unknown>
  const name = requireTrimmedString(body.name, 'name')

  try {
    const category = await upsertStudioTemplateCategoryForManagedKinds(name)
    return successResponse(c, 201, { category: serializeCategory(category) })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new HttpError(409, 'A category with this name already exists')
    }
    throw error
  }
}

export const updateStudioTemplateCategory = async (c: Context<AppContext>) => {
  const id = parseParamId(c.req.param('id'), 'category ID')
  const body = (await c.req.json()) as Record<string, unknown>
  const name = requireTrimmedString(body.name, 'name')

  try {
    const category = await renameStudioTemplateCategory(id, name)
    if (!category) {
      throw new HttpError(404, 'Category not found')
    }
    return successResponse(c, 200, { category: serializeCategory(category) })
  } catch (error) {
    if (error instanceof Error && error.message === 'STUDIO_TEMPLATE_CATEGORY_NAME_CONFLICT') {
      throw new HttpError(409, 'A category with this name already exists')
    }
    if (isDuplicateKeyError(error)) {
      throw new HttpError(409, 'A category with this name already exists')
    }
    throw error
  }
}

export const deleteStudioTemplateCategory = async (c: Context<AppContext>) => {
  const id = parseParamId(c.req.param('id'), 'category ID')
  const category = await getStudioTemplateCategoryById(id)
  if (!category || !category.active) {
    throw new HttpError(404, 'Category not found')
  }

  const modifiedCount = await deactivateStudioTemplateCategoriesByName(category.name)
  if (modifiedCount === 0) {
    throw new HttpError(404, 'Category not found')
  }
  return successResponse(c, 200, { message: 'Category deleted successfully' })
}
