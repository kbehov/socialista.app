import { metadata } from '@trigger.dev/sdk/v3'
import type { ImageGenerationError, ImageGenerationStatus } from '@socialista/types'

export function setGenerationStatus(progress: number, label: string) {
  const status: ImageGenerationStatus = { progress, label }
  metadata.set('status', status)
}

export function setGenerationFailure(error: unknown, fallbackMessage = 'Generation failed') {
  const message = error instanceof Error ? error.message : fallbackMessage
  setGenerationStatus(100, 'Generation failed')
  metadata.set('error', { message } satisfies ImageGenerationError)
}
