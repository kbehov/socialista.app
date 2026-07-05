import type { SlideId } from '@socialista/types'

const flushers = new Map<SlideId, () => void>()

export function registerBackgroundTransformFlusher(slideId: SlideId, flush: () => void): void {
  flushers.set(slideId, flush)
}

export function unregisterBackgroundTransformFlusher(slideId: SlideId): void {
  flushers.delete(slideId)
}

export function flushAllBackgroundTransforms(): void {
  for (const flush of flushers.values()) {
    flush()
  }
}
