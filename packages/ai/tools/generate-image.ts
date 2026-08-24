import { type ImageGenerationPayload, imageGenerationPayloadSchema } from '../schemas/image-generation.js'
import { resolveImageGenerator } from '../providers/resolve-provider.js'

export const generateImages = async (
  payload: ImageGenerationPayload,
  onProgress?: (progress: number, label: string) => void,
): Promise<string[]> => {
  const generator = resolveImageGenerator(payload.provider)
  const parsedPayload = imageGenerationPayloadSchema.parse(payload)
  const urls = await generator({
    ...parsedPayload,
    onProgress,
  })
  if (urls.length === 0) {
    throw new Error('No image was returned from the model')
  }
  return urls
}

export const generateImage = async (
  payload: ImageGenerationPayload,
  onProgress?: (progress: number, label: string) => void,
): Promise<string> => {
  const [url] = await generateImages(payload, onProgress)
  return url!
}
