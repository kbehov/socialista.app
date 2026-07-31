import type { SanitizedMedia } from '@socialista/types'
import type { ModelMessage } from 'ai'
import { generateText } from 'ai'
import { generateImagePromptSystemMessage } from '../prompts/image-prompts.js'
import { buildImagePromptMessages } from './build-messages.js'
// Improve the prompt for image generation
export const buildImagePrompt = async (payload: { prompt: string; media: SanitizedMedia[] }) => {
  const enhanced = await generateText({
    model: 'openai/gpt-5.6-luna',
    system: generateImagePromptSystemMessage,
    messages: buildImagePromptMessages(payload.prompt, payload.media) as ModelMessage[],
  })
  return enhanced.text
}
