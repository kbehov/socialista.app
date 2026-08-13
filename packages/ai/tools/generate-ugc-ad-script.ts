import { generateText } from 'ai'

import {
  buildUgcAdScriptUserPrompt,
  UGC_AD_SCRIPT_SYSTEM,
  type UgcAdScriptPromptInput,
} from '../prompts/ugc-ad-script-prompt.js'

export type GenerateUgcAdScriptInput = UgcAdScriptPromptInput & {
  model: string
}

export async function generateUgcAdScript(input: GenerateUgcAdScriptInput): Promise<string> {
  const result = await generateText({
    model: input.model,
    system: UGC_AD_SCRIPT_SYSTEM,
    temperature: 0.85,
    prompt: buildUgcAdScriptUserPrompt(input),
  })

  const text = result.text.trim()
  if (!text) {
    throw new Error('Script model returned empty text')
  }

  return text.replace(/^["']|["']$/g, '')
}
