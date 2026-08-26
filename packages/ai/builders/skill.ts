import { PROMPT_KEY_LABELS, PROMPT_KEY_VALUES, type PromptKey } from '@socialista/types'

const TARGET_CATALOG = PROMPT_KEY_VALUES.map(
  key => `- ${key}: ${PROMPT_KEY_LABELS[key]}`,
).join('\n')

export function buildSkillGenerationUserPrompt(description: string, target?: PromptKey): string {
  const targetLine = target
    ? `Target tool (pinned by the user — do not change): ${target} (${PROMPT_KEY_LABELS[target]})`
    : 'Target tool: infer the best fit from the brief. Use exactly one of the keys listed below.'

  return `User brief:
"""
${description}
"""

${targetLine}

Valid targets:
${TARGET_CATALOG}

Write a complete replacement system prompt for that tool, plus name, description, and icon.`
}
