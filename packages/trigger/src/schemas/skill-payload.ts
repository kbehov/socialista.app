import { z } from 'zod'

export const skillPayloadFields = {
  skillId: z.string().min(1).optional(),
  skillVariables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
}
