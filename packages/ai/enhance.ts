import type { AspectRatio, SanitizedMedia } from '@socialista/types'
import { PROMPT_KEYS } from '@socialista/types'
import { generateText } from 'ai'

import { buildImagePromptMessages } from './builders/image.js'
import { buildVideoPromptMessages } from './builders/video.js'
import { resolvePrompt } from './registry.js'

export const buildImagePrompt = async (payload: {
  prompt: string
  media?: SanitizedMedia[]
  aspectRatio?: AspectRatio
  systemOverride?: string
  targetModel?: string
}) => {
  const { model, system } = resolvePrompt(PROMPT_KEYS.imagePrompt, payload.systemOverride)
  const { text } = await generateText({
    model,
    system,
    temperature: 0.4,
    messages: buildImagePromptMessages(
      payload.prompt,
      payload.media,
      payload.aspectRatio,
      payload.targetModel,
    ),
  })
  return text
}

export const buildVideoPrompt = async (payload: {
  prompt: string
  media?: SanitizedMedia[]
  aspectRatio?: string
  durationSec?: number
  generateAudio?: boolean
  systemOverride?: string
  targetModel?: string
}) => {
  const { model, system } = resolvePrompt(PROMPT_KEYS.videoPrompt, payload.systemOverride)
  const { text } = await generateText({
    model,
    system,
    temperature: 0.4,
    messages: buildVideoPromptMessages(payload.prompt, payload.media, {
      aspectRatio: payload.aspectRatio,
      durationSec: payload.durationSec,
      generateAudio: payload.generateAudio,
      targetModel: payload.targetModel,
    }),
  })
  return text
}
