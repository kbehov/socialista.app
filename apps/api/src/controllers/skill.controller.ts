import type { AppContext } from '@/middlewares/auth.middleware.js'
import { withQueryParam, parseParamId, optionalTrimmedString, requireTrimmedString } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  createSkill as createSkillInDb,
  deleteSkill as deleteSkillInDb,
  findDefaultSkill,
  forkSkill as forkSkillInDb,
  getSkillById,
  getSkillBySlug,
  getSkillCategoryById,
  incrementSkillUsage,
  listWorkspaceSkills,
  SkillBinding as DbSkillBinding,
  SkillCategoryStatus,
  SkillSource,
  SkillStatus,
  SkillVariableType,
  SkillVisibility,
  updateSkill as updateSkillInDb,
  type ISkill,
  type ISkillCategory,
  type ISkillVariable,
} from '@socialista/db'
import { getSystemSkillBySlot, renderSkillContent } from '@socialista/ai'
import {
  SKILL_BINDING_VALUES,
  SKILL_SLOT_VALUES,
  SKILL_STATUSES,
  SKILL_VISIBILITIES,
  type CreateSkillPayload,
  type ForkSkillPayload,
  type Skill,
  type SkillBinding,
  type SkillCategorySummary,
  type SkillModelConfig,
  type SkillSlot,
  type SkillVariable,
  type SkillVariableValue,
  type UpdateSkillPayload,
} from '@socialista/types'
import type { Context } from 'hono'

function isPopulatedCategory(value: unknown): value is {
  _id: { toString(): string }
  slug: string
  name: string
  icon?: string
} {
  return Boolean(
    value &&
      typeof value === 'object' &&
      '_id' in value &&
      'slug' in value &&
      'name' in value,
  )
}

function serializeSkill(skill: ISkill): Skill {
  const populated = isPopulatedCategory(skill.categoryId) ? skill.categoryId : null
  const categoryId = populated ? populated._id.toString() : skill.categoryId.toString()
  const category: SkillCategorySummary | undefined = populated
    ? {
        _id: populated._id.toString(),
        slug: populated.slug,
        name: populated.name,
        ...(populated.icon ? { icon: populated.icon } : {}),
      }
    : undefined

  return {
    _id: skill._id.toString(),
    workspaceId: skill.workspaceId ? skill.workspaceId.toString() : null,
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    categoryId,
    ...(category ? { category } : {}),
    binding: skill.binding as SkillBinding,
    ...(skill.slot ? { slot: skill.slot as SkillSlot } : {}),
    ...(skill.icon ? { icon: skill.icon } : {}),
    content: skill.content,
    variables: (skill.variables ?? []).map(serializeVariable),
    ...(skill.outputSchema ? { outputSchema: skill.outputSchema } : {}),
    ...(skill.toolBindings ? { toolBindings: skill.toolBindings } : {}),
    ...(skill.modelConfig ? { modelConfig: serializeModelConfig(skill.modelConfig) } : {}),
    source: skill.source,
    ...(skill.forkedFrom ? { forkedFrom: skill.forkedFrom.toString() } : {}),
    visibility: skill.visibility,
    status: skill.status,
    version: skill.version,
    usageCount: skill.usageCount,
    ...(skill.createdBy ? { createdBy: skill.createdBy.toString() } : {}),
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  }
}

function serializeVariable(variable: ISkillVariable): SkillVariable {
  return {
    key: variable.key,
    label: variable.label,
    ...(variable.description ? { description: variable.description } : {}),
    type: variable.type,
    required: variable.required,
    ...(variable.defaultValue !== undefined ? { defaultValue: variable.defaultValue } : {}),
    ...(variable.options ? { options: variable.options } : {}),
  }
}

function serializeModelConfig(config: NonNullable<ISkill['modelConfig']>): SkillModelConfig {
  return {
    ...(config.model ? { model: config.model } : {}),
    ...(config.temperature !== undefined ? { temperature: config.temperature } : {}),
    ...(config.maxTokens !== undefined ? { maxTokens: config.maxTokens } : {}),
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

async function uniqueWorkspaceSlug(workspaceId: string, base: string): Promise<string> {
  let slug = slugify(base)
  let n = 2
  while (await getSkillBySlug(slug, workspaceId)) {
    slug = `${slugify(base).slice(0, 70)}-${n}`
    n += 1
  }
  return slug
}

function isSkillBinding(value: unknown): value is SkillBinding {
  return typeof value === 'string' && (SKILL_BINDING_VALUES as readonly string[]).includes(value)
}

function isSkillSlot(value: unknown): value is SkillSlot {
  return typeof value === 'string' && (SKILL_SLOT_VALUES as readonly string[]).includes(value)
}

async function getReadableCategory(id: string, workspaceId: string): Promise<ISkillCategory> {
  const category = await getSkillCategoryById(id)
  if (!category) throw new HttpError(404, 'Category not found')
  if (category.status === SkillCategoryStatus.ARCHIVED) {
    throw new HttpError(400, 'Category is archived')
  }
  if (category.source === SkillSource.SYSTEM || category.workspaceId === null) {
    return category
  }
  if (category.workspaceId.toString() !== workspaceId) {
    throw new HttpError(403, 'Category does not belong to this workspace')
  }
  return category
}

function parseVariables(value: unknown): SkillVariable[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) {
    throw new HttpError(400, 'variables must be an array')
  }
  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new HttpError(400, `variables[${index}] must be an object`)
    }
    const record = item as Record<string, unknown>
    const key = requireTrimmedString(record.key, `variables[${index}].key`)
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
      throw new HttpError(400, `variables[${index}].key must be a valid identifier`)
    }
    const typeRaw = typeof record.type === 'string' ? record.type : SkillVariableType.TEXT
    if (!Object.values(SkillVariableType).includes(typeRaw as SkillVariableType)) {
      throw new HttpError(400, `variables[${index}].type is invalid`)
    }
    return {
      key,
      label: requireTrimmedString(record.label ?? key, `variables[${index}].label`),
      description: optionalTrimmedString(record.description),
      type: typeRaw as SkillVariable['type'],
      required: record.required === true,
      defaultValue:
        typeof record.defaultValue === 'string' ||
        typeof record.defaultValue === 'number' ||
        typeof record.defaultValue === 'boolean'
          ? record.defaultValue
          : undefined,
      options: Array.isArray(record.options)
        ? record.options.filter((option): option is string => typeof option === 'string')
        : undefined,
    }
  })
}

function parseModelConfig(value: unknown): SkillModelConfig | undefined | null {
  if (value === undefined) return undefined
  if (value === null) return null
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'modelConfig must be an object')
  }
  const record = value as Record<string, unknown>
  const config: SkillModelConfig = {}
  if (typeof record.model === 'string' && record.model.trim()) config.model = record.model.trim()
  if (typeof record.temperature === 'number' && Number.isFinite(record.temperature)) {
    config.temperature = record.temperature
  }
  if (typeof record.maxTokens === 'number' && Number.isFinite(record.maxTokens)) {
    config.maxTokens = Math.round(record.maxTokens)
  }
  return config
}

function parseCreateSkillInput(body: Record<string, unknown>): CreateSkillPayload {
  const workspaceId = parseParamId(
    typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
    'workspace ID',
  )
  const name = requireTrimmedString(body.name, 'Skill name')
  const content = requireTrimmedString(body.content, 'Skill content')
  const categoryId = parseParamId(
    typeof body.categoryId === 'string' ? body.categoryId : undefined,
    'category ID',
  )
  if (!isSkillBinding(body.binding)) {
    throw new HttpError(400, 'Valid skill binding is required (image, video, or text)')
  }
  if (body.slot !== undefined && body.slot !== null && !isSkillSlot(body.slot)) {
    throw new HttpError(400, 'Invalid skill slot')
  }
  const visibility =
    typeof body.visibility === 'string' && (SKILL_VISIBILITIES as readonly string[]).includes(body.visibility)
      ? (body.visibility as CreateSkillPayload['visibility'])
      : 'workspace'
  const status =
    typeof body.status === 'string' && (SKILL_STATUSES as readonly string[]).includes(body.status)
      ? (body.status as CreateSkillPayload['status'])
      : 'draft'

  return {
    workspaceId,
    name,
    slug: optionalTrimmedString(body.slug),
    description: optionalTrimmedString(body.description) ?? '',
    categoryId,
    binding: body.binding,
    slot: isSkillSlot(body.slot) ? body.slot : undefined,
    icon: optionalTrimmedString(body.icon),
    content,
    variables: parseVariables(body.variables),
    outputSchema:
      body.outputSchema && typeof body.outputSchema === 'object' && !Array.isArray(body.outputSchema)
        ? (body.outputSchema as Record<string, unknown>)
        : undefined,
    toolBindings: Array.isArray(body.toolBindings)
      ? body.toolBindings.filter((item): item is string => typeof item === 'string')
      : undefined,
    modelConfig: parseModelConfig(body.modelConfig) ?? undefined,
    visibility,
    status,
  }
}

function parseUpdateSkillInput(body: Record<string, unknown>): UpdateSkillPayload {
  const updates: UpdateSkillPayload = {}

  if (typeof body.name === 'string') {
    updates.name = requireTrimmedString(body.name, 'Skill name')
  }
  if (typeof body.slug === 'string') {
    updates.slug = slugify(requireTrimmedString(body.slug, 'Skill slug'))
  }
  if (typeof body.description === 'string') {
    updates.description = body.description.trim()
  }
  if (body.categoryId !== undefined) {
    updates.categoryId = parseParamId(
      typeof body.categoryId === 'string' ? body.categoryId : undefined,
      'category ID',
    )
  }
  if (body.icon === null) updates.icon = null
  else if (typeof body.icon === 'string') updates.icon = body.icon.trim()

  if (body.binding !== undefined) {
    if (!isSkillBinding(body.binding)) throw new HttpError(400, 'Invalid skill binding')
    updates.binding = body.binding
  }
  if (body.slot === null) updates.slot = null
  else if (body.slot !== undefined) {
    if (!isSkillSlot(body.slot)) throw new HttpError(400, 'Invalid skill slot')
    updates.slot = body.slot
  }

  if (typeof body.content === 'string') {
    updates.content = requireTrimmedString(body.content, 'Skill content')
  }
  if (body.variables !== undefined) updates.variables = parseVariables(body.variables)
  if (body.outputSchema === null) updates.outputSchema = null
  else if (body.outputSchema && typeof body.outputSchema === 'object' && !Array.isArray(body.outputSchema)) {
    updates.outputSchema = body.outputSchema as Record<string, unknown>
  }
  if (body.toolBindings === null) updates.toolBindings = null
  else if (Array.isArray(body.toolBindings)) {
    updates.toolBindings = body.toolBindings.filter((item): item is string => typeof item === 'string')
  }
  if (body.modelConfig !== undefined) {
    updates.modelConfig = parseModelConfig(body.modelConfig)
  }
  if (typeof body.visibility === 'string') {
    if (!(SKILL_VISIBILITIES as readonly string[]).includes(body.visibility)) {
      throw new HttpError(400, 'Invalid visibility')
    }
    updates.visibility = body.visibility as UpdateSkillPayload['visibility']
  }
  if (typeof body.status === 'string') {
    if (!(SKILL_STATUSES as readonly string[]).includes(body.status)) {
      throw new HttpError(400, 'Invalid status')
    }
    updates.status = body.status as UpdateSkillPayload['status']
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }
  return updates
}

function parseForkSkillInput(body: Record<string, unknown>): ForkSkillPayload {
  return {
    workspaceId: parseParamId(
      typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
      'workspace ID',
    ),
    name: optionalTrimmedString(body.name),
    slug: optionalTrimmedString(body.slug),
  }
}

async function getReadableSkill(id: string, userId: string): Promise<ISkill> {
  const skill = await getSkillById(id)
  if (!skill) throw new HttpError(404, 'Skill not found')

  if (skill.source === SkillSource.SYSTEM || skill.workspaceId === null) {
    return skill
  }
  await getWorkspaceAsMember(skill.workspaceId.toString(), userId)
  return skill
}

async function getMutableSkill(id: string, userId: string): Promise<ISkill> {
  const skill = await getReadableSkill(id, userId)
  if (skill.source === SkillSource.SYSTEM || skill.workspaceId === null) {
    throw new HttpError(403, 'System skills cannot be modified')
  }
  return skill
}

function parseResolveVariables(raw: string | undefined): Record<string, SkillVariableValue> | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new HttpError(400, 'variables must be a JSON object')
    }
    const result: Record<string, SkillVariableValue> = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        result[key] = value
      }
    }
    return result
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(400, 'variables must be valid JSON')
  }
}

export const createSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = parseCreateSkillInput((await c.req.json()) as Record<string, unknown>)
  await getWorkspaceAsMember(input.workspaceId, userId)

  const slug = await uniqueWorkspaceSlug(input.workspaceId, input.slug || input.name)
  await getReadableCategory(input.categoryId, input.workspaceId)

  const skill = await createSkillInDb({
    workspaceId: input.workspaceId,
    slug,
    name: input.name,
    description: input.description ?? '',
    categoryId: input.categoryId,
    binding: input.binding as DbSkillBinding,
    slot: input.slot,
    icon: input.icon,
    content: input.content,
    variables: input.variables as ISkillVariable[] | undefined,
    outputSchema: input.outputSchema,
    toolBindings: input.toolBindings,
    modelConfig: input.modelConfig,
    source: SkillSource.USER,
    visibility: (input.visibility as SkillVisibility | undefined) ?? SkillVisibility.WORKSPACE,
    status: (input.status as SkillStatus | undefined) ?? SkillStatus.DRAFT,
    createdBy: userId,
  })

  return successResponse(c, 201, { skill: serializeSkill(skill.toObject()) })
}

export const getWorkspaceSkills = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await listWorkspaceSkills(workspaceId, withQueryParam(c.req.url, 'workspaceId', workspaceId))
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
  const skill = await getReadableSkill(id, userId)
  return successResponse(c, 200, { skill: serializeSkill(skill) })
}

export const updateSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'skill ID')
  const input = parseUpdateSkillInput((await c.req.json()) as Record<string, unknown>)
  const existing = await getMutableSkill(id, userId)

  if (input.slug && input.slug !== existing.slug) {
    const collision = await getSkillBySlug(input.slug, existing.workspaceId!.toString())
    if (collision && collision._id.toString() !== id) {
      throw new HttpError(409, 'A skill with this slug already exists in the workspace')
    }
  }

  const nextVersion =
    input.content !== undefined || input.variables !== undefined || input.modelConfig !== undefined
      ? existing.version + 1
      : existing.version

  if (input.categoryId) {
    await getReadableCategory(input.categoryId, existing.workspaceId!.toString())
  }

  const skill = await updateSkillInDb(id, {
    slug: input.slug,
    name: input.name,
    description: input.description,
    categoryId: input.categoryId,
    binding: input.binding as DbSkillBinding | undefined,
    slot: input.slot,
    icon: input.icon,
    content: input.content,
    variables: input.variables as ISkillVariable[] | undefined,
    outputSchema: input.outputSchema,
    toolBindings: input.toolBindings,
    modelConfig: input.modelConfig,
    visibility: input.visibility as SkillVisibility | undefined,
    status: input.status as SkillStatus | undefined,
    version: nextVersion,
  })
  if (!skill) throw new HttpError(404, 'Skill not found')

  return successResponse(c, 200, { skill: serializeSkill(skill.toObject()) })
}

export const deleteSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'skill ID')
  await getMutableSkill(id, userId)

  const deleted = await deleteSkillInDb(id)
  if (!deleted) throw new HttpError(404, 'Skill not found')

  return successResponse(c, 200, { id })
}

export const forkSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'skill ID')
  const input = parseForkSkillInput((await c.req.json()) as Record<string, unknown>)
  await getWorkspaceAsMember(input.workspaceId, userId)

  const source = await getSkillById(id)
  if (!source) throw new HttpError(404, 'Skill not found')
  if (source.source !== SkillSource.SYSTEM && source.visibility === SkillVisibility.PRIVATE) {
    if (!source.workspaceId || source.workspaceId.toString() !== input.workspaceId) {
      throw new HttpError(403, 'This skill cannot be forked')
    }
  }

  const slug = await uniqueWorkspaceSlug(input.workspaceId, input.slug || source.slug)
  const skill = await forkSkillInDb({
    source,
    workspaceId: input.workspaceId,
    createdBy: userId,
    name: input.name,
    slug,
  })

  return successResponse(c, 201, { skill: serializeSkill(skill.toObject()) })
}

export const publishSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'skill ID')
  await getMutableSkill(id, userId)
  const skill = await updateSkillInDb(id, { status: SkillStatus.PUBLISHED })
  if (!skill) throw new HttpError(404, 'Skill not found')
  return successResponse(c, 200, { skill: serializeSkill(skill.toObject()) })
}

export const archiveSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'skill ID')
  await getMutableSkill(id, userId)
  const skill = await updateSkillInDb(id, { status: SkillStatus.ARCHIVED })
  if (!skill) throw new HttpError(404, 'Skill not found')
  return successResponse(c, 200, { skill: serializeSkill(skill.toObject()) })
}

export const resolveSkill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.query('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const skillIdRaw = c.req.query('skillId')
  const slotRaw = c.req.query('slot')
  const variables = parseResolveVariables(c.req.query('variables'))

  if (!skillIdRaw && !slotRaw) {
    throw new HttpError(400, 'skillId or slot is required')
  }
  if (slotRaw && !isSkillSlot(slotRaw)) {
    throw new HttpError(400, 'Invalid skill slot')
  }

  const slot = isSkillSlot(slotRaw) ? slotRaw : undefined

  let skill: ISkill | null = null
  if (skillIdRaw) {
    skill = await getReadableSkill(parseParamId(skillIdRaw, 'skill ID'), userId)
  } else if (slot) {
    skill = await findDefaultSkill(slot, workspaceId)
  }

  if (skill) {
    const content = renderSkillContent(skill.content, skill.variables ?? [], variables)
    await incrementSkillUsage(skill._id.toString())
    return successResponse(c, 200, {
      skillId: skill._id.toString(),
      slug: skill.slug,
      binding: skill.binding,
      slot: skill.slot,
      content,
      modelConfig: skill.modelConfig ? serializeModelConfig(skill.modelConfig) : undefined,
      source: skill.source,
    })
  }

  const fallback = slot ? getSystemSkillBySlot(slot) : undefined
  if (!fallback) {
    throw new HttpError(404, 'Skill not found')
  }

  return successResponse(c, 200, {
    slug: fallback.slug,
    binding: fallback.binding,
    slot: fallback.slot,
    content: renderSkillContent(fallback.content, fallback.variables ?? [], variables),
    modelConfig: fallback.modelConfig,
    source: 'fallback' as const,
  })
}
