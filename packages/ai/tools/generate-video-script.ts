import type { GenerateVideoScriptInput, GenerateVideoScriptResult } from '@socialista/types'
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
}: GenerateVideoScriptInput): Promise<GenerateVideoScriptResult> {
  const trimmed = description.trim()
  if (!trimmed) {
    throw new Error('Description is required')
  }

  const clampedDuration = Math.min(Math.max(duration, MIN_DURATION), MAX_DURATION)

  const result = await generateObject({
    model: VIDEO_SCRIPT_MODEL,
    schema: videoScriptGeneratedSchema,
    system: VIDEO_SCRIPT_SYSTEM_PROMPT,
    temperature: 0.8,
    prompt: buildVideoScriptUserPrompt(trimmed, clampedDuration, tone),
  })

  return {
    title: result.object.title.trim() || 'Generated script',
    segments: normalizeVideoScriptSegments(result.object, clampedDuration),
  }
}
