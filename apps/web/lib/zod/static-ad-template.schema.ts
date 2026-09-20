import { z } from 'zod'

export const createStaticAdTemplateSchema = z
  .object({
    imageSource: z.enum(['upload', 'url']),
    imageUrl: z.string().trim(),
    categories: z.array(z.string()).min(1, 'Select at least one category'),
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
        message: 'Enter a valid image URL',
      })
    }
  })

export const createStaticAdTemplateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
})

export type CreateStaticAdTemplateFormValues = z.infer<typeof createStaticAdTemplateSchema>
export type CreateStaticAdTemplateCategoryFormValues = z.infer<typeof createStaticAdTemplateCategorySchema>
