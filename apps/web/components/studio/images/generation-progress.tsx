'use client'

import { GenerationRunView } from '@/components/studio/generation/generation-run-view'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { Model } from '@socialista/types'

type GenerationProgressProps = {
  runId: string
  models: Model[]
}

export function GenerationProgress({ runId, models }: GenerationProgressProps) {
  return (
    <GenerationRunView
      backHref={DASHBOARD_ROUTES.STUDIO.IMAGES}
      contentKind="image"
      generatingTitle="Generating"
      models={models}
      previewHeadingId="generation-preview-heading"
      progressHeadingId="generation-progress-heading"
      retryLabel="Try another prompt"
      runId={runId}
      studioLabel="studio"
    />
  )
}
