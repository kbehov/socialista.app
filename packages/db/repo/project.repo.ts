import { ProjectModel } from '../models/project.model.js'
import {
  ProjectStatus,
  type CreateProjectInput,
  type IProject,
  type ProjectDocument,
  type UpdateProjectInput,
} from '../types/project.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'
import { assertValidTimezone } from '../utils/timezone.js'

function mapCreateFields(input: CreateProjectInput): Partial<IProject> {
  return {
    workspace: toObjectId(input.workspace),
    name: input.name,
    description: input.description,
    color: input.color,
    icon: input.icon,
    timezone: assertValidTimezone(input.timezone),
    status: input.status ?? ProjectStatus.ACTIVE,
    isDefault: input.isDefault ?? false,
    createdBy: toObjectId(input.createdBy),
  }
}

function mapUpdateFields(updates: UpdateProjectInput): Record<string, unknown> {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}

  if (updates.name !== undefined) $set.name = updates.name
  if (updates.status !== undefined) $set.status = updates.status
  if (updates.timezone !== undefined) $set.timezone = assertValidTimezone(updates.timezone)

  if (updates.description === null) $unset.description = 1
  else if (updates.description !== undefined) $set.description = updates.description

  if (updates.color === null) $unset.color = 1
  else if (updates.color !== undefined) $set.color = updates.color

  if (updates.icon === null) $unset.icon = 1
  else if (updates.icon !== undefined) $set.icon = updates.icon

  const ops: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) ops.$set = $set
  if (Object.keys($unset).length > 0) ops.$unset = $unset
  return ops
}

export const createProject = async (input: CreateProjectInput): Promise<ProjectDocument> => {
  return ProjectModel.create(mapCreateFields(input))
}

export const getProjectById = async (id: string): Promise<IProject | null> => {
  return ProjectModel.findById(id).lean()
}

export const getDefaultWorkspaceProject = async (workspaceId: string): Promise<IProject | null> => {
  return ProjectModel.findOne({
    workspace: toObjectId(workspaceId),
    isDefault: true,
  }).lean()
}

export const listWorkspaceProjects = async (workspaceId: string, query = '') => {
  const { match, pagination, sort } = buildFilters(query)
  const rest = { ...match }
  delete rest.workspace
  const filter = { ...rest, workspace: toObjectId(workspaceId) }

  const [projects, total] = await Promise.all([
    ProjectModel.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    ProjectModel.countDocuments(filter),
  ])
  return {
    projects,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const updateProject = async (id: string, updates: UpdateProjectInput): Promise<ProjectDocument | null> => {
  const ops = mapUpdateFields(updates)
  if (Object.keys(ops).length === 0) {
    return ProjectModel.findById(id)
  }
  return ProjectModel.findByIdAndUpdate(id, ops, { new: true })
}

export const deleteProject = async (id: string): Promise<boolean> => {
  const deleted = await ProjectModel.findByIdAndDelete(id)
  return Boolean(deleted)
}

export const countProjectsByWorkspace = async (workspaceId: string): Promise<number> => {
  return ProjectModel.countDocuments({ workspace: toObjectId(workspaceId) })
}
