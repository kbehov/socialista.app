import { generateObject } from 'ai'
import { z } from 'zod'
import { PROMPT_KEYS, type AspectRatio } from '@socialista/types'

import { resolvePrompt } from '../registry.js'
import { buildUgcVideoPlannerUserPrompt, type UgcVideoPlannerInput } from '../builders/ugc-video-planner.js'
import { buildImagePromptMessages } from '../builders/image.js'

export type PlanUgcVideoPromptInput = UgcVideoPlannerInput & {
  stillUrls: string[]
  systemOverride?: string
}

export type PlannedUgcVideoPrompt = {
  prompt: string
  negativePrompt?: string
}

const plannedPromptSchema = z.object({
  prompt: z
    .string()
    .describe('The full image-to-video prompt. One dense paragraph. No markdown.'),
  negativePrompt: z
    .string()
    .optional()
    .describe('Short comma-separated negatives: identity drift, wrong product, on-screen text, extra people.'),
})

const DEFAULT_ASPECT: AspectRatio = '9:16'

export async function planUgcVideoPrompt(input: PlanUgcVideoPromptInput): Promise<PlannedUgcVideoPrompt> {
  const stillUrls = input.stillUrls.filter(Boolean)
  const aspectRatio = (input.aspectRatio === '1:1' ||
  input.aspectRatio === '16:9' ||
  input.aspectRatio === '4:3' ||
  input.aspectRatio === '9:16'
    ? input.aspectRatio
    : DEFAULT_ASPECT) satisfies AspectRatio

  const media = stillUrls.map(imageUrl => ({ imageUrl }))
  const userText = buildUgcVideoPlannerUserPrompt(input)
  const { model, system } = resolvePrompt(PROMPT_KEYS.ugcVideoPlanner, input.systemOverride)

  const result = await generateObject({
    model,
    schema: plannedPromptSchema,
    system,
    temperature: 0.7,
    messages: buildImagePromptMessages(userText, media.length > 0 ? media : undefined, aspectRatio),
  })

  const prompt = result.object.prompt.trim()
  if (!prompt) {
    throw new Error('Video planner returned an empty prompt')
  }

  const negativePrompt = result.object.negativePrompt?.trim()

  return {
    prompt,
    ...(negativePrompt ? { negativePrompt } : {}),
  }
}
