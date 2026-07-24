import { generateObject, generateText } from 'ai'
import { unstable_noStore as noStore } from 'next/cache'
import { z } from 'zod'

import {
  buildIntentClassifierPrompt,
  buildPostCopywritingUserPrompt,
  POST_COPY_INTENT_CLASSIFIER_SYSTEM,
  POST_COPYWRITING_SYSTEM,
} from '../prompts/copywriting'

export const POST_COPY_TONES = [
  'playful',
  'professional',
  'authoritative',
  'inspirational',
  'conversational',
  'edgy',
  'minimal',
  'witty',
] as const

export const POST_COPY_GOALS = ['engagement', 'saves', 'link_clicks', 'awareness', 'comments'] as const

/** Detected from the user's brief — drives which writing playbook we use. */
export const POST_COPY_INTENTS = [
  'ecommerce_promo',
  'product_launch',
  'educational',
  'funny',
  'inspirational',
  'story',
  'engagement',
  'brand_awareness',
  'announcement',
] as const

export const PostCopyToneSchema = z.enum(POST_COPY_TONES)
export const PostCopyGoalSchema = z.enum(POST_COPY_GOALS)
export const PostCopyIntentSchema = z.enum(POST_COPY_INTENTS)

export type PostCopyTone = z.infer<typeof PostCopyToneSchema>
export type PostCopyGoal = z.infer<typeof PostCopyGoalSchema>
export type PostCopyIntent = z.infer<typeof PostCopyIntentSchema>

export const PostCopyIntentClassificationSchema = z.object({
  intent: PostCopyIntentSchema,
  confidence: z.enum(['high', 'medium', 'low']),
  reason: z.string().trim().max(160).describe('One short sentence on why this intent fits the brief'),
})

export type PostCopyIntentClassification = z.infer<typeof PostCopyIntentClassificationSchema>

export const PostCopywriterInputSchema = z.object({
  directions: z.string().trim().min(1, 'Directions are required'),
  tone: PostCopyToneSchema,
  goal: PostCopyGoalSchema,
  platforms: z.array(z.string()).min(1, 'At least one platform is required'),
  captionMax: z.number().positive().optional(),
  visualDescription: z.string().optional(),
  brandContext: z.string().optional(),
  includeHashtags: z.boolean().optional(),
  existingCaption: z.string().optional(),
  mediaSummary: z.string().optional(),
  previousAttempt: z.string().optional(),
})

export type PostCopywriterInput = z.infer<typeof PostCopywriterInputSchema>

const POST_COPY_MODEL = 'openai/gpt-5.5-mini'

/** Creative enough for unexpected hooks; penalties dampen cliché loops. */
const POST_COPY_TEMPERATURE = 0.95
const POST_COPY_PRESENCE_PENALTY = 0.35
const POST_COPY_FREQUENCY_PENALTY = 0.4

const INTENT_CLASSIFIER_TEMPERATURE = 0.2

export async function classifyPostCopyIntent(input: PostCopywriterInput): Promise<PostCopyIntentClassification> {
  const result = await generateObject({
    model: POST_COPY_MODEL,
    schema: PostCopyIntentClassificationSchema,
    system: POST_COPY_INTENT_CLASSIFIER_SYSTEM,
    prompt: buildIntentClassifierPrompt(input),
    temperature: INTENT_CLASSIFIER_TEMPERATURE,
  })

  return result.object
}

export async function generatePostCopy(input: PostCopywriterInput): Promise<string> {
  noStore()
  const validated = PostCopywriterInputSchema.parse(input)

  const { intent } = await classifyPostCopyIntent(validated)

  const result = await generateText({
    model: POST_COPY_MODEL,
    system: POST_COPYWRITING_SYSTEM,
    prompt: buildPostCopywritingUserPrompt(validated, intent),
    temperature: POST_COPY_TEMPERATURE,
    presencePenalty: POST_COPY_PRESENCE_PENALTY,
    frequencyPenalty: POST_COPY_FREQUENCY_PENALTY,
  })

  const text = result.text.trim()
  if (!text) {
    throw new Error('No caption was generated')
  }

  return text
}
