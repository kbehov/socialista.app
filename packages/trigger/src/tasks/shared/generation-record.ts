import {
  GenerationKind,
  GenerationResultType,
  GenerationStatus,
  upsertGenerationByTriggerRunId,
  updateGenerationByTriggerRunId,
  type GenerationInputs,
  type GenerationResult,
  type IModel,
} from '@socialista/db'
import { logger } from '@trigger.dev/sdk/v3'

export type StartGenerationRecordInput = {
  kind: GenerationKind
  taskId: string
  triggerRunId: string
  workspaceId: string
  userId: string
  prompt?: string
  model: IModel
  inputs?: GenerationInputs
}

export type CompleteGenerationRecordInput = {
  triggerRunId: string
  result: GenerationResult
  cost: number
  startedAt: Date
  enhancedPrompt?: string
}

export type FailGenerationRecordInput = {
  triggerRunId: string
  error: unknown
  startedAt: Date
}

function durationMsSince(startedAt: Date, finishedAt: Date): number {
  return Math.max(0, finishedAt.getTime() - startedAt.getTime())
}

function errorMessage(error: unknown, fallback = 'Generation failed'): string {
  return error instanceof Error ? error.message : fallback
}

/** Create or upsert a running generation row. Throws if persistence fails. */
export async function startGenerationRecord(input: StartGenerationRecordInput) {
  const startedAt = new Date()

  await upsertGenerationByTriggerRunId({
    workspace: input.workspaceId,
    createdBy: input.userId,
    kind: input.kind,
    status: GenerationStatus.RUNNING,
    taskId: input.taskId,
    triggerRunId: input.triggerRunId,
    prompt: input.prompt,
    model: input.model.value,
    modelName: input.model.name,
    modelProvider: input.model.modelProvider,
    inputs: input.inputs,
    cost: 0,
    creditsCharged: 0,
    startedAt,
  })

  return { startedAt }
}

/** Persist the AI-enhanced / planned prompt. Best-effort — logs and does not throw. */
export async function setGenerationEnhancedPrompt(triggerRunId: string, enhancedPrompt: string) {
  try {
    await updateGenerationByTriggerRunId(triggerRunId, { enhancedPrompt })
  } catch (error) {
    logger.error('Failed to set generation enhancedPrompt', {
      triggerRunId,
      message: errorMessage(error),
    })
  }
}

/** Mark generation completed. Best-effort — logs and does not throw. */
export async function completeGenerationRecord(input: CompleteGenerationRecordInput) {
  const finishedAt = new Date()

  try {
    await updateGenerationByTriggerRunId(input.triggerRunId, {
      status: GenerationStatus.COMPLETED,
      result: input.result,
      cost: input.cost,
      creditsCharged: input.cost,
      ...(input.enhancedPrompt !== undefined ? { enhancedPrompt: input.enhancedPrompt } : {}),
      errorMessage: null,
      finishedAt,
      durationMs: durationMsSince(input.startedAt, finishedAt),
    })
  } catch (error) {
    logger.error('Failed to complete generation record', {
      triggerRunId: input.triggerRunId,
      message: errorMessage(error),
    })
  }
}

/** Mark generation failed. Best-effort — logs and does not throw. */
export async function failGenerationRecord(input: FailGenerationRecordInput) {
  const finishedAt = new Date()

  try {
    await updateGenerationByTriggerRunId(input.triggerRunId, {
      status: GenerationStatus.FAILED,
      errorMessage: errorMessage(input.error),
      finishedAt,
      durationMs: durationMsSince(input.startedAt, finishedAt),
    })
  } catch (error) {
    logger.error('Failed to fail generation record', {
      triggerRunId: input.triggerRunId,
      message: errorMessage(error),
    })
  }
}

export { GenerationKind, GenerationResultType }
