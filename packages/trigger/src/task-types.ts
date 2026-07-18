import type { realtimeImageGeneration } from './tasks/image/generate-image-realtime.js'
import type { realtimeStaticAdGeneration } from './tasks/image/generate-static-ad-realtime.js'

export type RealtimeImageGenerationTask = typeof realtimeImageGeneration
export type RealtimeStaticAdGenerationTask = typeof realtimeStaticAdGeneration
