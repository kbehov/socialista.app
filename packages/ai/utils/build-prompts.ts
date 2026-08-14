import type { AspectRatio, SanitizedMedia } from '@socialista/types'
import { generateText } from 'ai'
import { generateImagePromptSystemMessage } from '../prompts/image-prompts.js'
import { generateVideoPromptSystemMessage } from '../prompts/video-prompts.js'
import { buildImagePromptMessages, buildVideoPromptMessages } from './build-messages.js'
// Improve the prompt for image generation
export const buildImagePrompt = async (payload: {
  prompt: string
  media?: SanitizedMedia[]
  aspectRatio?: AspectRatio
}) => {
  const enhanced = await generateText({
    model: 'openai/gpt-5.6-terra',
    system: generateImagePromptSystemMessage,
    messages: buildImagePromptMessages(payload.prompt, payload.media, payload.aspectRatio),
  })
  console.log('enhanced', enhanced.text)
  return enhanced.text
}

export const buildVideoPrompt = async (payload: {
  prompt: string
  media?: SanitizedMedia[]
  aspectRatio?: string
  durationSec?: number
  generateAudio?: boolean
}) => {
  const enhanced = await generateText({
    model: 'openai/gpt-5.6-terra',
    system: generateVideoPromptSystemMessage,
    messages: buildVideoPromptMessages(payload.prompt, payload.media, {
      aspectRatio: payload.aspectRatio,
      durationSec: payload.durationSec,
      generateAudio: payload.generateAudio,
    }),
  })
  console.log('enhanced video prompt', enhanced.text)
  return enhanced.text
}
