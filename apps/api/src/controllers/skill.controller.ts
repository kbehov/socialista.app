import type { AppContext } from '@/middlewares/auth.middleware.js'
import {
  withQueryParam,
  parseParamId,
  optionalTrimmedString,
  requireTrimmedString,
  assertHasUpdates,
} from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  createSkill as createSkillInDb,
  deleteSkill as deleteSkillInDb,
  getSkillById,
  listWorkspaceSkills,
  skillSlugExists,
  updateSkill as updateSkillInDb,
  type ISkill,
} from '@socialista/db'
import {
  PROMPT_KEY_VALUES,
  type CreateSkillPayload,
  type PromptKey,
  type Skill,
  type UpdateSkillPayload,
} from '@socialista/types'
import type { Context } from 'hono'

function serializeSkill(skill: ISkill): Skill {
  return {
    _id: skill._id.toString(),
    workspaceId: skill.workspaceId.toString(),
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    ...(skill.icon ? { icon: skill.icon } : {}),
    target: skill.target,
    content: skill.content,
    usageCount: skill.usageCount,
    ...(skill.createdBy ? { createdBy: skill.createdBy.toString() } : {}),
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  }
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || 'skill'
}

async function uniqueWorkspaceSlug(workspaceId: string, base: string, exceptId?: string): Promise<string> {
  let slug = slugify(base)
  let n = 2
  while (await skillSlugExists(workspaceId, slug, exceptId)) {
    slug = `${slugify(base).slice(0, 70)}-${n}`
    n += 1
  }
  return slug
}

function isPromptKey(value: unknown): value is PromptKey {
  return typeof value === 'string' && (PROMPT_KEY_VALUES as readonly string[]).includes(value)
}

function parseCreateSkillInput(body: Record<string, unknown>): CreateSkillPayload {
  const workspaceId = parseParamId(
    typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
    'workspace ID',
  )
  const name = requireTrimmedString(body.name, 'Skill name')
  const content = requireTrimmedString(body.content, 'Skill content')
  if (!isPromptKey(body.target)) {
    throw new HttpError(400, 'Invalid skill target')
  }
  return {
    workspaceId,
    name,
    content,
    target: body.target,
    ...(optionalTrimmedString(body.slug) ? { slug: optionalTrimmedString(body.slug) } : {}),
    ...(optionalTrimmedString(body.description) ? { description: optionalTrimmedString(body.description) } : {}),
    ...(optionalTrimmedString(body.icon) ? { icon: optionalTrimmedString(body.icon) } : {}),
  }
}

function parseUpdateSkillInput(body: Record<string, unknown>): UpdateSkillPayload {
  const updates: UpdateSkillPayload = {}
  const name = optionalTrimmedString(body.name)
  if (body.name !== undefined) {
    if (!name) throw new HttpError(400, 'Skill name cannot be empty')
    updates.name = name
  }
  const slug = optionalTrimmedString(body.slug)
  if (body.slug !== undefined) {
    if (!slug) throw new HttpError(400, 'Skill slug cannot be empty')
    updates.slug = slug
  }
  if (body.description !== undefined) {
    updates.description = typeof body.description === 'string' ? body.description.trim() : ''
  }
  if (body.icon === null) {
    updates.icon = null
  } else if (body.icon !== undefined) {
    updates.icon = optionalTrimmedString(body.icon) ?? null
  }
  if (body.target !== undefined) {
    if (!isPromptKey(body.target)) throw new HttpError(400, 'Invalid skill target')
    updates.target = body.target
  }
  const content = optionalTrimmedString(body.content)
  if (body.content !== undefined) {
    if (!content) throw new HttpError(400, 'Skill content cannot be empty')
    updates.content = content
  }
  assertHasUpdates(updates)
  return updates
}

async function getSkillForMember(id: string, userId: string) {
  const skill = await getSkillById(id)
  if (!skill) throw new HttpError(404, 'Skill not found')
  await getWorkspaceAsMember(skill.workspaceId.toString(), userId)
  return skill
}

export const getWorkspaceSkills = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)
  const query = withQueryParam(c.req.url, 'workspaceId', workspaceId)
  const data = await listWorkspaceSkills(workspaceId, query)
  return successResponse(
    c,
    200,
    { skills: data.skills.map(skill => serializeSkill(skill as ISkill)) },
    data.meta,
  )
}

export const getSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'skill ID')
  const skill = await getSkillForMember(id, userId)
  return successResponse(c, 200, { skill: serializeSkill(skill) })
}

export const createSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const body = (await c.req.json()) as Record<string, unknown>
  const input = parseCreateSkillInput(body)
  await getWorkspaceAsMember(input.workspaceId, userId)
  const slug = await uniqueWorkspaceSlug(input.workspaceId, input.slug ?? input.name)
  const skill = await createSkillInDb({
    workspaceId: input.workspaceId,
    slug,
    name: input.name,
    description: input.description ?? '',
    icon: input.icon,
    target: input.target,
    content: input.content,
    createdBy: userId,
  })
  return successResponse(c, 201, { skill: serializeSkill(skill) })
}

export const updateSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'skill ID')
  const body = (await c.req.json()) as Record<string, unknown>
  const input = parseUpdateSkillInput(body)
  const existing = await getSkillForMember(id, userId)
  const workspaceId = existing.workspaceId.toString()
  const slug = input.slug
    ? await uniqueWorkspaceSlug(workspaceId, input.slug, id)
    : undefined
  const skill = await updateSkillInDb(id, {
    ...input,
    ...(slug ? { slug } : {}),
  })
  if (!skill) throw new HttpError(404, 'Skill not found')
  return successResponse(c, 200, { skill: serializeSkill(skill) })
}

export const deleteSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'skill ID')
  await getSkillForMember(id, userId)
  await deleteSkillInDb(id)
  return successResponse(c, 200, { deleted: true })
}
