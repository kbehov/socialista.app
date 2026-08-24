import type { SanitizedMedia } from '@socialista/types'
import type { FilePart, ModelMessage } from 'ai'

const VIDEO_DESTINATION_FORMATS: Record<string, string> = {
  '9:16': 'tall vertical — Instagram Reels, TikTok, Stories',
  '1:1': 'square — feed post and grid thumbnail',
  '16:9': 'wide landscape — YouTube-style and LinkedIn',
}

export const buildVideoPromptMessages = (
  prompt: string,
  media?: SanitizedMedia[],
  options?: {
    aspectRatio?: string
    durationSec?: number
    generateAudio?: boolean
    targetModel?: string
  },
): ModelMessage[] => {
  const destination = options?.aspectRatio
    ? `Destination format: ${VIDEO_DESTINATION_FORMATS[options.aspectRatio] ?? options.aspectRatio}.`
    : null

  const duration =
    typeof options?.durationSec === 'number' ? `Clip length: about ${options.durationSec} seconds.` : null

  const audio =
    options?.generateAudio === false
      ? 'Native audio is off — picture and motion only, no speech or sound design.'
      : options?.generateAudio
        ? 'Native audio is on — include diegetic sound; spoken lines only if the user asked for them.'
        : null

  const target =
    options?.targetModel?.trim() ?
      `Target video model: ${options.targetModel.trim()}. Write in the prompt format this model responds to best.`
    : null

  const referenceLegend =
    media && media.length > 0
      ? `Attached reference images in order: ${media
          .map((_, index) => `Image ${index + 1} (@image${index + 1})`)
          .join(', ')}. @imageN in the request maps to Image N. Image 1 is the start-frame identity when animating from a still.`
      : null

  const text = [referenceLegend, prompt, destination, duration, audio, target].filter(Boolean).join('\n\n')

  if (!media || media.length === 0) {
    return [{ role: 'user', content: text }]
  }

  const imageParts: FilePart[] = media.map(item => ({ type: 'file', data: item.imageUrl, mediaType: 'image' }))
  return [{ role: 'user', content: [...imageParts, { type: 'text', text }] }]
}
