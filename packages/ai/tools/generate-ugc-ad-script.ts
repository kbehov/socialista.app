import { generateText } from 'ai'
import { UGC_SCRIPT_MAX_CHARS, clampUgcScript, PROMPT_KEYS } from '@socialista/types'

import { resolvePrompt } from '../registry.js'
import { buildUgcAdScriptUserPrompt, type UgcAdScriptPromptInput } from '../builders/ugc-ad-script.js'

export type GenerateUgcAdScriptInput = UgcAdScriptPromptInput & {
  systemOverride?: string
}

export async function generateUgcAdScript(input: GenerateUgcAdScriptInput): Promise<string> {
  const { model, system } = resolvePrompt(PROMPT_KEYS.ugcAdScript, input.systemOverride)
  const result = await generateText({
    model,
    system,
    temperature: 0.85,
    prompt: buildUgcAdScriptUserPrompt(input),
  })

  const text = result.text.trim()
  if (!text) {
    throw new Error('Script model returned empty text')
  }

  return clampUgcScript(text.replace(/^["']|["']$/g, '').slice(0, UGC_SCRIPT_MAX_CHARS))
}
