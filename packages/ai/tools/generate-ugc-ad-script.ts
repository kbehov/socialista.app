import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { clampUgcScript, PROMPT_KEYS, type SanitizedMedia } from '@socialista/types'

import { buildImagePromptMessages } from '../builders/image.js'
import { resolvePrompt } from '../registry.js'
import {
  buildUgcAdScriptSegmentsUserPrompt,
  buildUgcAdScriptUserPrompt,
  type UgcAdScriptPromptInput,
  type UgcAdScriptSceneInput,
} from '../builders/ugc-ad-script.js'

export type GenerateUgcAdScriptInput = UgcAdScriptPromptInput & {
  systemOverride?: string
  media?: SanitizedMedia[]
}

export type GenerateUgcAdScriptSegmentsInput = {
  productName?: string
  productDescription?: string
  productKind?: string
  influencerName?: string
  directions?: string
  scenes: UgcAdScriptSceneInput[]
  systemOverride?: string
}

export type UgcAdScriptSegmentResult = {
  clipId: string
  text: string
}

const segmentsSchema = z.object({
  segments: z.array(
    z.object({
      id: z.string().describe('The scene id from the user prompt'),
      text: z.string().describe('Spoken line for that scene. Empty string if the scene has no talking.'),
    }),
  ),
})

export async function generateUgcAdScript(input: GenerateUgcAdScriptInput): Promise<string> {
  const { model, system } = resolvePrompt(PROMPT_KEYS.ugcAdScript, input.systemOverride)
  const media = input.media?.filter(item => item.imageUrl)
  const result = await generateText({
    model,
    system,
    temperature: 0.85,
    messages: buildImagePromptMessages(
      buildUgcAdScriptUserPrompt(input),
      media && media.length > 0 ? media : undefined,
    ),
  })

  const text = result.text.trim()
  if (!text) {
    throw new Error('Script model returned empty text')
  }

  return clampUgcScript(text.replace(/^["']|["']$/g, ''), input.clipType)
}

export async function generateUgcAdScriptSegments(
  input: GenerateUgcAdScriptSegmentsInput,
): Promise<UgcAdScriptSegmentResult[]> {
  if (input.scenes.length === 0) return []

  const { model, system } = resolvePrompt(PROMPT_KEYS.ugcAdScript, input.systemOverride)
  const result = await generateObject({
    model,
    schema: segmentsSchema,
    system,
    temperature: 0.85,
    prompt: buildUgcAdScriptSegmentsUserPrompt(input),
  })

  const byId = new Map(result.object.segments.map(segment => [segment.id, segment.text]))
  return input.scenes.map(scene => ({
    clipId: scene.id,
    text: clampUgcScript((byId.get(scene.id) ?? '').replace(/^["']|["']$/g, ''), scene.type),
  }))
}
