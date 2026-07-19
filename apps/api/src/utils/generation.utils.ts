import { HttpError } from '@/utils/http-response.js'
import { assertWorkspaceMember, getWorkspaceOrThrow } from '@/utils/workspace.utils.js'
import { getGenerationById, type IGeneration } from '@socialista/db'
import type { Generation } from '@socialista/types'

export const serializeGeneration = (generation: IGeneration): Generation => ({
  _id: generation._id.toString(),
  workspaceId: generation.workspace.toString(),
  createdBy: generation.createdBy.toString(),
  kind: generation.kind,
  status: generation.status,
  taskId: generation.taskId,
  triggerRunId: generation.triggerRunId,
  prompt: generation.prompt,
  enhancedPrompt: generation.enhancedPrompt,
  model: generation.model,
  modelName: generation.modelName,
  modelProvider: generation.modelProvider,
  inputs: generation.inputs,
  result: generation.result,
  cost: generation.cost,
  creditsCharged: generation.creditsCharged,
  errorMessage: generation.errorMessage,
  startedAt: generation.startedAt,
  finishedAt: generation.finishedAt,
  durationMs: generation.durationMs,
  createdAt: generation.createdAt,
  updatedAt: generation.updatedAt,
})

export const getGenerationForMember = async (
  generationId: string,
  userId: string,
): Promise<IGeneration> => {
  const generation = await getGenerationById(generationId)
  if (!generation) {
    throw new HttpError(404, 'Generation not found')
  }

  const workspace = await getWorkspaceOrThrow(generation.workspace.toString())
  assertWorkspaceMember(workspace, userId)

  return generation
}
