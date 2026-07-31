import type { SanitizedMedia } from '@socialista/types'
import type { FilePart } from 'ai'
export const buildImagePromptMessages = (prompt: string, media: SanitizedMedia[]) => {
  // check if the media is an image
  const hasMedia = media?.length > 0
  // if the media is an image, add it to the message
  const imageParts: FilePart[] = media?.map(item => ({ type: 'file', data: item.imageUrl, mediaType: 'image' })) ?? []
  return hasMedia
    ? [
        {
          role: 'user',
          content: [...imageParts, { type: 'text', text: prompt }],
        },
      ]
    : [
        {
          role: 'user',
          content: { type: 'text', text: prompt },
        },
      ]
}
