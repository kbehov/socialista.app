import { InfluencerCloneRequestModel } from '../models/influencer-clone-request.model.js'
import {
  InfluencerCloneRequestStatus,
  type CreateInfluencerCloneRequestInput,
  type IInfluencerCloneRequest,
  type UpdateInfluencerCloneRequestInput,
} from '../types/influencer.types.js'
import { toObjectId } from '../utils/isValid.js'

export const createInfluencerCloneRequest = async (
  input: CreateInfluencerCloneRequestInput,
): Promise<IInfluencerCloneRequest> => {
  const doc = await InfluencerCloneRequestModel.create({
    workspace: toObjectId(input.workspace),
    userId: toObjectId(input.userId),
    uploadedImageUrls: input.uploadedImageUrls,
    consentConfirmedAt: input.consentConfirmedAt,
    status: input.status ?? InfluencerCloneRequestStatus.PENDING,
    name: input.name,
    bio: input.bio,
    niche: input.niche ?? [],
    gender: input.gender,
    ageRange: input.ageRange,
    ethnicity: input.ethnicity,
    appearance: input.appearance,
    aestheticTags: input.aestheticTags ?? [],
  })
  return doc.toObject()
}

export const getInfluencerCloneRequestById = async (id: string) => {
  return InfluencerCloneRequestModel.findById(id).lean()
}

export const updateInfluencerCloneRequest = async (id: string, updates: UpdateInfluencerCloneRequestInput) => {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}

  if (updates.status !== undefined) $set.status = updates.status
  if (updates.trainingJobId === null) $unset.trainingJobId = 1
  else if (updates.trainingJobId !== undefined) $set.trainingJobId = updates.trainingJobId
  if (updates.error === null) $unset.error = 1
  else if (updates.error !== undefined) $set.error = updates.error
  if (updates.resultInfluencerId === null) $unset.resultInfluencerId = 1
  else if (updates.resultInfluencerId !== undefined) {
    $set.resultInfluencerId = toObjectId(updates.resultInfluencerId)
  }

  const ops: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) ops.$set = $set
  if (Object.keys($unset).length > 0) ops.$unset = $unset

  if (Object.keys(ops).length === 0) {
    return getInfluencerCloneRequestById(id)
  }

  return InfluencerCloneRequestModel.findByIdAndUpdate(id, ops, { new: true }).lean()
}

export const deleteInfluencerCloneRequest = async (id: string) => {
  return InfluencerCloneRequestModel.findByIdAndDelete(id).lean()
}

export const deleteInfluencerCloneRequestsByResultInfluencerId = async (influencerId: string) => {
  return InfluencerCloneRequestModel.deleteMany({ resultInfluencerId: toObjectId(influencerId) })
}
