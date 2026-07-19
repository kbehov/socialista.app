import { Types } from 'mongoose'
import { GenerationModel } from '../models/generation.model.js'
import {
  GenerationStatus,
  type CreateGenerationInput,
  type IGeneration,
  type UpdateGenerationInput,
} from '../types/generation.types.js'
import { buildFilters, toObjectId } from '../utils/build-filters.js'

export const getGenerationById = async (id: string): Promise<IGeneration | null> => {
  return GenerationModel.findById(id).lean()
}

export const getGenerationByTriggerRunId = async (
  triggerRunId: string,
): Promise<IGeneration | null> => {
  return GenerationModel.findOne({ triggerRunId }).lean()
}

export const createGeneration = async (input: CreateGenerationInput): Promise<IGeneration> => {
  const {
    workspace,
    createdBy,
    kind,
    taskId,
    triggerRunId,
    model,
    status = GenerationStatus.RUNNING,
    prompt,
    modelName,
    modelProvider,
    inputs,
    result,
    cost = 0,
    creditsCharged = 0,
    errorMessage,
    startedAt = new Date(),
    finishedAt,
    durationMs,
  } = input

  if (!workspace || !createdBy || !kind || !taskId || !triggerRunId || !model) {
    throw new Error('workspace, createdBy, kind, taskId, triggerRunId and model are required')
  }

  const generation = await GenerationModel.create({
    workspace: toObjectId(workspace),
    createdBy: toObjectId(createdBy),
    kind,
    status,
    taskId,
    triggerRunId,
    prompt,
    model,
    modelName,
    modelProvider,
    inputs,
    result,
    cost,
    creditsCharged,
    errorMessage,
    startedAt,
    finishedAt,
    durationMs,
  })

  return generation.toObject()
}

export const upsertGenerationByTriggerRunId = async (
  input: CreateGenerationInput,
): Promise<IGeneration> => {
  const {
    workspace,
    createdBy,
    kind,
    taskId,
    triggerRunId,
    model,
    status = GenerationStatus.RUNNING,
    prompt,
    modelName,
    modelProvider,
    inputs,
    cost = 0,
    creditsCharged = 0,
    startedAt = new Date(),
  } = input

  if (!workspace || !createdBy || !kind || !taskId || !triggerRunId || !model) {
    throw new Error('workspace, createdBy, kind, taskId, triggerRunId and model are required')
  }

  const generation = await GenerationModel.findOneAndUpdate(
    { triggerRunId },
    {
      $setOnInsert: {
        workspace: toObjectId(workspace),
        createdBy: toObjectId(createdBy),
        kind,
        taskId,
        triggerRunId,
        prompt,
        model,
        modelName,
        modelProvider,
        inputs,
        cost,
        creditsCharged,
        startedAt,
        status,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean()

  if (!generation) {
    throw new Error('Failed to upsert generation')
  }

  return generation
}

export const updateGenerationByTriggerRunId = async (
  triggerRunId: string,
  updates: UpdateGenerationInput,
): Promise<IGeneration | null> => {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, ''> = {}

  if (updates.status !== undefined) $set.status = updates.status
  if (updates.prompt !== undefined) $set.prompt = updates.prompt
  if (updates.enhancedPrompt !== undefined) {
    if (updates.enhancedPrompt === null) $unset.enhancedPrompt = ''
    else $set.enhancedPrompt = updates.enhancedPrompt
  }
  if (updates.model !== undefined) $set.model = updates.model
  if (updates.modelName !== undefined) $set.modelName = updates.modelName
  if (updates.modelProvider !== undefined) $set.modelProvider = updates.modelProvider
  if (updates.inputs !== undefined) $set.inputs = updates.inputs
  if (updates.result !== undefined) $set.result = updates.result
  if (updates.cost !== undefined) $set.cost = updates.cost
  if (updates.creditsCharged !== undefined) $set.creditsCharged = updates.creditsCharged
  if (updates.durationMs !== undefined) {
    if (updates.durationMs === null) $unset.durationMs = ''
    else $set.durationMs = updates.durationMs
  }
  if (updates.finishedAt !== undefined) {
    if (updates.finishedAt === null) $unset.finishedAt = ''
    else $set.finishedAt = updates.finishedAt
  }
  if (updates.errorMessage !== undefined) {
    if (updates.errorMessage === null) $unset.errorMessage = ''
    else $set.errorMessage = updates.errorMessage
  }

  const updateQuery: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) updateQuery.$set = $set
  if (Object.keys($unset).length > 0) updateQuery.$unset = $unset

  if (Object.keys(updateQuery).length === 0) {
    return getGenerationByTriggerRunId(triggerRunId)
  }

  return GenerationModel.findOneAndUpdate({ triggerRunId }, updateQuery, { new: true }).lean()
}

export const getGenerations = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)

  if (typeof match.workspace === 'string' && Types.ObjectId.isValid(match.workspace)) {
    match.workspace = toObjectId(match.workspace)
  }
  if (typeof match.createdBy === 'string' && Types.ObjectId.isValid(match.createdBy)) {
    match.createdBy = toObjectId(match.createdBy)
  }

  const [generations, total] = await Promise.all([
    GenerationModel.find(match).sort(sort).limit(pagination.limit).skip(pagination.skip).lean(),
    GenerationModel.countDocuments(match),
  ])

  return {
    generations,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasNextPage: pagination.page < Math.ceil(total / pagination.limit),
      hasPreviousPage: pagination.page > 1,
      sort,
    },
  }
}
