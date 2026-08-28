import { AiCompanyModel } from '../models/ai-company.model.js'
import type { CreateAiCompanyInput, UpdateAiCompanyInput } from '../types/ai-company.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'

function slugifyCompanyName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || 'company'
}

export const createAiCompany = async (input: CreateAiCompanyInput) => {
  return AiCompanyModel.create({
    name: input.name.trim(),
    logo: input.logo.trim(),
    slug: slugifyCompanyName(input.name),
  })
}

export const getAiCompanyById = async (id: string) => {
  return AiCompanyModel.findById(id).lean()
}

export const getAiCompanies = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [companies, total] = await Promise.all([
    AiCompanyModel.find(match).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    AiCompanyModel.countDocuments(match),
  ])
  return {
    companies,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const updateAiCompany = async (id: string, updates: UpdateAiCompanyInput) => {
  const $set: Record<string, unknown> = {}
  if (updates.name !== undefined) {
    $set.name = updates.name.trim()
    $set.slug = slugifyCompanyName(updates.name)
  }
  if (updates.logo !== undefined) $set.logo = updates.logo.trim()
  if (Object.keys($set).length === 0) {
    return AiCompanyModel.findById(id)
  }
  return AiCompanyModel.findByIdAndUpdate(id, { $set }, { new: true })
}

export const deleteAiCompany = async (id: string) => {
  return AiCompanyModel.findByIdAndDelete(id)
}
