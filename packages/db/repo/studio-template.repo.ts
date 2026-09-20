import {
  isStudioTemplateKind,
  STUDIO_TEMPLATE_MANAGED_KIND_VALUES,
  type StudioTemplateKind,
} from '@socialista/types'
import { StudioTemplateCategoryModel } from '../models/studio-template-category.model.js'
import { StudioTemplateModel } from '../models/studio-template.model.js'
import type {
  CreateStudioTemplateInput,
  IStudioTemplateCategory,
} from '../types/studio-template.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'

function slugifyCategoryName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || 'category'
}

export const getStudioTemplateBySourceUrl = async (sourceImageUrl: string) => {
  return StudioTemplateModel.findOne({ sourceImageUrl }).lean()
}

export const getStudioTemplateById = async (id: string) => {
  return StudioTemplateModel.findOne({ _id: id, active: true }).lean()
}

export const createStudioTemplate = async (input: CreateStudioTemplateInput) => {
  return StudioTemplateModel.create({
    kind: input.kind,
    categories: input.categories,
    previewImageUrl: input.previewImageUrl,
    sourceImageUrl: input.sourceImageUrl,
    payload: input.payload,
    name: input.name,
    description: input.description,
    active: input.active ?? true,
  })
}

export const listStudioTemplates = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const kind = isStudioTemplateKind(match.kind) ? match.kind : undefined
  delete match.kind
  const category = typeof match.category === 'string' ? match.category : undefined
  delete match.category

  if (!kind) {
    return { templates: [], meta: buildPaginationMeta(0, pagination, sort) }
  }

  const filter: Record<string, unknown> = {
    ...match,
    kind,
    active: true,
    ...(category ? { categories: category } : {}),
  }

  const [templates, total] = await Promise.all([
    StudioTemplateModel.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    StudioTemplateModel.countDocuments(filter),
  ])

  return {
    templates,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const listStudioTemplateCategories = async (
  kind: StudioTemplateKind,
): Promise<IStudioTemplateCategory[]> => {
  return StudioTemplateCategoryModel.find({ kind, active: true }).sort({ name: 1 }).lean()
}

export const upsertStudioTemplateCategoryByName = async (
  kind: StudioTemplateKind,
  name: string,
): Promise<IStudioTemplateCategory> => {
  const trimmed = name.trim()
  const existing = await StudioTemplateCategoryModel.findOne({ kind, name: trimmed })
  if (existing) {
    if (!existing.active) {
      existing.active = true
      await existing.save()
    }
    return existing.toObject()
  }

  const created = await StudioTemplateCategoryModel.create({
    kind,
    name: trimmed,
    slug: slugifyCategoryName(trimmed),
    templatesCount: 0,
    active: true,
  })
  return created.toObject()
}

export const deactivateStudioTemplate = async (id: string) => {
  return StudioTemplateModel.findOneAndUpdate(
    { _id: id, active: true },
    { $set: { active: false } },
    { returnDocument: 'after' },
  ).lean()
}

export const deactivateStudioTemplateCategory = async (id: string) => {
  return StudioTemplateCategoryModel.findOneAndUpdate(
    { _id: id, active: true },
    { $set: { active: false } },
    { returnDocument: 'after' },
  ).lean()
}

export const getStudioTemplateCategoryById = async (id: string) => {
  return StudioTemplateCategoryModel.findById(id).lean()
}

export const upsertStudioTemplateCategoryForManagedKinds = async (
  name: string,
): Promise<IStudioTemplateCategory> => {
  const categories = await Promise.all(
    STUDIO_TEMPLATE_MANAGED_KIND_VALUES.map(kind => upsertStudioTemplateCategoryByName(kind, name)),
  )
  const first = categories[0]
  if (!first) {
    throw new Error('Failed to upsert studio template category')
  }
  return first
}

export const deactivateStudioTemplateCategoriesByName = async (name: string) => {
  const result = await StudioTemplateCategoryModel.updateMany(
    { name, active: true },
    { $set: { active: false } },
  )
  return result.modifiedCount
}

export const syncStudioTemplateCategoryTemplatesCount = async (
  kind: StudioTemplateKind,
  categoryName: string,
): Promise<IStudioTemplateCategory | null> => {
  const templatesCount = await StudioTemplateModel.countDocuments({
    kind,
    active: true,
    categories: categoryName,
  })
  return StudioTemplateCategoryModel.findOneAndUpdate(
    { kind, name: categoryName },
    { $set: { templatesCount } },
    { returnDocument: 'after' },
  ).lean()
}
