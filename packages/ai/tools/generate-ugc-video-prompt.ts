import { generateObject } from 'ai'
import { z } from 'zod'
import { PROMPT_KEYS, type AspectRatio, type SanitizedMedia } from '@socialista/types'

import { buildImagePromptMessages } from '../builders/image.js'
import {
  buildUgcVideoPromptUserPrompt,
  type UgcVideoPromptInput,
} from '../builders/ugc-video-prompt.js'
import { UGC_VIDEO_PROMPT_SYSTEM } from '../prompts/ugc-video-prompt.js'
import { resolvePrompt } from '../registry.js'

export type GenerateUgcVideoPromptInput = UgcVideoPromptInput & {
  media?: SanitizedMedia[]
}

export type GeneratedUgcVideoPrompt = {
  prompt: string
  negativePrompt?: string
}

const generatedPromptSchema = z.object({
  prompt: z
    .string()
    .describe('The full image-to-video prompt. One dense paragraph. No markdown.'),
  negativePrompt: z
    .string()
    .optional()
    .describe(
      'Short comma-separated negatives: identity drift, wrong product, extra text, extra people; talking clips: frozen mouth, teeth artifacts; product clips: label morph, warped text, extra fingers.',
    ),
})

const DEFAULT_ASPECT: AspectRatio = '9:16'

function asAspectRatio(value: string): AspectRatio {
  if (value === '1:1' || value === '16:9' || value === '4:3' || value === '9:16') return value
  return DEFAULT_ASPECT
}

export async function generateUgcVideoPrompt(
  input: GenerateUgcVideoPromptInput,
): Promise<GeneratedUgcVideoPrompt> {
  const media = input.media?.filter(item => item.imageUrl)
  const { model } = resolvePrompt(PROMPT_KEYS.ugcVideoPlanner)
  const userText = buildUgcVideoPromptUserPrompt(input)

  const result = await generateObject({
    model,
    schema: generatedPromptSchema,
    system: UGC_VIDEO_PROMPT_SYSTEM,
    temperature: 0.7,
    messages: buildImagePromptMessages(
      userText,
      media && media.length > 0 ? media : undefined,
      asAspectRatio(input.aspectRatio),
    ),
  })

  const prompt = result.object.prompt.trim()
  if (!prompt) {
    throw new Error('Video prompt model returned an empty prompt')
  }

  const negativePrompt = result.object.negativePrompt?.trim()

  return {
    prompt,
    ...(negativePrompt ? { negativePrompt } : {}),
  }
}
