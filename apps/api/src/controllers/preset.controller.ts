import type { AppContext } from '@/middlewares/auth.middleware.js'
import {
  assertHasUpdates,
  getQueryString,
  parseParamId,
  requireTrimmedString,
} from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  createPreset as createPresetInDb,
  deletePreset as deletePresetInDb,
  getPresetById,
  listPresets,
  updatePreset as updatePresetInDb,
  type IPreset,
} from '@socialista/db'
import {
  isPresetKind,
  PRESET_ATTACHMENT_MAX,
  PRESET_DESCRIPTION_MAX_LENGTH,
  PRESET_NAME_MAX_LENGTH,
  PRESET_PROMPT_MAX_LENGTH,
  type CreatePresetPayload,
  type Preset,
  type PresetAttachment,
  type UpdatePresetPayload,
} from '@socialista/types'
import type { Context } from 'hono'

function serializePreset(preset: IPreset): Preset {
  return {
    _id: preset._id.toString(),
    kind: preset.kind,
    name: preset.name,
    description: preset.description,
    prompt: preset.prompt,
    image: preset.image,
    attachments: preset.attachments ?? [],
    active: preset.active,
    sortOrder: preset.sortOrder,
    createdAt: preset.createdAt,
    updatedAt: preset.updatedAt,
  }
}

function parseUrl(value: unknown, label: string): string {
  const url = requireTrimmedString(value, label)
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('invalid protocol')
    }
    return url
  } catch {
    throw new HttpError(400, `${label} must be a valid HTTP(S) URL`)
  }
}

function parseAttachments(value: unknown, { required }: { required: boolean }): PresetAttachment[] {
  if (value === undefined || value === null) {
    if (required) {
      throw new HttpError(400, 'Attachments are required')
    }
    return []
  }

  if (!Array.isArray(value)) {
    throw new HttpError(400, 'Attachments must be an array')
  }

  if (value.length > PRESET_ATTACHMENT_MAX) {
    throw new HttpError(400, `Attachments cannot exceed ${PRESET_ATTACHMENT_MAX}`)
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new HttpError(400, `Attachment ${index + 1} is invalid`)
    }
    const record = item as Record<string, unknown>
    const attachment: PresetAttachment = {
      url: parseUrl(record.url, `Attachment ${index + 1} URL`),
    }
    const name = typeof record.name === 'string' ? record.name.trim() : ''
    if (name) attachment.name = name
    return attachment
  })
}

function parseBoundedString(value: unknown, label: string, maxLength: number): string {
  const text = requireTrimmedString(value, label)
  if (text.length > maxLength) {
    throw new HttpError(400, `${label} must be ${maxLength} characters or less`)
  }
  return text
}

function parseSortOrder(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined
  const sortOrder = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isInteger(sortOrder)) {
    throw new HttpError(400, 'Sort order must be an integer')
  }
  return sortOrder
}

function parseActive(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  throw new HttpError(400, 'Active must be a boolean')
}

function parseKind(value: unknown, { required }: { required: boolean }) {
  if (value === undefined || value === null) {
    if (required) {
      throw new HttpError(400, 'Preset kind is required')
    }
    return undefined
  }
  if (!isPresetKind(value)) {
    throw new HttpError(400, 'Invalid preset kind')
  }
  return value
}

function parseCreatePresetInput(body: Record<string, unknown>): CreatePresetPayload {
  const kind = parseKind(body.kind, { required: true })
  if (!kind) {
    throw new HttpError(400, 'Preset kind is required')
  }

  return {
    kind,
    name: parseBoundedString(body.name, 'Preset name', PRESET_NAME_MAX_LENGTH),
    description: parseBoundedString(body.description, 'Preset description', PRESET_DESCRIPTION_MAX_LENGTH),
    prompt: parseBoundedString(body.prompt, 'Preset prompt', PRESET_PROMPT_MAX_LENGTH),
    image: parseUrl(body.image, 'Preset image'),
    attachments: parseAttachments(body.attachments, { required: false }),
    active: parseActive(body.active),
    sortOrder: parseSortOrder(body.sortOrder),
  }
}

function parseUpdatePresetInput(body: Record<string, unknown>): UpdatePresetPayload {
  const updates: UpdatePresetPayload = {}

  if (body.kind !== undefined) {
    const kind = parseKind(body.kind, { required: true })
    if (kind) updates.kind = kind
  }
  if (body.name !== undefined) {
    updates.name = parseBoundedString(body.name, 'Preset name', PRESET_NAME_MAX_LENGTH)
  }
  if (body.description !== undefined) {
    updates.description = parseBoundedString(body.description, 'Preset description', PRESET_DESCRIPTION_MAX_LENGTH)
  }
  if (body.prompt !== undefined) {
    updates.prompt = parseBoundedString(body.prompt, 'Preset prompt', PRESET_PROMPT_MAX_LENGTH)
  }
  if (body.image !== undefined) {
    updates.image = parseUrl(body.image, 'Preset image')
  }
  if (body.attachments === null) {
    updates.attachments = null
  } else if (body.attachments !== undefined) {
    updates.attachments = parseAttachments(body.attachments, { required: true })
  }
  if (body.active !== undefined) {
    const active = parseActive(body.active)
    if (active !== undefined) updates.active = active
  }
  if (body.sortOrder !== undefined) {
    const sortOrder = parseSortOrder(body.sortOrder)
    if (sortOrder !== undefined) updates.sortOrder = sortOrder
  }

  assertHasUpdates(updates)
  return updates
}

export const getPresets = async (c: Context<AppContext>) => {
  const { presets, meta } = await listPresets(getQueryString(c.req.url))
  return successResponse(
    c,
    200,
    { presets: presets.map(preset => serializePreset(preset as IPreset)) },
    meta,
  )
}

export const getPreset = async (c: Context<AppContext>) => {
  const id = parseParamId(c.req.param('id'), 'preset ID')
  const preset = await getPresetById(id)
  if (!preset) {
    throw new HttpError(404, 'Preset not found')
  }
  return successResponse(c, 200, { preset: serializePreset(preset) })
}

export const createPreset = async (c: Context<AppContext>) => {
  const input = parseCreatePresetInput((await c.req.json()) as Record<string, unknown>)
  const preset = await createPresetInDb({
    kind: input.kind,
    name: input.name,
    description: input.description,
    prompt: input.prompt,
    image: input.image,
    attachments: input.attachments,
    active: input.active,
    sortOrder: input.sortOrder,
  })

  return successResponse(c, 201, { preset: serializePreset(preset.toObject()) })
}

export const updatePreset = async (c: Context<AppContext>) => {
  const id = parseParamId(c.req.param('id'), 'preset ID')
  const input = parseUpdatePresetInput((await c.req.json()) as Record<string, unknown>)

  const preset = await updatePresetInDb(id, input)
  if (!preset) {
    throw new HttpError(404, 'Preset not found')
  }

  return successResponse(c, 200, { preset: serializePreset(preset.toObject()) })
}

export const deletePreset = async (c: Context<AppContext>) => {
  const id = parseParamId(c.req.param('id'), 'preset ID')
  const deleted = await deletePresetInDb(id)
  if (!deleted) {
    throw new HttpError(404, 'Preset not found')
  }

  return successResponse(c, 200, { id })
}
