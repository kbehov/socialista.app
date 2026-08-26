import { PROMPT_KEY_VALUES } from '@socialista/types'
import { z } from 'zod'

export const skillGeneratedSchema = z.object({
  name: z
    .string()
    .describe('Short skill name, max 80 characters. Title case. No emoji.'),
  description: z
    .string()
    .describe('One or two sentences, max 400 characters. What this skill does when attached.'),
  target: z
    .enum(PROMPT_KEY_VALUES)
    .describe('Which generation tool this skill replaces. Must be one of the valid PromptKey values.'),
  icon: z.string().describe('A single emoji that represents the skill.'),
  content: z
    .string()
    .describe(
      'Complete markdown system prompt. Headings, lists, quotes, code, and dividers only. No YAML frontmatter, no JSX.',
    ),
})

export type SkillGenerated = z.infer<typeof skillGeneratedSchema>
