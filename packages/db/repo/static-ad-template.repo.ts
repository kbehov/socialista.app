import { StaticAdTemplateCategoryModel } from '../models/static-ad-template-category.model.js'
import { StaticAdTemplateModel } from '../models/static-ad-template.model.js'
import type {
  CreateStaticAdTemplateInput,
  IStaticAdTemplate,
  IStaticAdTemplateCategory,
} from '../types/static-ad-template.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'

export function slugifyCategoryName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || 'category'
}

export const getStaticAdTemplateBySourceUrl = async (
  sourceImageUrl: string,
): Promise<IStaticAdTemplate | null> => {
  return StaticAdTemplateModel.findOne({ sourceImageUrl }).lean()
}

export const createStaticAdTemplate = async (input: CreateStaticAdTemplateInput) => {
  return StaticAdTemplateModel.create({
    imageUrl: input.imageUrl,
    sourceImageUrl: input.sourceImageUrl,
    categories: input.categories,
    name: input.name,
    active: input.active ?? true,
  })
}

export const listStaticAdTemplates = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const category = typeof match.category === 'string' ? match.category : undefined
  delete match.category

  const filter: Record<string, unknown> = {
    ...match,
    active: true,
    ...(category ? { categories: category } : {}),
  }

  const [templates, total] = await Promise.all([
    StaticAdTemplateModel.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    StaticAdTemplateModel.countDocuments(filter),
  ])

  return {
    templates,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const listStaticAdTemplateCategories = async (): Promise<IStaticAdTemplateCategory[]> => {
  return StaticAdTemplateCategoryModel.find({ active: true }).sort({ name: 1 }).lean()
}

export const upsertStaticAdTemplateCategoryByName = async (
  name: string,
): Promise<IStaticAdTemplateCategory> => {
  const trimmed = name.trim()
  const existing = await StaticAdTemplateCategoryModel.findOne({ name: trimmed }).lean()
  if (existing) return existing

  const created = await StaticAdTemplateCategoryModel.create({
    name: trimmed,
    slug: slugifyCategoryName(trimmed),
    templatesCount: 0,
    active: true,
  })
  return created.toObject()
}

export const syncCategoryTemplatesCount = async (
  categoryName: string,
): Promise<IStaticAdTemplateCategory | null> => {
  const templatesCount = await StaticAdTemplateModel.countDocuments({
    active: true,
    categories: categoryName,
  })
  return StaticAdTemplateCategoryModel.findOneAndUpdate(
    { name: categoryName },
    { $set: { templatesCount } },
    { returnDocument: 'after' },
  ).lean()
}
