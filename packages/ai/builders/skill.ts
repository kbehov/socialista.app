import {
  PROMPT_KEY_LABELS,
  PROMPT_KEY_VALUES,
  type PromptKey,
  type SkillBrandContext,
} from '@socialista/types'

const TARGET_CATALOG = PROMPT_KEY_VALUES.map(
  key => `- ${key}: ${PROMPT_KEY_LABELS[key]}`,
).join('\n')

function formatBrandContext(brand: SkillBrandContext): string | undefined {
  const name = brand.name.trim()
  if (!name) return undefined

  const lines = [`- Name: ${name}`]
  const description = brand.description?.trim()
  if (description) lines.push(`- Description: ${description}`)
  const industry = brand.industry?.trim()
  if (industry) lines.push(`- Industry: ${industry}`)
  const website = brand.website?.trim()
  if (website) lines.push(`- Website: ${website}`)
  if (brand.colors?.length) lines.push(`- Colors: ${brand.colors.join(', ')}`)

  return `Brand context (lock these facts — do not invent additional brand claims):
${lines.join('\n')}`
}

export function buildSkillGenerationUserPrompt(
  description: string,
  target?: PromptKey,
  brand?: SkillBrandContext,
): string {
  const targetLine = target
    ? `Target tool (pinned by the user — do not change): ${target} (${PROMPT_KEY_LABELS[target]})`
    : 'Target tool: infer the best fit from the brief. Use exactly one of the keys listed below.'

  const brandBlock = brand ? formatBrandContext(brand) : undefined

  return `User brief:
"""
${description}
"""

${targetLine}
${brandBlock ? `\n${brandBlock}\n` : ''}
Valid targets:
${TARGET_CATALOG}

Write a complete replacement system prompt for that tool, plus name, description, and icon.`
}
