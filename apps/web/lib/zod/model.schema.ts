import { CostUnit, ModelType } from '@socialista/types'
import { z } from 'zod'

export { MODEL_TYPE_OPTIONS } from '@/lib/model-type'

export const COST_UNIT_OPTIONS = [
  { value: CostUnit.TOKENS, label: 'Tokens' },
  { value: CostUnit.PER_GENERATION, label: 'Per generation' },
  { value: CostUnit.PER_SECOND, label: 'Per second' },
] as const

export const createModelSchema = z.object({
  chef: z.string().trim().min(1, 'Chef is required').max(100, 'Chef must be 100 characters or less'),
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  value: z.string().trim().min(1, 'Value is required').max(100, 'Value must be 100 characters or less'),
  cost: z
    .string()
    .trim()
    .min(1, 'Cost is required')
    .refine(value => !Number.isNaN(Number(value)) && Number(value) > 0, 'Cost must be greater than 0'),
  costUnit: z.nativeEnum(CostUnit, { message: 'Cost unit is required' }),
  modelType: z.nativeEnum(ModelType, { message: 'Model type is required' }),
  modelProvider: z.string().trim().min(1, 'Provider is required').max(100, 'Provider must be 100 characters or less'),
})

export type CreateModelFormValues = z.infer<typeof createModelSchema>
