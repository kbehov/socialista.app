import { UgcProjectModel } from '../models/ugc-project.model.js'
import type { IUgcProject } from '../types/ugc-project.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'

export const createUgcProject = async (project: Partial<IUgcProject>) => {
  return await UgcProjectModel.create(project)
}

export const getUgcProjectById = async (id: string) => {
  return await UgcProjectModel.findById(id).lean()
}

export const updateUgcProject = async (id: string, updates: Partial<IUgcProject>) => {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) $unset[key] = 1
    else $set[key] = value
  }
  const ops: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) ops.$set = $set
  if (Object.keys($unset).length > 0) ops.$unset = $unset
  if (Object.keys(ops).length === 0) {
    return getUgcProjectById(id)
  }
  return await UgcProjectModel.findByIdAndUpdate(id, ops, { new: true }).lean()
}

export const deleteUgcProject = async (id: string) => {
  return await UgcProjectModel.findByIdAndDelete(id).lean()
}

export const getUgcProjects = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [projects, total] = await Promise.all([
    UgcProjectModel.find(match).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    UgcProjectModel.countDocuments(match),
  ])
  return {
    projects,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}
