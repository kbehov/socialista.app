export {
  ASPECT_RATIOS,
  STATIC_AD_MODEL,
  TASK_IDS,
  type AspectRatio,
  type ImageGenerationError,
  type ImageGenerationOutput,
  type ImageGenerationStatus,
  type ImageGenerator,
  type TaskId,
} from '@socialista/types'

export {
  imageGenerationPayloadSchema,
  payloadSchema,
  type ImageGenerationPayload,
} from './schemas/image-generation.schema.js'

export {
  staticAdPayloadObjectSchema,
  staticAdPayloadSchema,
  type StaticAdGenerationPayload,
} from './schemas/static-ad.schema.js'

export {
  buildStaticAdCreativeBrief,
  buildStaticAdFinalPrompt,
  isStaticAdUgcRequest,
  sanitizeStaticAdModelPrompt,
  staticAdVisionSystemPrompt,
  type StaticAdPromptInput,
} from './ai/static-ad-prompts.js'
export { generateImagePromptSystemPrompt } from './ai/image-prompts.js'
