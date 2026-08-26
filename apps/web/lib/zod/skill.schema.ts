import { countWords, PROMPT_KEY_VALUES, SKILL_CONTENT_MAX_WORDS } from '@socialista/types'
import { z } from 'zod'

const maxWordsLabel = SKILL_CONTENT_MAX_WORDS.toLocaleString('en-US')

export const skillFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be 80 characters or less'),
  description: z.string().trim().max(400, 'Description must be 400 characters or less'),
  target: z.enum(PROMPT_KEY_VALUES),
  icon: z.string().trim().max(16, 'Icon must be 16 characters or less'),
  content: z
    .string()
    .refine(value => value.trim().length > 0, 'Instructions are required')
    .refine(
      value => countWords(value) <= SKILL_CONTENT_MAX_WORDS,
      `Instructions must be ${maxWordsLabel} words or less`,
    ),
})

export type SkillFormValues = z.infer<typeof skillFormSchema>
