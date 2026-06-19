import { z } from 'zod'

export const inspirationCreationSchema = z.object({
  url: z.string().url('Invalid URL'),
  contentType: z.string().optional(),
  images: z.array(z.string()).optional(),
  video: z.string().optional(),
  categories: z.array(z.string()).optional(),
  niches: z.array(z.string()).optional(),
  stats: z
    .object({
      likes: z.number(),
      views: z.number(),
      comments: z.number(),
      shares: z.number(),
    })
    .optional(),
})

export const inspirationCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  icon: z.string().trim().max(100, 'Icon must be 100 characters or less').optional(),
})

export const inspirationNicheSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  icon: z.string().trim().max(100, 'Icon must be 100 characters or less').optional(),
})

export type InspirationCreation = z.infer<typeof inspirationCreationSchema>
export type InspirationCategoryFormValues = z.infer<typeof inspirationCategorySchema>
export type InspirationNicheFormValues = z.infer<typeof inspirationNicheSchema>
