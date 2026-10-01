import {
  SKILL_TARGET_LABELS,
  SKILL_TARGET_VALUES,
  type SkillTarget,
  type SkillBrandContext,
} from '@socialista/types'

const TARGET_CATALOG = SKILL_TARGET_VALUES.map(
  key => `- ${key}: ${SKILL_TARGET_LABELS[key]}`,
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
  target?: SkillTarget,
  brand?: SkillBrandContext,
): string {
  const targetLine = target
    ? `Target tool (pinned by the user — do not change): ${target} (${SKILL_TARGET_LABELS[target]})`
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
