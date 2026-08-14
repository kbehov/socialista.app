'use client'

import { GenerationRunView } from '@/components/studio/generation/generation-run-view'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { Model } from '@socialista/types'

type VideoGenerationProgressProps = {
  runId: string
  models: Model[]
}

export function VideoGenerationProgress({ runId, models }: VideoGenerationProgressProps) {
  return (
    <GenerationRunView
      backHref={DASHBOARD_ROUTES.STUDIO.VIDEOS}
      contentKind="video"
      generatingTitle="Generating video"
      models={models}
      previewHeadingId="video-generation-preview-heading"
      progressHeadingId="video-generation-progress-heading"
      retryLabel="Try another prompt"
      runId={runId}
      studioLabel="video studio"
    />
  )
}
