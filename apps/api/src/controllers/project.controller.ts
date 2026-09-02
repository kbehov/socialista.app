import type { AppContext } from '@/middlewares/auth.middleware.js'
import {
  assertHasUpdates,
  optionalTrimmedString,
  parseParamId,
  requireTrimmedString,
  withQueryParam,
} from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { getProjectAsMember, getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  ProjectStatus,
  assertValidTimezone,
  countProjectsByWorkspace,
  createProject as createProjectInDb,
  deleteProject as deleteProjectInDb,
  listWorkspaceProjects,
  updateProject as updateProjectInDb,
  type IProject,
  type UpdateProjectInput,
} from '@socialista/db'
import type { CreateProjectPayload, ProjectResponse } from '@socialista/types'
import type { Context } from 'hono'

const FALLBACK_PROJECT_TIMEZONE = 'UTC'

function parseProjectTimezone(value: unknown, label = 'Timezone'): string {
  const timezone = typeof value === 'string' ? value.trim() : ''
  if (!timezone) {
    throw new HttpError(400, `${label} is required`)
  }
  try {
    return assertValidTimezone(timezone)
  } catch {
    throw new HttpError(400, 'Valid IANA timezone is required')
  }
}

function serializeProject(project: IProject): ProjectResponse {
  const id = project._id.toString()
  return {
    id,
    _id: id,
    workspaceId: project.workspace.toString(),
    name: project.name,
    description: project.description,
    color: project.color,
    icon: project.icon,
    timezone: project.timezone || FALLBACK_PROJECT_TIMEZONE,
    status: project.status,
    isDefault: project.isDefault,
    createdBy: project.createdBy.toString(),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

function parseOptionalProjectStatus(value: unknown): ProjectStatus | undefined {
  if (value === undefined) return undefined
  if (value === ProjectStatus.ACTIVE || value === ProjectStatus.ARCHIVED) return value
  throw new HttpError(400, 'Invalid project status')
}

function parseCreateProjectInput(
  body: Record<string, unknown>,
  fallbackTimezone: string,
): CreateProjectPayload {
  const workspaceId = parseParamId(
    typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
    'workspace ID',
  )
  const timezone =
    typeof body.timezone === 'string' && body.timezone.trim()
      ? parseProjectTimezone(body.timezone)
      : parseProjectTimezone(fallbackTimezone, 'Timezone')

  return {
    workspaceId,
    name: requireTrimmedString(body.name, 'Project name'),
    timezone,
    description: optionalTrimmedString(body.description),
    color: optionalTrimmedString(body.color),
    icon: optionalTrimmedString(body.icon),
  }
}

function parseUpdateProjectInput(body: Record<string, unknown>): UpdateProjectInput {
  const updates: UpdateProjectInput = {}

  if (body.name !== undefined) {
    updates.name = requireTrimmedString(body.name, 'Project name')
  }
  if (body.description !== undefined) {
    updates.description = body.description === null ? null : (optionalTrimmedString(body.description) ?? null)
  }
  if (body.color !== undefined) {
    updates.color = body.color === null ? null : (optionalTrimmedString(body.color) ?? null)
  }
  if (body.icon !== undefined) {
    updates.icon = body.icon === null ? null : (optionalTrimmedString(body.icon) ?? null)
  }
  if (body.timezone !== undefined) {
    updates.timezone = parseProjectTimezone(body.timezone)
  }
  if (body.status !== undefined) {
    updates.status = parseOptionalProjectStatus(body.status)
  }

  assertHasUpdates(updates)
  return updates
}

export const getWorkspaceProjects = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await listWorkspaceProjects(workspaceId, withQueryParam(c.req.url, 'workspace', workspaceId))
  return successResponse(
    c,
    200,
    { projects: data.projects.map(project => serializeProject(project as IProject)) },
    data.meta,
  )
}

export const createProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const body = (await c.req.json()) as Record<string, unknown>
  const workspaceId = parseParamId(
    typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
    'workspace ID',
  )
  const workspace = await getWorkspaceAsMember(workspaceId, userId)
  const input = parseCreateProjectInput(body, workspace.settings.timezone)

  const project = await createProjectInDb({
    workspace: input.workspaceId,
    name: input.name,
    createdBy: userId,
    timezone: input.timezone ?? workspace.settings.timezone,
    description: input.description,
    color: input.color,
    icon: input.icon,
  })

  return successResponse(c, 201, { project: serializeProject(project.toObject()) })
}

export const getProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const project = await getProjectAsMember(id, userId)
  return successResponse(c, 200, { project: serializeProject(project) })
}

export const updateProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const input = parseUpdateProjectInput((await c.req.json()) as Record<string, unknown>)
  await getProjectAsMember(id, userId)

  const project = await updateProjectInDb(id, input)
  if (!project) {
    throw new HttpError(404, 'Project not found')
  }

  return successResponse(c, 200, { project: serializeProject(project.toObject()) })
}

export const deleteProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const project = await getProjectAsMember(id, userId)

  if (project.isDefault) {
    throw new HttpError(400, 'Cannot delete the default project')
  }

  const count = await countProjectsByWorkspace(project.workspace.toString())
  if (count <= 1) {
    throw new HttpError(400, 'Cannot delete the last project in a workspace')
  }

  const deleted = await deleteProjectInDb(id)
  if (!deleted) {
    throw new HttpError(404, 'Project not found')
  }

  return successResponse(c, 200, { id, workspaceId: project.workspace.toString() })
}
