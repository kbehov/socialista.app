import { PIPELINE_STEPS } from '@/constants/generation.const'
import type { ImageGenerationStatus } from '@socialista/types'
import { extractErrorMessage, formatGenerationError } from './format-error'

export function parseMetadataError(metadata: Record<string, unknown> | undefined): string | undefined {
  const error = metadata?.error
  if (typeof error === 'string') {
    return formatGenerationError(error)
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message
    if (typeof message === 'string') {
      return formatGenerationError(message)
    }
  }
  return undefined
}

export function resolveFailureMessage(
  run: { error?: unknown; metadata?: Record<string, unknown> } | undefined,
): string {
  if (run?.error) {
    return extractErrorMessage(run.error)
  }

  const metadataError = parseMetadataError(run?.metadata)
  if (metadataError) {
    return metadataError
  }

  return 'The generation run did not complete.'
}

export function parseGenerationStatus(metadata: Record<string, unknown> | undefined): ImageGenerationStatus {
  const status = metadata?.status as Partial<ImageGenerationStatus> | undefined
  if (status && typeof status.progress === 'number' && typeof status.label === 'string') {
    return { progress: status.progress, label: status.label }
  }
  return { progress: 5, label: 'Starting generation…' }
}

export function pipelineStepState(
  progress: number,
  threshold: number,
  nextThreshold: number | undefined,
  isComplete: boolean,
): 'complete' | 'active' | 'pending' {
  if (isComplete) return 'complete'
  if (progress >= (nextThreshold ?? 100)) return 'complete'
  if (progress >= threshold) return 'active'
  return 'pending'
}

export function computeActiveStepIndex(progress: number, isComplete: boolean, isFailed: boolean): number {
  if (isComplete) return PIPELINE_STEPS.length - 1
  if (isFailed) {
    for (let i = PIPELINE_STEPS.length - 1; i >= 0; i--) {
      if (progress >= PIPELINE_STEPS[i].threshold) return i
    }
    return 0
  }
  for (let i = PIPELINE_STEPS.length - 1; i >= 0; i--) {
    if (progress >= PIPELINE_STEPS[i].threshold) return i
  }
  return 0
}
