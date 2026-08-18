import { SkillCategoryModel } from '../models/skill-category.model.js'
import { SkillModel } from '../models/skill.model.js'
import {
  SkillBinding,
  SkillSource,
  SkillStatus,
  SkillVariableType,
  SkillVisibility,
  type CreateSkillInput,
  type ISkill,
  type SkillDocument,
  type SystemSkillSyncInput,
  type UpdateSkillInput,
} from '../types/skill.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'

const CATEGORY_POPULATE = { path: 'categoryId', select: 'slug name icon' }

function categoryIdString(skill: ISkill): string {
  const value = skill.categoryId as unknown
  if (value && typeof value === 'object' && value !== null && '_id' in value) {
    return (value as { _id: { toString(): string } })._id.toString()
  }
  return skill.categoryId.toString()
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function applySkillTextSearch(match: Record<string, unknown>, textSearch?: string) {
  if (!textSearch) return match
  const regex = new RegExp(escapeRegex(textSearch), 'i')
  return {
    ...match,
    $or: [{ name: regex }, { description: regex }, { slug: regex }],
  }
}

function mapCreateFields(input: CreateSkillInput): Partial<ISkill> {
  return {
    workspaceId: input.workspaceId ? toObjectId(input.workspaceId) : null,
    slug: input.slug,
    name: input.name,
    description: input.description ?? '',
    categoryId: toObjectId(input.categoryId),
    binding: input.binding,
    slot: input.slot,
    icon: input.icon,
    content: input.content,
    variables: input.variables ?? [],
    outputSchema: input.outputSchema,
    toolBindings: input.toolBindings,
    modelConfig: input.modelConfig,
    source: input.source,
    forkedFrom: input.forkedFrom ? toObjectId(input.forkedFrom) : undefined,
    visibility: input.visibility ?? SkillVisibility.WORKSPACE,
    status: input.status ?? SkillStatus.DRAFT,
    version: input.version ?? 1,
    usageCount: input.usageCount ?? 0,
    createdBy: input.createdBy ? toObjectId(input.createdBy) : undefined,
  }
}

function mapUpdateFields(updates: UpdateSkillInput): Record<string, unknown> {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}

  if (updates.slug !== undefined) $set.slug = updates.slug
  if (updates.name !== undefined) $set.name = updates.name
  if (updates.description !== undefined) $set.description = updates.description
  if (updates.categoryId !== undefined) $set.categoryId = toObjectId(updates.categoryId)
  if (updates.binding !== undefined) $set.binding = updates.binding
  if (updates.content !== undefined) $set.content = updates.content
  if (updates.variables !== undefined) $set.variables = updates.variables
  if (updates.visibility !== undefined) $set.visibility = updates.visibility
  if (updates.status !== undefined) $set.status = updates.status
  if (updates.version !== undefined) $set.version = updates.version

  if (updates.icon === null) $unset.icon = 1
  else if (updates.icon !== undefined) $set.icon = updates.icon

  if (updates.slot === null) $unset.slot = 1
  else if (updates.slot !== undefined) $set.slot = updates.slot

  if (updates.outputSchema === null) $unset.outputSchema = 1
  else if (updates.outputSchema !== undefined) $set.outputSchema = updates.outputSchema

  if (updates.toolBindings === null) $unset.toolBindings = 1
  else if (updates.toolBindings !== undefined) $set.toolBindings = updates.toolBindings

  if (updates.modelConfig === null) $unset.modelConfig = 1
  else if (updates.modelConfig !== undefined) $set.modelConfig = updates.modelConfig

  const ops: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) ops.$set = $set
  if (Object.keys($unset).length > 0) ops.$unset = $unset
  return ops
}

export const createSkill = async (input: CreateSkillInput): Promise<SkillDocument> => {
  return SkillModel.create(mapCreateFields(input))
}

export const getSkillById = async (id: string): Promise<ISkill | null> => {
  return SkillModel.findById(id).populate(CATEGORY_POPULATE).lean()
}

export const getSkillBySlug = async (
  slug: string,
  workspaceId?: string | null,
): Promise<ISkill | null> => {
  const filter: Record<string, unknown> = { slug }
  filter.workspaceId = workspaceId ? toObjectId(workspaceId) : null
  return SkillModel.findOne(filter).lean()
}

export const listSkills = async (query: string) => {
  const { match, pagination, sort, textSearch } = buildFilters(query)
  const filter = applySkillTextSearch(match, textSearch)
  const [skills, total] = await Promise.all([
    SkillModel.find(filter)
      .populate(CATEGORY_POPULATE)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    SkillModel.countDocuments(filter),
  ])
  return {
    skills,
    meta: buildPaginationMeta(total, pagination, sort, textSearch),
  }
}

export const listWorkspaceSkills = async (workspaceId: string, query: string) => {
  const { match, pagination, sort, textSearch } = buildFilters(query)
  const workspaceOid = toObjectId(workspaceId)
  const rest = { ...match }
  delete rest.workspaceId
  const scope = {
    $or: [{ workspaceId: workspaceOid }, { workspaceId: null, source: SkillSource.SYSTEM }],
  }
  const searchFilter = textSearch ? applySkillTextSearch({}, textSearch) : {}
  const filter =
    Object.keys(searchFilter).length > 0
      ? { $and: [scope, rest, searchFilter] }
      : { ...rest, ...scope }

  const [skills, total] = await Promise.all([
    SkillModel.find(filter)
      .populate(CATEGORY_POPULATE)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    SkillModel.countDocuments(filter),
  ])
  return {
    skills,
    meta: buildPaginationMeta(total, pagination, sort, textSearch),
  }
}

export const updateSkill = async (
  id: string,
  updates: UpdateSkillInput,
): Promise<SkillDocument | null> => {
  const ops = mapUpdateFields(updates)
  if (Object.keys(ops).length === 0) {
    return SkillModel.findById(id)
  }
  return SkillModel.findByIdAndUpdate(id, ops, { new: true }).populate(CATEGORY_POPULATE)
}

export const deleteSkill = async (id: string): Promise<boolean> => {
  const deleted = await SkillModel.findByIdAndDelete(id)
  return Boolean(deleted)
}

export const forkSkill = async (input: {
  source: ISkill
  workspaceId: string
  createdBy: string
  name?: string
  slug: string
}): Promise<SkillDocument> => {
  return createSkill({
    workspaceId: input.workspaceId,
    slug: input.slug,
    name: input.name ?? `${input.source.name} (copy)`,
    description: input.source.description,
    categoryId: categoryIdString(input.source),
    binding: input.source.binding,
    slot: undefined,
    icon: input.source.icon,
    content: input.source.content,
    variables: input.source.variables,
    outputSchema: input.source.outputSchema,
    toolBindings: input.source.toolBindings,
    modelConfig: input.source.modelConfig,
    source: SkillSource.FORKED,
    forkedFrom: input.source._id.toString(),
    visibility: SkillVisibility.WORKSPACE,
    status: SkillStatus.DRAFT,
    version: 1,
    usageCount: 0,
    createdBy: input.createdBy,
  })
}

/** Workspace override first (published, matching slot), then the system default. */
export const findDefaultSkill = async (
  slot: string,
  workspaceId?: string | null,
): Promise<ISkill | null> => {
  if (workspaceId) {
    const workspaceSkill = await SkillModel.findOne({
      slot,
      workspaceId: toObjectId(workspaceId),
      status: SkillStatus.PUBLISHED,
      source: { $in: [SkillSource.USER, SkillSource.FORKED] },
    })
      .sort({ updatedAt: -1 })
      .lean()
    if (workspaceSkill) return workspaceSkill
  }

  return SkillModel.findOne({
    slot,
    workspaceId: null,
    source: SkillSource.SYSTEM,
    status: SkillStatus.PUBLISHED,
  }).lean()
}

export const incrementSkillUsage = async (id: string): Promise<void> => {
  await SkillModel.findByIdAndUpdate(id, { $inc: { usageCount: 1 } })
}

export const syncSystemSkills = async (defs: SystemSkillSyncInput[]): Promise<number> => {
  if (defs.length === 0) return 0

  const slugs = [...new Set(defs.map(def => def.categorySlug))]
  const categories = await SkillCategoryModel.find({
    workspaceId: null,
    slug: { $in: slugs },
  }).lean()
  const categoryIdBySlug = new Map(categories.map(category => [category.slug, category._id]))

  const ops = defs.flatMap(def => {
    const categoryId = categoryIdBySlug.get(def.categorySlug)
    if (!categoryId) return []
    return [
      {
        updateOne: {
          filter: { workspaceId: null, slug: def.slug },
          update: {
            $set: {
              workspaceId: null,
              slug: def.slug,
              name: def.name,
              description: def.description,
              categoryId,
              binding: def.binding as SkillBinding,
              ...(def.slot ? { slot: def.slot } : {}),
              icon: def.icon,
              content: def.content,
              variables: (def.variables ?? []).map(variable => ({
                ...variable,
                type: variable.type as SkillVariableType,
              })),
              outputSchema: def.outputSchema,
              toolBindings: def.toolBindings,
              modelConfig: def.modelConfig,
              source: SkillSource.SYSTEM,
              visibility: SkillVisibility.PUBLIC,
              status: SkillStatus.PUBLISHED,
            },
            $unset: {
              category: 1 as const,
              ...(def.slot ? {} : { slot: 1 as const }),
            },
            $setOnInsert: {
              version: 1,
              usageCount: 0,
            },
          },
          upsert: true,
        },
      },
    ]
  })

  if (ops.length === 0) return 0
  const result = await SkillModel.bulkWrite(ops)
  return result.upsertedCount + result.modifiedCount
}
