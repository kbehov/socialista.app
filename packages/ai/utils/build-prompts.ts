import type { AspectRatio, SanitizedMedia, SkillModelConfig } from '@socialista/types'
import { generateText } from 'ai'
import { generateImagePromptSystemMessage } from '../prompts/image-prompts.js'
import { generateVideoPromptSystemMessage } from '../prompts/video-prompts.js'
import { buildImagePromptMessages, buildVideoPromptMessages } from './build-messages.js'

type PromptSkillOverride = {
  systemPrompt?: string
  modelConfig?: SkillModelConfig
}

export const buildImagePrompt = async (payload: {
  prompt: string
  media?: SanitizedMedia[]
  aspectRatio?: AspectRatio
} & PromptSkillOverride) => {
  const enhanced = await generateText({
    model: payload.modelConfig?.model ?? 'openai/gpt-5.6-terra',
    system: payload.systemPrompt ?? generateImagePromptSystemMessage,
    temperature: payload.modelConfig?.temperature,
    maxOutputTokens: payload.modelConfig?.maxTokens,
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
} & PromptSkillOverride) => {
  const enhanced = await generateText({
    model: payload.modelConfig?.model ?? 'openai/gpt-5.6-terra',
    system: payload.systemPrompt ?? generateVideoPromptSystemMessage,
    temperature: payload.modelConfig?.temperature,
    maxOutputTokens: payload.modelConfig?.maxTokens,
    messages: buildVideoPromptMessages(payload.prompt, payload.media, {
      aspectRatio: payload.aspectRatio,
      durationSec: payload.durationSec,
      generateAudio: payload.generateAudio,
    }),
  })
  console.log('enhanced video prompt', enhanced.text)
  return enhanced.text
}
