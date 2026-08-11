import { InfluencerModel } from '../models/influencer.model.js'
import {
  type CreateInfluencerInput,
  type IInfluencer,
  type UpdateInfluencerInput,
} from '../types/influencer.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'

const APPEARANCE_FILTER_KEYS = ['hairColor', 'eyeColor', 'skinTone', 'bodyShape', 'hairStyle'] as const

function mapCreateFields(input: CreateInfluencerInput) {
  return {
    workspace: input.workspace ? toObjectId(input.workspace) : null,
    createdBy: input.createdBy ? toObjectId(input.createdBy) : null,
    visibility: input.visibility,
    source: input.source,
    name: input.name,
    bio: input.bio,
    directions: input.directions,
    niche: input.niche,
    scenes: input.scenes,
    gender: input.gender,
    ageRange: input.ageRange,
    ethnicity: input.ethnicity,
    appearance: input.appearance,
    aestheticTags: input.aestheticTags ?? [],
    photoStyle: input.photoStyle,
    identity: input.identity,
    status: input.status,
    coverImageUrl: input.coverImageUrl,
    galleryImageUrls: input.galleryImageUrls ?? [],
  }
}

function mapUpdateFields(updates: UpdateInfluencerInput): Record<string, unknown> {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}

  if (updates.name !== undefined) $set.name = updates.name
  if (updates.niche !== undefined) $set.niche = updates.niche
  if (updates.scenes !== undefined) $set.scenes = updates.scenes
  if (updates.aestheticTags !== undefined) $set.aestheticTags = updates.aestheticTags
  if (updates.status !== undefined) $set.status = updates.status
  if (updates.galleryImageUrls !== undefined) $set.galleryImageUrls = updates.galleryImageUrls
  if (updates.usageCount !== undefined) $set.usageCount = updates.usageCount
  if (updates.visibility !== undefined) $set.visibility = updates.visibility

  if (updates.bio === null) $unset.bio = 1
  else if (updates.bio !== undefined) $set.bio = updates.bio

  if (updates.directions === null) $unset.directions = 1
  else if (updates.directions !== undefined) $set.directions = updates.directions

  if (updates.photoStyle === null) $unset.photoStyle = 1
  else if (updates.photoStyle !== undefined) $set.photoStyle = updates.photoStyle

  if (updates.coverImageUrl === null) $unset.coverImageUrl = 1
  else if (updates.coverImageUrl !== undefined) $set.coverImageUrl = updates.coverImageUrl

  if (updates.error === null) $unset.error = 1
  else if (updates.error !== undefined) $set.error = updates.error

  if (updates.identity) {
    for (const [key, value] of Object.entries(updates.identity)) {
      if (value !== undefined) $set[`identity.${key}`] = value
    }
  }

  const ops: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) ops.$set = $set
  if (Object.keys($unset).length > 0) ops.$unset = $unset
  return ops
}

/** Remap flat appearance filters and sort aliases before buildFilters. */
function normalizeInfluencerQuery(query: string): string {
  const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)

  for (const key of APPEARANCE_FILTER_KEYS) {
    const value = params.get(key)
    if (value) {
      params.set(`appearance.${key}`, value)
      params.delete(key)
    }
  }

  const sort = params.get('sort')
  if (sort === 'popular') params.set('sort', '-usageCount')
  else if (sort === 'newest') params.set('sort', '-createdAt')
  else if (sort === 'az') params.set('sort', 'name')

  return params.toString()
}

export const createInfluencer = async (input: CreateInfluencerInput): Promise<IInfluencer> => {
  const doc = await InfluencerModel.create(mapCreateFields(input))
  return doc.toObject()
}

export const getInfluencerById = async (id: string) => {
  return InfluencerModel.findById(id).lean()
}

export const updateInfluencer = async (id: string, updates: UpdateInfluencerInput) => {
  const ops = mapUpdateFields(updates)
  if (Object.keys(ops).length === 0) {
    return getInfluencerById(id)
  }
  return InfluencerModel.findByIdAndUpdate(id, ops, { new: true }).lean()
}

export const deleteInfluencer = async (id: string) => {
  return InfluencerModel.findByIdAndDelete(id).lean()
}

export const incrementInfluencerUsageCount = async (id: string, count = 1) => {
  return InfluencerModel.findByIdAndUpdate(id, { $inc: { usageCount: count } }, { new: true }).lean()
}

export const listInfluencers = async (query: string) => {
  const normalized = normalizeInfluencerQuery(query)
  const { match, pagination, sort, textSearch } = buildFilters(normalized)

  if (textSearch) {
    const regex = new RegExp(textSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    match.$or = [{ name: regex }, { bio: regex }]
  }

  const [influencers, total] = await Promise.all([
    InfluencerModel.find(match).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    InfluencerModel.countDocuments(match),
  ])

  return {
    influencers,
    meta: buildPaginationMeta(total, pagination, sort, textSearch),
  }
}
