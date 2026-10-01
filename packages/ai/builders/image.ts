import type { AspectRatio, SanitizedMedia } from '@socialista/types'
import type { FilePart, ModelMessage } from 'ai'

const DESTINATION_FORMATS: Record<AspectRatio, string> = {
  '9:16': 'tall vertical — Instagram Stories and Reels, TikTok, Pinterest pins',
  '1:1': 'square — Instagram and LinkedIn feed post, seen as a small grid thumbnail',
  '4:3': 'landscape — feed post and link preview',
  '16:9': 'wide landscape — LinkedIn, X, and YouTube-style link cards',
}

const INFLUENCER_PHOTO_DESTINATION_SUFFIX =
  ' Output must be one photoreal photograph of a single person filling the frame — not a slide, infographic, carousel, or static ad with typography.'

export type BuildImagePromptMessagesOptions = {
  /** Omit target-model "native format" hint; use UGC photograph destination (influencer generation). */
  influencerPhotograph?: boolean
}

export const buildImagePromptMessages = (
  prompt: string,
  media?: SanitizedMedia[],
  aspectRatio?: AspectRatio,
  targetModel?: string,
  options?: BuildImagePromptMessagesOptions,
): ModelMessage[] => {
  const influencerPhotograph = options?.influencerPhotograph === true

  const destination = aspectRatio
    ? influencerPhotograph
      ? `Destination: ${DESTINATION_FORMATS[aspectRatio]}.${INFLUENCER_PHOTO_DESTINATION_SUFFIX}`
      : `Destination format: ${DESTINATION_FORMATS[aspectRatio]}.`
    : influencerPhotograph
      ? `Destination: square or vertical feed photograph of one creator.${INFLUENCER_PHOTO_DESTINATION_SUFFIX}`
      : null

  const target =
    !influencerPhotograph && targetModel?.trim()
      ? `Target image model: ${targetModel.trim()}. Write in the prompt format this model responds to best.`
      : null

  const referenceLegend =
    media && media.length > 0
      ? `Attached reference images in order: ${media
          .map((_, index) => `Image ${index + 1} (@image${index + 1})`)
          .join(', ')}. @imageN in the request maps to Image N.`
      : null

  const text = [referenceLegend, prompt, destination, target].filter(Boolean).join('\n\n')

  if (!media || media.length === 0) {
    return [{ role: 'user', content: text }]
  }

  const imageParts: FilePart[] = media.map(item => ({ type: 'file', data: item.imageUrl, mediaType: 'image' }))
  return [{ role: 'user', content: [...imageParts, { type: 'text', text }] }]
}
