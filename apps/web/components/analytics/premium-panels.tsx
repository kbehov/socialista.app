import { cache } from 'react'

import {
  getAnalyticsAnomalies,
  getAnalyticsGrowth,
  getAnalyticsPlatforms,
} from '@/services/analytics.service'
import type {
  AnalyticsOverviewResponse,
  AnalyticsRange,
  ApiResponse,
  SocialProvider,
} from '@socialista/types'

import { AnomaliesList } from './anomalies-list'
import { AnalyticsSection } from './analytics-section'
import { GrowthChart } from './growth-chart'
import { PlatformSummary } from './platform-summary'
import { PlatformsBreakdown } from './platforms-breakdown'

const loadGrowth = cache((workspaceId: string, range: AnalyticsRange) =>
  getAnalyticsGrowth(workspaceId, { range }),
)

const loadPlatforms = cache((workspaceId: string, range: AnalyticsRange) =>
  getAnalyticsPlatforms(workspaceId, { range }),
)

const loadAnomalies = cache((workspaceId: string, range: AnalyticsRange) =>
  getAnalyticsAnomalies(workspaceId, { range }),
)

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

async function loadAnalytics<T>(
  load: () => Promise<ApiResponse<T>>,
  fallback: string,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, success, message } = await load()
    if (!success || !data) {
      return { data: null, error: message ?? fallback }
    }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: errorMessage(error, fallback) }
  }
}

async function GrowthPanel({
  workspaceId,
  range,
  provider,
}: {
  workspaceId: string
  range: AnalyticsRange
  provider?: SocialProvider | 'all'
}) {
  const { data, error } = await loadAnalytics(
    () => loadGrowth(workspaceId, range),
    'Failed to load growth data.',
  )

  if (error || !data) {
    return (
      <AnalyticsSection title="Growth Performance">
        <p className="py-8 text-center text-sm text-destructive">
          {error ?? 'Failed to load growth data.'}
        </p>
      </AnalyticsSection>
    )
  }

  return <GrowthChart data={data} provider={provider} />
}

async function PlatformsPanel({
  workspaceId,
  range,
  overview,
  provider,
}: {
  workspaceId: string
  range: AnalyticsRange
  overview: AnalyticsOverviewResponse
  provider?: SocialProvider | 'all'
}) {
  const { data, error } = await loadAnalytics(
    () => loadPlatforms(workspaceId, range),
    'Failed to load platform data.',
  )

  if (error || !data) {
    return (
      <PlatformsBreakdown
        data={{
          range,
          period: overview.period,
          platforms: [],
        }}
        overview={overview}
        provider={provider}
        error={error ?? 'Failed to load platform data.'}
      />
    )
  }

  return <PlatformsBreakdown data={data} overview={overview} provider={provider} />
}

async function AnomaliesPanel({
  workspaceId,
  range,
  provider,
}: {
  workspaceId: string
  range: AnalyticsRange
  provider?: SocialProvider | 'all'
}) {
  const { data, error } = await loadAnalytics(
    () => loadAnomalies(workspaceId, range),
    'Failed to load anomalies.',
  )

  if (error || !data) {
    return (
      <AnomaliesList anomalies={[]} error={error ?? 'Failed to load anomalies.'} />
    )
  }

  const anomalies =
    !provider || provider === 'all'
      ? data.anomalies
      : data.anomalies.filter(item => item.provider === provider)

  return <AnomaliesList anomalies={anomalies} />
}

async function PlatformSummaryPanel({
  workspaceId,
  range,
  overview,
  provider,
}: {
  workspaceId: string
  range: AnalyticsRange
  overview: AnalyticsOverviewResponse
  provider?: SocialProvider | 'all'
}) {
  const { data } = await loadAnalytics(
    () => loadGrowth(workspaceId, range),
    'Failed to load growth data.',
  )

  return <PlatformSummary overview={overview} growth={data} provider={provider} />
}

export { AnomaliesPanel, GrowthPanel, PlatformSummaryPanel, PlatformsPanel }
