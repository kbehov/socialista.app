import type { UgcProductKind } from '@socialista/types'

export type UgcProductChange = {
  imageUrls: string[]
  productName?: string
  productId?: string | null
  productDescription?: string
  productUrl?: string | null
  productKind?: UgcProductKind | null
}

export type UgcPipeline = 'stills' | 'video' | 'audio'

export type UgcActiveRun = {
  key: string
  clipId?: string
  runId: string
  accessToken: string
  pipeline: UgcPipeline
  progress: number
  progressLabel: string
}

export type UgcWorkbenchTab = 'image' | 'audio' | 'video'

export type UgcWriteScriptOptions = {
  directions?: string
}

export type UgcWriteVideoPromptOptions = {
  directions?: string
  referenceImageUrl?: string
}

export type UgcPlanDraft = {
  influencerId: string
  description: string
  product: UgcProductChange
}

export type UgcClipRailRun = {
  progress: number
  label: string
}
