import { generateObject } from 'ai'
import { z } from 'zod'

import {
  buildUgcVideoPlannerUserPrompt,
  UGC_VIDEO_PLANNER_SYSTEM,
  type UgcVideoPlannerInput,
} from '../prompts/ugc-video-planner-prompt.js'
import { buildImagePromptMessages } from '../utils/build-messages.js'
import type { AspectRatio } from '@socialista/types'

export type PlanUgcVideoPromptInput = UgcVideoPlannerInput & {
  stillUrls: string[]
  plannerModel: string
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

  const result = await generateObject({
    model: input.plannerModel,
    schema: plannedPromptSchema,
    system: UGC_VIDEO_PLANNER_SYSTEM,
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
