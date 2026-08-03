import type { AspectRatio, SanitizedMedia } from '@socialista/types'
import type { FilePart, ModelMessage } from 'ai'

const DESTINATION_FORMATS: Record<AspectRatio, string> = {
  '9:16': 'tall vertical — Instagram Stories and Reels, TikTok, Pinterest pins',
  '1:1': 'square — Instagram and LinkedIn feed post, seen as a small grid thumbnail',
  '4:3': 'landscape — feed post and link preview',
  '16:9': 'wide landscape — LinkedIn, X, and YouTube-style link cards',
}

export const buildImagePromptMessages = (
  prompt: string,
  media?: SanitizedMedia[],
  aspectRatio?: AspectRatio,
): ModelMessage[] => {
  const text = aspectRatio ? `${prompt}\n\nDestination format: ${DESTINATION_FORMATS[aspectRatio]}.` : prompt

  if (!media || media.length === 0) {
    return [{ role: 'user', content: text }]
  }

  const imageParts: FilePart[] = media.map(item => ({ type: 'file', data: item.imageUrl, mediaType: 'image' }))
  return [{ role: 'user', content: [...imageParts, { type: 'text', text }] }]
}
