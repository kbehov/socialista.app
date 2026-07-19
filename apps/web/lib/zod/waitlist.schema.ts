import { z } from 'zod'

export const waitlistSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  website: z.string().optional(),
})

export type WaitlistSchemaType = z.infer<typeof waitlistSchema>
