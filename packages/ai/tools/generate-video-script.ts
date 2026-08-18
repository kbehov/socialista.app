import type { GenerateVideoScriptInput, GenerateVideoScriptResult, SkillModelConfig } from '@socialista/types'
import { generateObject } from 'ai'

import {
  buildVideoScriptUserPrompt,
  VIDEO_SCRIPT_SYSTEM_PROMPT,
} from '../prompts/video-script-prompt.js'
import {
  normalizeVideoScriptSegments,
  videoScriptGeneratedSchema,
} from '../schemas/video-script-generation.js'

const VIDEO_SCRIPT_MODEL = 'anthropic/claude-sonnet-4.6'

const MIN_DURATION = 5
const MAX_DURATION = 600

export async function generateVideoScript({
  description,
  duration,
  tone,
  systemPrompt,
  modelConfig,
}: GenerateVideoScriptInput & {
  systemPrompt?: string
  modelConfig?: SkillModelConfig
}): Promise<GenerateVideoScriptResult> {
  const trimmed = description.trim()
  if (!trimmed) {
    throw new Error('Description is required')
  }

  const clampedDuration = Math.min(Math.max(duration, MIN_DURATION), MAX_DURATION)

  const result = await generateObject({
    model: modelConfig?.model ?? VIDEO_SCRIPT_MODEL,
    schema: videoScriptGeneratedSchema,
    system: systemPrompt ?? VIDEO_SCRIPT_SYSTEM_PROMPT,
    temperature: modelConfig?.temperature ?? 0.8,
    maxOutputTokens: modelConfig?.maxTokens,
    prompt: buildVideoScriptUserPrompt(trimmed, clampedDuration, tone),
  })

  return {
    title: result.object.title.trim() || 'Generated script',
    segments: normalizeVideoScriptSegments(result.object, clampedDuration),
  }
}
