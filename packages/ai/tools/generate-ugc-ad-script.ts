import { generateText } from 'ai'
import { UGC_SCRIPT_MAX_CHARS, clampUgcScript } from '@socialista/types'

import {
  buildUgcAdScriptSystem,
  buildUgcAdScriptUserPrompt,
  type UgcAdScriptPromptInput,
} from '../prompts/ugc-ad-script-prompt.js'

export type GenerateUgcAdScriptInput = UgcAdScriptPromptInput & {
  model: string
}

export async function generateUgcAdScript(input: GenerateUgcAdScriptInput): Promise<string> {
  const result = await generateText({
    model: input.model,
    system: buildUgcAdScriptSystem(input.durationSec),
    temperature: 0.85,
    prompt: buildUgcAdScriptUserPrompt(input),
  })

  const text = result.text.trim()
  if (!text) {
    throw new Error('Script model returned empty text')
  }

  return clampUgcScript(text.replace(/^["']|["']$/g, '').slice(0, UGC_SCRIPT_MAX_CHARS))
}
