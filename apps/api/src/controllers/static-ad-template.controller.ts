import { ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE } from '@/config/api.config.js'
import { R2_CDN_BASE_URL, R2_PUBLIC_BASE_URL, uploadBufferToR2 } from '@/lib/aws.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString, parseParamId, requireTrimmedString } from '@/utils/common.utils.js'
import { downloadImage } from '@/utils/download-image.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  createStaticAdTemplate as createTemplateFromDb,
  deactivateStaticAdTemplate,
  deactivateStaticAdTemplateCategory,
  getStaticAdTemplateBySourceUrl,
  getStaticAdTemplateCategoryById,
  isDuplicateKeyError,
  listStaticAdTemplateCategories as listCategoriesFromDb,
  listStaticAdTemplates as listTemplatesFromDb,
  syncCategoryTemplatesCount,
  upsertStaticAdTemplateCategoryByName,
  type IStaticAdTemplate,
  type IStaticAdTemplateCategory,
} from '@socialista/db'
import type { StaticAdTemplateCategoryDto, StaticAdTemplateDto } from '@socialista/types'
import type { Context } from 'hono'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'

const PREVIEW_IMAGE_MIME_TYPES = new Set(
  [...ALLOWED_MIME_TYPES].filter(type => type.startsWith('image/') && type !== 'image/svg+xml'),
)

function serializeTemplate(template: IStaticAdTemplate): StaticAdTemplateDto {
  return {
    _id: template._id.toString(),
    imageUrl: template.imageUrl,
    categories: template.categories,
    ...(template.name ? { name: template.name } : {}),
    createdAt: template.createdAt,
  }
}

function serializeCategory(category: IStaticAdTemplateCategory): StaticAdTemplateCategoryDto {
  return {
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    templatesCount: category.templatesCount,
    createdAt: category.createdAt,
  }
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

async function uploadImagePreview(buffer: Buffer): Promise<string> {
  const compressed = await compressPreviewBuffer(buffer)
  const key = `static-ad-templates/${crypto.randomUUID()}.webp`
  return uploadBufferToR2(key, compressed, 'image/webp')
}

async function resolveImageUrls(
  mediaUrl: string,
): Promise<{ imageUrl: string; sourceImageUrl: string }> {
  if (isStoredPreviewUrl(mediaUrl)) {
    return { imageUrl: mediaUrl, sourceImageUrl: mediaUrl }
  }

  try {
    const buffer = await downloadImage(mediaUrl)
    const imageUrl = await uploadImagePreview(buffer)
    return { imageUrl, sourceImageUrl: mediaUrl }
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(400, 'Could not download image from URL')
  }
}

async function syncCategoryCounts(names: string[]) {
  await Promise.all(names.map(name => syncCategoryTemplatesCount(name)))
}

export const listStaticAdTemplates = async (c: Context<AppContext>) => {
  const query = getQueryString(c.req.url)
  const { templates, meta } = await listTemplatesFromDb(query)
  return successResponse(c, 200, { templates: templates.map(serializeTemplate) }, meta)
}

export const listStaticAdTemplateCategories = async (c: Context<AppContext>) => {
  const categories = await listCategoriesFromDb()
  return successResponse(c, 200, { categories: categories.map(serializeCategory) })
}

export const uploadStaticAdTemplatePreview = async (c: Context<AppContext>) => {
  const formData = await c.req.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    throw new HttpError(400, 'File is required')
  }

  if (!PREVIEW_IMAGE_MIME_TYPES.has(file.type)) {
    throw new HttpError(400, 'Choose a JPEG, PNG, WebP, GIF, or AVIF image')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new HttpError(400, 'Image is too large')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadImagePreview(buffer)
  return successResponse(c, 201, { url })
}

export const createStaticAdTemplate = async (c: Context<AppContext>) => {
  const body = (await c.req.json()) as Record<string, unknown>
  const categories = parseCategories(body.categories)
  const imageUrlInput = requireHttpUrl(body.imageUrl, 'imageUrl')
  const name = typeof body.name === 'string' ? body.name.trim() : ''

  const existing = await getStaticAdTemplateBySourceUrl(imageUrlInput)
  if (existing) {
    throw new HttpError(409, 'A template with this media already exists')
  }

  const { imageUrl, sourceImageUrl } = await resolveImageUrls(imageUrlInput)

  for (const categoryName of categories) {
    await upsertStaticAdTemplateCategoryByName(categoryName)
  }

  try {
    const template = await createTemplateFromDb({
      imageUrl,
      sourceImageUrl,
      categories,
      name: name || nameFromSourceUrl(sourceImageUrl),
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

export const deleteStaticAdTemplate = async (c: Context<AppContext>) => {
  const id = parseParamId(c.req.param('id'), 'template ID')
  const template = await deactivateStaticAdTemplate(id)
  if (!template) {
    throw new HttpError(404, 'Template not found')
  }

  await syncCategoryCounts(template.categories)
  return successResponse(c, 200, { message: 'Template deleted successfully' })
}

export const createStaticAdTemplateCategory = async (c: Context<AppContext>) => {
  const body = (await c.req.json()) as Record<string, unknown>
  const name = requireTrimmedString(body.name, 'name')

  try {
    const category = await upsertStaticAdTemplateCategoryByName(name)
    return successResponse(c, 201, { category: serializeCategory(category) })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new HttpError(409, 'A category with this name already exists')
    }
    throw error
  }
}

export const deleteStaticAdTemplateCategory = async (c: Context<AppContext>) => {
  const id = parseParamId(c.req.param('id'), 'category ID')
  const category = await getStaticAdTemplateCategoryById(id)
  if (!category || !category.active) {
    throw new HttpError(404, 'Category not found')
  }

  const deactivated = await deactivateStaticAdTemplateCategory(id)
  if (!deactivated) {
    throw new HttpError(404, 'Category not found')
  }
  return successResponse(c, 200, { message: 'Category deleted successfully' })
}
