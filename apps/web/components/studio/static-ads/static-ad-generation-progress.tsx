'use client'

import { GenerationRunView } from '@/components/studio/generation/generation-run-view'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'

type StaticAdGenerationProgressProps = {
  runId: string
}

export function StaticAdGenerationProgress({ runId }: StaticAdGenerationProgressProps) {
  return (
    <GenerationRunView
      backHref={DASHBOARD_ROUTES.STUDIO.STATIC_ADS}
      contentKind="ad"
      generatingTitle="Generating static ad"
      previewHeadingId="static-ad-preview-heading"
      progressHeadingId="static-ad-progress-heading"
      retryLabel="Create another ad"
      runId={runId}
      studioLabel="Static ads"
    />
  )
}
