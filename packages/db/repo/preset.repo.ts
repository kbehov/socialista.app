import { PresetModel } from '../models/preset.model.js'
import type { CreatePresetInput, IPreset, PresetDocument, UpdatePresetInput } from '../types/preset.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'

function parseActiveFilter(value: unknown): boolean | undefined {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

function mapCreateFields(input: CreatePresetInput): Partial<IPreset> {
  return {
    kind: input.kind,
    name: input.name,
    description: input.description,
    prompt: input.prompt,
    image: input.image,
    attachments: input.attachments ?? [],
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? 0,
  }
}

function mapUpdateFields(updates: UpdatePresetInput): Record<string, unknown> {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}

  if (updates.kind !== undefined) $set.kind = updates.kind
  if (updates.name !== undefined) $set.name = updates.name
  if (updates.description !== undefined) $set.description = updates.description
  if (updates.prompt !== undefined) $set.prompt = updates.prompt
  if (updates.image !== undefined) $set.image = updates.image
  if (updates.active !== undefined) $set.active = updates.active
  if (updates.sortOrder !== undefined) $set.sortOrder = updates.sortOrder

  if (updates.attachments === null) {
    $set.attachments = []
  } else if (updates.attachments !== undefined) {
    $set.attachments = updates.attachments
  }

  const ops: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) ops.$set = $set
  if (Object.keys($unset).length > 0) ops.$unset = $unset
  return ops
}

export const createPreset = async (input: CreatePresetInput): Promise<PresetDocument> => {
  return PresetModel.create(mapCreateFields(input))
}

export const getPresetById = async (id: string): Promise<IPreset | null> => {
  return PresetModel.findById(id).lean()
}

export const listPresets = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const active = parseActiveFilter(match.active)
  delete match.active

  const filter: Record<string, unknown> = {
    ...match,
    ...(active !== undefined ? { active } : {}),
  }

  const [presets, total] = await Promise.all([
    PresetModel.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    PresetModel.countDocuments(filter),
  ])

  return {
    presets,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const updatePreset = async (id: string, updates: UpdatePresetInput): Promise<PresetDocument | null> => {
  const ops = mapUpdateFields(updates)
  if (Object.keys(ops).length === 0) {
    return PresetModel.findById(id)
  }
  return PresetModel.findByIdAndUpdate(id, ops, { new: true })
}

export const deletePreset = async (id: string): Promise<boolean> => {
  const deleted = await PresetModel.findByIdAndDelete(id)
  return Boolean(deleted)
}
