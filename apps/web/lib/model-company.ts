import type { Model } from '@socialista/types'

export function getModelCompanyName(model: Model): string {
  return model.company?.name ?? 'Other'
}
