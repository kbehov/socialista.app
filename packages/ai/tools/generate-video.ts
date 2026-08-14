import { type VideoGenerationPayload, videoGenerationPayloadSchema } from '../schemas/video-generation.js'
import { resolveVideoGenerator } from '../utils/resolve-provider.js'

export const generateVideo = async (
  payload: VideoGenerationPayload,
  onProgress?: (progress: number, label: string) => void,
): Promise<string> => {
  const generator = resolveVideoGenerator(payload.provider)
  const parsedPayload = videoGenerationPayloadSchema.parse(payload)
  const url = await generator({
    ...parsedPayload,
    onProgress,
  })
  if (!url) {
    throw new Error('No video was returned from the model')
  }
  return url
}
