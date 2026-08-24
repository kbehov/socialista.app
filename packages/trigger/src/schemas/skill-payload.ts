import { z } from 'zod'

export const skillPayloadFields = {
  skillId: z.string().min(1).optional(),
}
