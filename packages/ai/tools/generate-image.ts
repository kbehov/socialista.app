import { type ImageGenerationPayload, imageGenerationPayloadSchema } from '../schemas/image-generation.js'
import { resolveImageGenerator } from '../utils/resolve-provider.js'

// Generate an image using the specified model and payload
export const generateImage = async (
  payload: ImageGenerationPayload,
  onProgress?: (progress: number, label: string) => void,
): Promise<string> => {
  const generator = resolveImageGenerator(payload.provider)
  const parsedPayload = imageGenerationPayloadSchema.parse(payload)
  const result = await generator({
    ...parsedPayload,
    onProgress,
  })
  return result
}
