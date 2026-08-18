import type { AppContext } from '@/middlewares/auth.middleware.js'
import { withQueryParam, parseParamId, optionalTrimmedString, requireTrimmedString } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  createSkillCategory as createSkillCategoryInDb,
  deleteSkillCategory as deleteSkillCategoryInDb,
  getSkillCategoryById,
  getSkillCategoryBySlug,
  listWorkspaceSkillCategories,
  SkillCategoryStatus,
  SkillSource,
  updateSkillCategory as updateSkillCategoryInDb,
  type ISkillCategory,
} from '@socialista/db'
import {
  SKILL_CATEGORY_STATUSES,
  type CreateSkillCategoryPayload,
  type SkillCategory,
  type UpdateSkillCategoryPayload,
} from '@socialista/types'
import type { Context } from 'hono'

function serializeSkillCategory(category: ISkillCategory): SkillCategory {
  return {
    _id: category._id.toString(),
    workspaceId: category.workspaceId ? category.workspaceId.toString() : null,
    slug: category.slug,
    name: category.name,
    description: category.description,
    ...(category.icon ? { icon: category.icon } : {}),
    sortOrder: category.sortOrder,
    source: category.source === SkillSource.SYSTEM ? 'system' : 'user',
    status: category.status,
    ...(category.createdBy ? { createdBy: category.createdBy.toString() } : {}),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || 'category'
}

async function uniqueWorkspaceCategorySlug(workspaceId: string, base: string): Promise<string> {
  let slug = slugify(base)
  let n = 2
  while (await getSkillCategoryBySlug(slug, workspaceId)) {
    slug = `${slugify(base).slice(0, 70)}-${n}`
    n += 1
  }
  return slug
}

function parseCreateCategoryInput(body: Record<string, unknown>): CreateSkillCategoryPayload {
  const workspaceId = parseParamId(
    typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
    'workspace ID',
  )
  const name = requireTrimmedString(body.name, 'Category name')
  const sortOrder =
    typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
      ? Math.round(body.sortOrder)
      : undefined

  return {
    workspaceId,
    name,
    slug: optionalTrimmedString(body.slug),
    description: optionalTrimmedString(body.description) ?? '',
    icon: optionalTrimmedString(body.icon),
    sortOrder,
  }
}

function parseUpdateCategoryInput(body: Record<string, unknown>): UpdateSkillCategoryPayload {
  const updates: UpdateSkillCategoryPayload = {}

  if (typeof body.name === 'string') {
    updates.name = requireTrimmedString(body.name, 'Category name')
  }
  if (typeof body.slug === 'string') {
    updates.slug = slugify(requireTrimmedString(body.slug, 'Category slug'))
  }
  if (typeof body.description === 'string') {
    updates.description = body.description.trim()
  }
  if (body.icon === null) updates.icon = null
  else if (typeof body.icon === 'string') updates.icon = body.icon.trim()
  if (typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)) {
    updates.sortOrder = Math.round(body.sortOrder)
  }
  if (typeof body.status === 'string') {
    if (!(SKILL_CATEGORY_STATUSES as readonly string[]).includes(body.status)) {
      throw new HttpError(400, 'Invalid category status')
    }
    updates.status = body.status as UpdateSkillCategoryPayload['status']
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }
  return updates
}

async function getReadableCategory(id: string, userId: string): Promise<ISkillCategory> {
  const category = await getSkillCategoryById(id)
  if (!category) throw new HttpError(404, 'Category not found')
  if (category.source === SkillSource.SYSTEM || category.workspaceId === null) {
    return category
  }
  await getWorkspaceAsMember(category.workspaceId.toString(), userId)
  return category
}

async function getMutableCategory(id: string, userId: string): Promise<ISkillCategory> {
  const category = await getReadableCategory(id, userId)
  if (category.source === SkillSource.SYSTEM || category.workspaceId === null) {
    throw new HttpError(403, 'System categories cannot be modified')
  }
  return category
}

export const createSkillCategory = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = parseCreateCategoryInput((await c.req.json()) as Record<string, unknown>)
  await getWorkspaceAsMember(input.workspaceId, userId)

  const slug = await uniqueWorkspaceCategorySlug(input.workspaceId, input.slug || input.name)
  const category = await createSkillCategoryInDb({
    workspaceId: input.workspaceId,
    slug,
    name: input.name,
    description: input.description ?? '',
    icon: input.icon,
    sortOrder: input.sortOrder,
    source: SkillSource.USER,
    createdBy: userId,
  })

  return successResponse(c, 201, { category: serializeSkillCategory(category.toObject()) })
}

export const getWorkspaceSkillCategories = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await listWorkspaceSkillCategories(
    workspaceId,
    withQueryParam(c.req.url, 'workspaceId', workspaceId),
  )
  return successResponse(
    c,
    200,
    { categories: data.categories.map(category => serializeSkillCategory(category as ISkillCategory)) },
    data.meta,
  )
}

export const getSkillCategory = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'category ID')
  const category = await getReadableCategory(id, userId)
  return successResponse(c, 200, { category: serializeSkillCategory(category) })
}

export const updateSkillCategory = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'category ID')
  const input = parseUpdateCategoryInput((await c.req.json()) as Record<string, unknown>)
  const existing = await getMutableCategory(id, userId)

  if (input.slug && input.slug !== existing.slug) {
    const collision = await getSkillCategoryBySlug(input.slug, existing.workspaceId!.toString())
    if (collision && collision._id.toString() !== id) {
      throw new HttpError(409, 'A category with this slug already exists in the workspace')
    }
  }

  const category = await updateSkillCategoryInDb(id, {
    slug: input.slug,
    name: input.name,
    description: input.description,
    icon: input.icon,
    sortOrder: input.sortOrder,
    status: input.status as SkillCategoryStatus | undefined,
  })
  if (!category) throw new HttpError(404, 'Category not found')

  return successResponse(c, 200, { category: serializeSkillCategory(category.toObject()) })
}

export const deleteSkillCategory = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'category ID')
  await getMutableCategory(id, userId)

  try {
    const deleted = await deleteSkillCategoryInDb(id)
    if (!deleted) throw new HttpError(404, 'Category not found')
  } catch (error) {
    if (error instanceof Error && error.message === 'Category still has skills') {
      throw new HttpError(409, 'Category still has skills')
    }
    throw error
  }

  return successResponse(c, 200, { id })
}
