import type { AspectRatio, SanitizedMedia } from '@socialista/types'
import { PROMPT_KEYS } from '@socialista/types'
import { generateText } from 'ai'

import { buildImagePromptMessages } from './builders/image.js'
import { buildVideoPromptMessages } from './builders/video.js'
import { softenInfluencerImagePrompt, type InfluencerReferenceMode } from './influencer/prompt.js'
import { resolvePrompt } from './registry.js'

export const buildUgcStillPrompt = async (payload: {
  prompt: string
  media?: SanitizedMedia[]
  aspectRatio?: AspectRatio
  systemOverride?: string
  targetModel?: string
}) => {
  const { model, system } = resolvePrompt(PROMPT_KEYS.ugcStillPrompt, payload.systemOverride)
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

export const buildInfluencerImagePrompt = async (payload: {
  prompt: string
  media?: SanitizedMedia[]
  aspectRatio?: AspectRatio
  systemOverride?: string
  targetModel?: string
  referenceMode?: InfluencerReferenceMode
}) => {
  const { model, system } = resolvePrompt(PROMPT_KEYS.influencerPrompt, payload.systemOverride)
  const modeNote =
    payload.referenceMode === 'user'
      ? 'Reference mode: style photos. Identity is the Identity section. Attached images set scene, palette, framing, and light only — do not copy those faces.'
      : payload.referenceMode === 'cover'
        ? 'Reference mode: generated cover. The attached cover is this same person. Follow Shot for a new angle.'
        : 'Reference mode: none. Do not invent a place that contradicts Identity, Shot, or Scene.'

  const { text } = await generateText({
    model,
    system,
    temperature: 0.2,
    messages: buildImagePromptMessages(
      `${modeNote}\n\n${payload.prompt}`,
      payload.media,
      payload.aspectRatio,
      payload.targetModel,
    ),
  })
  return softenInfluencerImagePrompt(text)
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

export const buildInfluencerHookVideoPrompt = async (payload: {
  prompt: string
  media?: SanitizedMedia[]
  aspectRatio?: string
  durationSec?: number
  generateAudio?: boolean
  systemOverride?: string
  targetModel?: string
}) => {
  const { model, system } = resolvePrompt(PROMPT_KEYS.influencerHookVideo, payload.systemOverride)
  const { text } = await generateText({
    model,
    system,
    temperature: 0.3,
    messages: buildVideoPromptMessages(payload.prompt, payload.media, {
      aspectRatio: payload.aspectRatio,
      durationSec: payload.durationSec,
      generateAudio: payload.generateAudio,
      targetModel: payload.targetModel,
    }),
  })
  return text
}
