import { ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE } from '@/config/api.config.js'
import { uploadBufferToR2 } from '@/lib/aws.js'
import {
  assertHasUpdates,
  getQueryString,
  parseParamId,
  requireTrimmedString,
} from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  countModelsByCompany,
  createAiCompany as createAiCompanyFromDb,
  deleteAiCompany as deleteAiCompanyFromDb,
  getAiCompanies as getAiCompaniesFromDb,
  getAiCompanyById,
  isDuplicateKeyError,
  updateAiCompany as updateAiCompanyFromDb,
  type IAiCompany,
} from '@socialista/db'
import type { AiCompany } from '@socialista/types'
import type { Context } from 'hono'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'

const LOGO_MIME_TYPES = new Set([...ALLOWED_MIME_TYPES].filter(type => type.startsWith('image/')))

async function processLogoFile(file: File) {
  if (!LOGO_MIME_TYPES.has(file.type)) {
    throw new HttpError(400, 'Choose a JPEG, PNG, WebP, GIF, SVG, or AVIF image')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new HttpError(400, 'Image is too large')
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer())
  const image = sharp(rawBuffer, { density: 300 }).rotate()
  const { width, height } = await image.metadata()
  if (!width || !height) {
    throw new HttpError(400, 'Could not read image')
  }

  const buffer = await image.resize(512, 512, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 90 }).toBuffer()
  return { buffer, mimeType: 'image/webp' as const, ext: 'webp' as const }
}

function serializeAiCompany(company: IAiCompany): AiCompany {
  return {
    _id: company._id.toString(),
    name: company.name,
    logo: company.logo,
    slug: company.slug,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }
}

function parseCompanyBody(body: Record<string, unknown>, { partial }: { partial: boolean }) {
  const updates: { name?: string; logo?: string } = {}

  if (!partial || body.name !== undefined) {
    updates.name = requireTrimmedString(body.name, 'Company name')
  }
  if (!partial || body.logo !== undefined) {
    updates.logo = requireTrimmedString(body.logo, 'Company logo')
  }

  return updates
}

export const getAiCompanies = async (c: Context) => {
  const { companies, meta } = await getAiCompaniesFromDb(getQueryString(c.req.url))
  return successResponse(c, 200, { companies: companies.map(serializeAiCompany) }, meta)
}

export const getAiCompany = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'company ID')
  const company = await getAiCompanyById(id)
  if (!company) {
    throw new HttpError(404, 'Company not found')
  }
  return successResponse(c, 200, serializeAiCompany(company))
}

export const createAiCompany = async (c: Context) => {
  const body = (await c.req.json()) as Record<string, unknown>
  const input = parseCompanyBody(body, { partial: false })
  try {
    const company = await createAiCompanyFromDb({ name: input.name!, logo: input.logo! })
    return successResponse(c, 201, serializeAiCompany(company))
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new HttpError(409, 'A company with this name already exists')
    }
    throw error
  }
}

export const updateAiCompany = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'company ID')
  const body = (await c.req.json()) as Record<string, unknown>
  const updates = parseCompanyBody(body, { partial: true })
  assertHasUpdates(updates)

  try {
    const company = await updateAiCompanyFromDb(id, updates)
    if (!company) {
      throw new HttpError(404, 'Company not found')
    }
    return successResponse(c, 200, serializeAiCompany(company))
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new HttpError(409, 'A company with this name already exists')
    }
    throw error
  }
}

export const deleteAiCompany = async (c: Context) => {
  const id = parseParamId(c.req.param('id'), 'company ID')
  const inUse = await countModelsByCompany(id)
  if (inUse > 0) {
    throw new HttpError(409, 'Cannot delete a company that still has models attached')
  }
  const deleted = await deleteAiCompanyFromDb(id)
  if (!deleted) {
    throw new HttpError(404, 'Company not found')
  }
  return successResponse(c, 200, { message: 'Company deleted successfully' })
}

export const uploadAiCompanyLogo = async (c: Context) => {
  const formData = await c.req.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    throw new HttpError(400, 'File is required')
  }

  const { buffer, mimeType, ext } = await processLogoFile(file)
  const key = `ai-companies/logos/${crypto.randomUUID()}.${ext}`
  const url = await uploadBufferToR2(key, buffer, mimeType)

  return successResponse(c, 201, { url })
}
