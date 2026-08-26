import type { GenerateSkillInput, GenerateSkillResult, PromptKey } from '@socialista/types'
import { PROMPT_KEY_VALUES } from '@socialista/types'
import { generateObject } from 'ai'

import { buildSkillGenerationUserPrompt } from '../builders/skill.js'
import { SKILL_GENERATION_SYSTEM } from '../prompts/skill.js'
import { skillGeneratedSchema } from '../schemas/skill-generation.js'

const SKILL_GENERATION_MODEL = 'anthropic/claude-sonnet-4.6'
const DEFAULT_TARGET: PromptKey = 'image-prompt'
const MAX_NAME = 80
const MAX_DESCRIPTION = 400
const MAX_ICON = 16

const TARGETS = new Set<PromptKey>(PROMPT_KEY_VALUES)
const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/

function asTarget(value: string): PromptKey {
  if (TARGETS.has(value as PromptKey)) return value as PromptKey
  return DEFAULT_TARGET
}

function stripFrontmatter(markdown: string): string {
  const trimmed = markdown.trim()
  const match = trimmed.match(FRONTMATTER_RE)
  if (!match) return trimmed
  return trimmed.slice(match[0].length).trim()
}

function clamp(value: string, max: number): string {
  if (value.length <= max) return value
  return value.slice(0, max).trim()
}

export async function generateSkill({
  description,
  target,
  model,
}: GenerateSkillInput): Promise<GenerateSkillResult> {
  const trimmed = description.trim()
  if (!trimmed) {
    throw new Error('Description is required')
  }

  const pinnedTarget = target ? asTarget(target) : undefined
  const resolvedModel = model?.trim() || SKILL_GENERATION_MODEL
  const result = await generateObject({
    model: resolvedModel,
    schema: skillGeneratedSchema,
    system: SKILL_GENERATION_SYSTEM,
    temperature: 0.6,
    prompt: buildSkillGenerationUserPrompt(trimmed, pinnedTarget),
  })

  const content = stripFrontmatter(result.object.content)
  if (!content) {
    throw new Error('Generated skill content is empty')
  }

  const name = clamp(result.object.name.trim(), MAX_NAME) || 'Untitled skill'
  const skillDescription = clamp(result.object.description.trim(), MAX_DESCRIPTION)
  const icon = clamp(result.object.icon.trim(), MAX_ICON)
  const resolvedTarget = pinnedTarget ?? asTarget(result.object.target)

  return {
    name,
    description: skillDescription,
    target: resolvedTarget,
    icon,
    content,
  }
}
