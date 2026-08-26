import type { AppContext } from '@/middlewares/auth.middleware.js'
import {
  applyProjectQueryAlias,
  assertHasUpdates,
  optionalTrimmedString,
  parseOptionalId,
  parseParamId,
  requireTrimmedString,
  withQueryParam,
} from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { getWorkspaceAsMember, resolveProjectForWorkspace } from '@/utils/workspace.utils.js'
import {
  createBrand as createBrandInDb,
  deleteBrand as deleteBrandInDb,
  getBrandById,
  getBrands,
  toObjectId,
  updateBrand as updateBrandInDb,
  type IBrand,
} from '@socialista/db'
import type { CreateBrandPayload, Brand, UpdateBrandPayload } from '@socialista/types'
import type { Context } from 'hono'

const MAX_BRAND_COLORS = 12
const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

function serializeBrand(brand: IBrand): Brand {
  return {
    _id: brand._id.toString(),
    workspaceId: brand.workspaceId.toString(),
    ...(brand.project ? { projectId: brand.project.toString() } : {}),
    name: brand.name,
    ...(brand.description ? { description: brand.description } : {}),
    ...(brand.industry ? { industry: brand.industry } : {}),
    ...(brand.website ? { website: brand.website } : {}),
    ...(brand.logo ? { logo: brand.logo } : {}),
    colors: brand.colors ?? [],
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  }
}

function normalizeHexColor(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase()
  if (!HEX_COLOR_RE.test(trimmed)) return undefined
  if (trimmed.length === 4) {
    const r = trimmed[1]
    const g = trimmed[2]
    const b = trimmed[3]
    if (!r || !g || !b) return undefined
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return trimmed
}

function parseColors(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new HttpError(400, 'Brand colors must be an array of hex values')
  }

  const colors: string[] = []
  const seen = new Set<string>()

  for (const item of value) {
    if (typeof item !== 'string') {
      throw new HttpError(400, 'Each brand color must be a hex string')
    }
    const hex = normalizeHexColor(item)
    if (!hex) {
      throw new HttpError(400, 'Brand colors must be hex values like #0A84FF')
    }
    if (seen.has(hex)) continue
    seen.add(hex)
    colors.push(hex)
    if (colors.length > MAX_BRAND_COLORS) {
      throw new HttpError(400, `A brand can have at most ${MAX_BRAND_COLORS} colors`)
    }
  }

  return colors
}

function parseOptionalUrl(value: unknown, label: string): string | undefined {
  const trimmed = optionalTrimmedString(value)
  if (!trimmed) return undefined
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new HttpError(400, `${label} must be an http or https URL`)
    }
    return trimmed
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(400, `Invalid ${label}`)
  }
}

function parseCreateBrandInput(body: Record<string, unknown>): CreateBrandPayload {
  const workspaceId = parseParamId(typeof body.workspaceId === 'string' ? body.workspaceId : undefined, 'workspace ID')
  const name = requireTrimmedString(body.name, 'Brand name')

  return {
    workspaceId,
    projectId: parseOptionalId(body.projectId, 'project ID'),
    name,
    description: optionalTrimmedString(body.description),
    industry: optionalTrimmedString(body.industry),
    website: parseOptionalUrl(body.website, 'website'),
    logo: optionalTrimmedString(body.logo),
    colors: body.colors === undefined ? [] : parseColors(body.colors),
  }
}

function parseUpdateBrandInput(body: Record<string, unknown>): UpdateBrandPayload {
  const updates: UpdateBrandPayload = {}

  if (body.name !== undefined) {
    updates.name = requireTrimmedString(body.name, 'Brand name')
  }

  if (body.description !== undefined) {
    updates.description = typeof body.description === 'string' ? body.description.trim() : ''
  }

  if (body.industry !== undefined) {
    updates.industry = typeof body.industry === 'string' ? body.industry.trim() : ''
  }

  if (body.website !== undefined) {
    if (body.website === null || body.website === '') {
      updates.website = ''
    } else {
      updates.website = parseOptionalUrl(body.website, 'website') ?? ''
    }
  }

  if (body.logo !== undefined) {
    updates.logo = typeof body.logo === 'string' ? body.logo.trim() : ''
  }

  if (body.colors !== undefined) {
    updates.colors = parseColors(body.colors)
  }

  assertHasUpdates(updates)
  return updates
}

async function getBrandForMember(id: string, userId: string) {
  const brand = await getBrandById(id)
  if (!brand) {
    throw new HttpError(404, 'Brand not found')
  }
  await getWorkspaceAsMember(brand.workspaceId.toString(), userId)
  return brand
}

export const createBrand = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = parseCreateBrandInput((await c.req.json()) as Record<string, unknown>)
  await getWorkspaceAsMember(input.workspaceId, userId)
  const project = await resolveProjectForWorkspace(input.workspaceId, input.projectId)

  const brand = await createBrandInDb({
    workspaceId: toObjectId(input.workspaceId),
    project: toObjectId(project._id.toString()),
    name: input.name,
    description: input.description,
    industry: input.industry,
    website: input.website,
    logo: input.logo,
    colors: input.colors ?? [],
  })

  return successResponse(c, 201, { brand: serializeBrand(brand.toObject()) })
}

export const getWorkspaceBrands = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await getBrands(applyProjectQueryAlias(withQueryParam(c.req.url, 'workspaceId', workspaceId)))
  return successResponse(
    c,
    200,
    { brands: data.brands.map(brand => serializeBrand(brand as IBrand)) },
    data.meta,
  )
}

export const getBrand = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'brand ID')
  const brand = await getBrandForMember(id, userId)
  return successResponse(c, 200, { brand: serializeBrand(brand) })
}

export const updateBrand = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'brand ID')
  const input = parseUpdateBrandInput((await c.req.json()) as Record<string, unknown>)
  await getBrandForMember(id, userId)

  const brand = await updateBrandInDb(id, input)
  if (!brand) {
    throw new HttpError(404, 'Brand not found')
  }

  return successResponse(c, 200, { brand: serializeBrand(brand.toObject()) })
}

export const deleteBrand = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'brand ID')
  await getBrandForMember(id, userId)

  const deleted = await deleteBrandInDb(id)
  if (!deleted) {
    throw new HttpError(404, 'Brand not found')
  }

  return successResponse(c, 200, { id })
}
