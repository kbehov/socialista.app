import { SkillCategoryModel } from '../models/skill-category.model.js'
import { SkillModel } from '../models/skill.model.js'
import {
  SkillCategoryStatus,
  SkillSource,
  type CreateSkillCategoryInput,
  type ISkillCategory,
  type SkillCategoryDocument,
  type SystemCategorySyncInput,
  type UpdateSkillCategoryInput,
} from '../types/skill.types.js'
import { buildFilters, buildPaginationMeta, normalizeQuery } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'

function mapCreateFields(input: CreateSkillCategoryInput): Partial<ISkillCategory> {
  return {
    workspaceId: input.workspaceId ? toObjectId(input.workspaceId) : null,
    slug: input.slug,
    name: input.name,
    description: input.description ?? '',
    icon: input.icon,
    sortOrder: input.sortOrder ?? 0,
    source: input.source,
    status: input.status ?? SkillCategoryStatus.ACTIVE,
    createdBy: input.createdBy ? toObjectId(input.createdBy) : undefined,
  }
}

export const createSkillCategory = async (
  input: CreateSkillCategoryInput,
): Promise<SkillCategoryDocument> => {
  return SkillCategoryModel.create(mapCreateFields(input))
}

export const getSkillCategoryById = async (id: string): Promise<ISkillCategory | null> => {
  return SkillCategoryModel.findById(id).lean()
}

export const getSkillCategoryBySlug = async (
  slug: string,
  workspaceId?: string | null,
): Promise<ISkillCategory | null> => {
  return SkillCategoryModel.findOne({
    slug,
    workspaceId: workspaceId ? toObjectId(workspaceId) : null,
  }).lean()
}

/** Readable categories: this workspace's plus published system categories. */
export const listWorkspaceSkillCategories = async (workspaceId: string, query: string) => {
  const { match, pagination, sort, textSearch } = buildFilters(query)
  const workspaceOid = toObjectId(workspaceId)
  const rest = { ...match }
  delete rest.workspaceId
  const scope = {
    $or: [{ workspaceId: workspaceOid }, { workspaceId: null, source: SkillSource.SYSTEM }],
  }
  const searchFilter = textSearch
    ? {
        $or: [
          { name: new RegExp(textSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          { description: new RegExp(textSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          { slug: new RegExp(textSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        ],
      }
    : {}
  const filter =
    Object.keys(searchFilter).length > 0
      ? { $and: [scope, rest, searchFilter] }
      : { ...rest, ...scope }

  const requestedSort = normalizeQuery(query).sort
  const defaultSort: Record<string, 1 | -1> = requestedSort ? sort : { sortOrder: 1, name: 1 }
  const [categories, total] = await Promise.all([
    SkillCategoryModel.find(filter)
      .sort(defaultSort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    SkillCategoryModel.countDocuments(filter),
  ])
  return {
    categories,
    meta: buildPaginationMeta(total, pagination, defaultSort, textSearch),
  }
}

export const updateSkillCategory = async (
  id: string,
  updates: UpdateSkillCategoryInput,
): Promise<SkillCategoryDocument | null> => {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}
  if (updates.slug !== undefined) $set.slug = updates.slug
  if (updates.name !== undefined) $set.name = updates.name
  if (updates.description !== undefined) $set.description = updates.description
  if (updates.sortOrder !== undefined) $set.sortOrder = updates.sortOrder
  if (updates.status !== undefined) $set.status = updates.status
  if (updates.icon === null) $unset.icon = 1
  else if (updates.icon !== undefined) $set.icon = updates.icon

  const ops: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) ops.$set = $set
  if (Object.keys($unset).length > 0) ops.$unset = $unset
  if (Object.keys(ops).length === 0) return SkillCategoryModel.findById(id)
  return SkillCategoryModel.findByIdAndUpdate(id, ops, { new: true })
}

export const deleteSkillCategory = async (id: string): Promise<boolean> => {
  const inUse = await SkillModel.exists({ categoryId: toObjectId(id) })
  if (inUse) {
    throw new Error('Category still has skills')
  }
  const deleted = await SkillCategoryModel.findByIdAndDelete(id)
  return Boolean(deleted)
}

export const syncSystemCategories = async (defs: SystemCategorySyncInput[]): Promise<number> => {
  if (defs.length === 0) return 0
  const ops = defs.map((def, index) => ({
    updateOne: {
      filter: { workspaceId: null, slug: def.slug },
      update: {
        $set: {
          workspaceId: null,
          slug: def.slug,
          name: def.name,
          description: def.description,
          icon: def.icon,
          sortOrder: def.sortOrder ?? index,
          source: SkillSource.SYSTEM,
          status: SkillCategoryStatus.ACTIVE,
        },
      },
      upsert: true,
    },
  }))
  const result = await SkillCategoryModel.bulkWrite(ops)
  return result.upsertedCount + result.modifiedCount
}
