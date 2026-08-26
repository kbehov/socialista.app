import type { AspectRatio } from '@socialista/types'

export type StaticAdAspectRatio = AspectRatio

export type SelectedProductImage = {
  url: string
  label?: string
  productId?: string
}

export type StaticAdGenerationInput = {
  prompt?: string
  workspaceId: string
  aspectRatio: StaticAdAspectRatio
  images?: Array<{
    url: string
    role?: 'product' | 'influencer' | 'template' | 'upload' | 'library'
    label?: string
  }>
  productImage?: string
  referenceImage?: string
  language: string
}
