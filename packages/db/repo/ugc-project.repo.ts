import { UgcProjectModel } from '../models/ugc-project.model.js'
import type { IUgcClip, IUgcProject } from '../types/ugc-project.types.js'
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

export const updateUgcClip = async (
  projectId: string,
  clipId: string,
  clipUpdates: Partial<IUgcClip>,
  projectUpdates?: Partial<
    Pick<IUgcProject, 'status' | 'error' | 'stillsRunId' | 'videoRunId' | 'assembledVideoUrl' | 'assembledRunId'>
  >,
) => {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}

  for (const [key, value] of Object.entries(clipUpdates)) {
    const path = `clips.$[clip].${key}`
    if (value === undefined) $unset[path] = 1
    else $set[path] = value
  }

  if (projectUpdates) {
    for (const [key, value] of Object.entries(projectUpdates)) {
      if (value === undefined) $unset[key] = 1
      else $set[key] = value
    }
  }

  const ops: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) ops.$set = $set
  if (Object.keys($unset).length > 0) ops.$unset = $unset
  if (Object.keys(ops).length === 0) {
    return getUgcProjectById(projectId)
  }

  return await UgcProjectModel.findOneAndUpdate({ _id: projectId, 'clips.id': clipId }, ops, {
    new: true,
    arrayFilters: [{ 'clip.id': clipId }],
  }).lean()
}

export const addUgcClip = async (projectId: string, clip: IUgcClip) => {
  return await UgcProjectModel.findByIdAndUpdate(projectId, { $push: { clips: clip } }, { new: true }).lean()
}

export const removeUgcClip = async (projectId: string, clipId: string) => {
  return await UgcProjectModel.findByIdAndUpdate(
    projectId,
    { $pull: { clips: { id: clipId } } },
    { new: true },
  ).lean()
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
