import type { UgcProductChange } from '@/types/ugc.types'
import type { UgcProject } from '@socialista/types'

export const UGC_PLAN_STEPS = [
  { label: 'Reading the creator and product', description: 'Locking identity from the photos' },
  { label: 'Picking the angle', description: 'Format, hook, and who it is for' },
  { label: 'Writing the scenes', description: 'Scripts, stills, and motion prompts' },
] as const

export function productFromProject(project: UgcProject): UgcProductChange {
  return {
    imageUrls: project.productImageUrls,
    productName: project.productName,
    productId: project.productId ?? null,
    productDescription: project.productDescription,
    productUrl: project.productUrl ?? null,
    productKind: project.productKind ?? null,
  }
}

export function ugcPlanStepStatus(
  index: number,
  activeIndex: number,
  done: boolean,
): 'complete' | 'active' | 'pending' {
  if (done) return 'complete'
  if (index < activeIndex) return 'complete'
  if (index === activeIndex) return 'active'
  return 'pending'
}
