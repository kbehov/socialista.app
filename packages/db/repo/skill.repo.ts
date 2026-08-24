import { SkillModel } from '../models/skill.model.js'
import type { CreateSkillInput, ISkill, SkillDocument, UpdateSkillInput } from '../types/skill.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'

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
    workspaceId: toObjectId(input.workspaceId),
    slug: input.slug,
    name: input.name,
    description: input.description ?? '',
    icon: input.icon,
    target: input.target,
    content: input.content,
    usageCount: 0,
    createdBy: input.createdBy ? toObjectId(input.createdBy) : undefined,
  }
}

function mapUpdateFields(updates: UpdateSkillInput): Record<string, unknown> {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}

  if (updates.slug !== undefined) $set.slug = updates.slug
  if (updates.name !== undefined) $set.name = updates.name
  if (updates.description !== undefined) $set.description = updates.description
  if (updates.target !== undefined) $set.target = updates.target
  if (updates.content !== undefined) $set.content = updates.content

  if (updates.icon === null) $unset.icon = 1
  else if (updates.icon !== undefined) $set.icon = updates.icon

  const ops: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) ops.$set = $set
  if (Object.keys($unset).length > 0) ops.$unset = $unset
  return ops
}

export const createSkill = async (input: CreateSkillInput): Promise<SkillDocument> => {
  return SkillModel.create(mapCreateFields(input))
}

export const getSkillById = async (id: string): Promise<ISkill | null> => {
  return SkillModel.findById(id).lean()
}

export const listWorkspaceSkills = async (workspaceId: string, query: string) => {
  const { match, pagination, sort, textSearch } = buildFilters(query)
  const rest = { ...match }
  delete rest.workspaceId
  const filter = applySkillTextSearch({ ...rest, workspaceId: toObjectId(workspaceId) }, textSearch)

  const [skills, total] = await Promise.all([
    SkillModel.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    SkillModel.countDocuments(filter),
  ])
  return {
    skills,
    meta: buildPaginationMeta(total, pagination, sort, textSearch),
  }
}

export const updateSkill = async (id: string, updates: UpdateSkillInput): Promise<SkillDocument | null> => {
  const ops = mapUpdateFields(updates)
  if (Object.keys(ops).length === 0) {
    return SkillModel.findById(id)
  }
  return SkillModel.findByIdAndUpdate(id, ops, { new: true })
}

export const deleteSkill = async (id: string): Promise<boolean> => {
  const deleted = await SkillModel.findByIdAndDelete(id)
  return Boolean(deleted)
}

export const incrementSkillUsage = async (id: string): Promise<void> => {
  await SkillModel.findByIdAndUpdate(id, { $inc: { usageCount: 1 } })
}

export const skillSlugExists = async (
  workspaceId: string,
  slug: string,
  exceptId?: string,
): Promise<boolean> => {
  const filter: Record<string, unknown> = { workspaceId: toObjectId(workspaceId), slug }
  if (exceptId) filter._id = { $ne: toObjectId(exceptId) }
  return Boolean(await SkillModel.exists(filter))
}

