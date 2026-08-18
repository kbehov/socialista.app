import { z } from 'zod'

export const skillCategoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be 80 characters or less'),
  description: z.string().trim().max(400, 'Description must be 400 characters or less'),
  icon: z.string().trim().max(16, 'Icon must be 16 characters or less'),
  sortOrder: z.number().int().min(0, 'Sort order must be 0 or greater'),
  status: z.enum(['active', 'archived']),
})

export const skillVariableFormSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, 'Key is required')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Use a letter, then letters, numbers, or underscores'),
  label: z.string().trim().min(1, 'Label is required').max(80, 'Label must be 80 characters or less'),
})

export const skillFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be 80 characters or less'),
  description: z.string().trim().max(400, 'Description must be 400 characters or less'),
  categoryId: z.string().min(1, 'Category is required'),
  binding: z.enum(['image', 'video', 'text']),
  status: z.enum(['draft', 'published', 'archived']),
  icon: z.string().trim().max(16, 'Icon must be 16 characters or less'),
  content: z.string().refine(value => value.trim().length > 0, 'Content is required'),
  variables: z.array(skillVariableFormSchema),
})

export type SkillCategoryFormValues = z.infer<typeof skillCategoryFormSchema>
export type SkillFormValues = z.infer<typeof skillFormSchema>
