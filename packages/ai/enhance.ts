import type { AspectRatio, SanitizedMedia } from '@socialista/types'
import { PROMPT_KEYS, REGISTRY_PROMPT_KEYS } from '@socialista/types'
import { generateText } from 'ai'

import { buildImagePromptMessages } from './builders/image.js'
import { buildVideoPromptMessages } from './builders/video.js'
import { softenInfluencerImagePrompt, type InfluencerReferenceMode } from './influencer/prompt.js'
import { UGC_STILL_PROMPT_SYSTEM } from './prompts/ugc-still.js'
import { resolvePrompt } from './registry.js'

/** LLM rewrite returned a slideshow/static-ad spec instead of a photograph prompt. */
function looksLikeInfluencerGraphicSpec(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false

  if (/["']slides["']\s*:/.test(trimmed) || /["'](content_type|type)["']\s*:/.test(trimmed)) {
    return true
  }

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (parsed && typeof parsed === 'object' && 'slides' in parsed && Array.isArray((parsed as { slides: unknown }).slides)) {
        return true
      }
    } catch {
      // not JSON — fall through
    }
  }

  const numberedLines = trimmed.match(/^\s*\d+\.\s+/gm)
  if (numberedLines && numberedLines.length >= 2 && /\bdetails that make\b/i.test(trimmed)) {
    return true
  }

  return false
}

export const buildUgcStillPrompt = async (payload: {
  prompt: string
  media?: SanitizedMedia[]
  aspectRatio?: AspectRatio
  systemOverride?: string
  targetModel?: string
}) => {
  const { model } = resolvePrompt(PROMPT_KEYS.imagePrompt)
  const system = payload.systemOverride?.trim() || UGC_STILL_PROMPT_SYSTEM
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
  const { model, system } = resolvePrompt(
    REGISTRY_PROMPT_KEYS.influencerPrompt,
    payload.systemOverride,
  )
  const modeNote =
    payload.referenceMode === 'user'
      ? 'Reference mode: style photos. Identity is the Identity section. Attached images set scene, palette, framing, and light only — do not copy those faces.'
      : payload.referenceMode === 'cover'
        ? 'Reference mode: generated cover. Image 1 is this same person — face, hair, and complexion only. Shot and Scene replace the room, crop, pose, and light. Do not copy the cover background or color grade.'
        : 'Reference mode: none. Do not invent a place that contradicts Identity, Shot, or Scene.'

  const assembled = softenInfluencerImagePrompt(`${modeNote}\n\n${payload.prompt}`)

  const { text } = await generateText({
    model,
    system,
    temperature: 0.2,
    messages: buildImagePromptMessages(assembled, payload.media, payload.aspectRatio, undefined, {
      influencerPhotograph: true,
    }),
  })

  const enhanced = softenInfluencerImagePrompt(text)
  if (looksLikeInfluencerGraphicSpec(enhanced)) {
    console.warn('[buildInfluencerImagePrompt] Rewrite looked like a graphic spec; using assembled portrait brief')
    return assembled
  }
  return enhanced
}

export const buildVideoPrompt = async (payload: {
  prompt: string
  media?: SanitizedMedia[]
  aspectRatio?: string
  durationSec?: number
  generateAudio?: boolean
  systemOverride?: string
  targetModel?: string
  sourceVideoEdit?: boolean
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
      sourceVideoEdit: payload.sourceVideoEdit,
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
  const { model, system } = resolvePrompt(
    REGISTRY_PROMPT_KEYS.influencerHookVideo,
    payload.systemOverride,
  )
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
