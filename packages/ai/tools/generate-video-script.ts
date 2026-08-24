import type { GenerateVideoScriptInput, GenerateVideoScriptResult } from '@socialista/types'
import { PROMPT_KEYS } from '@socialista/types'
import { generateObject } from 'ai'

import { resolvePrompt } from '../registry.js'
import { buildVideoScriptUserPrompt } from '../builders/video-script.js'
import {
  normalizeVideoScriptSegments,
  videoScriptGeneratedSchema,
} from '../schemas/video-script-generation.js'

const MIN_DURATION = 5
const MAX_DURATION = 600

export async function generateVideoScript({
  description,
  duration,
  tone,
  systemOverride,
}: GenerateVideoScriptInput & {
  systemOverride?: string
}): Promise<GenerateVideoScriptResult> {
  const trimmed = description.trim()
  if (!trimmed) {
    throw new Error('Description is required')
  }

  const clampedDuration = Math.min(Math.max(duration, MIN_DURATION), MAX_DURATION)
  const { model, system } = resolvePrompt(PROMPT_KEYS.videoScript, systemOverride)

  const result = await generateObject({
    model,
    schema: videoScriptGeneratedSchema,
    system,
    temperature: 0.8,
    prompt: buildVideoScriptUserPrompt(trimmed, clampedDuration, tone),
  })

  return {
    title: result.object.title.trim() || 'Generated script',
    segments: normalizeVideoScriptSegments(result.object, clampedDuration),
  }
}
