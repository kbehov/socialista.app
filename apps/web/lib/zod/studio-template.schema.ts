import { z } from 'zod'

export const createStudioTemplateSchema = z
  .object({
    kind: z.enum(['image', 'video']),
    imageSource: z.enum(['upload', 'url']),
    imageUrl: z.string().trim(),
    categories: z.array(z.string()).min(1, 'Select at least one category'),
    prompt: z.string().trim().max(4000, 'Prompt must be 4000 characters or less').optional(),
    name: z.string().trim().max(120, 'Name must be 120 characters or less').optional(),
  })
  .superRefine((values, ctx) => {
    if (values.imageSource !== 'url') return
    try {
      const parsed = new URL(values.imageUrl)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('invalid')
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageUrl'],
        message: values.kind === 'video' ? 'Enter a valid video or image URL' : 'Enter a valid image URL',
      })
    }
  })

export const createStudioTemplateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
})

export const updateStudioTemplateCategorySchema = createStudioTemplateCategorySchema

export type CreateStudioTemplateFormValues = z.infer<typeof createStudioTemplateSchema>
export type CreateStudioTemplateCategoryFormValues = z.infer<typeof createStudioTemplateCategorySchema>
export type UpdateStudioTemplateCategoryFormValues = z.infer<typeof updateStudioTemplateCategorySchema>
