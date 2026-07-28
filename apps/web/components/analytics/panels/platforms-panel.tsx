import { ErrorState } from '@/components/common/error-state'
import { loadPlatforms } from '@/services/analytics.service'
import type { AnalyticsOverviewResponse, AnalyticsRange, SocialProvider } from '@socialista/types'

import { AnalyticsSection } from '../analytics-section'
import { PlatformsBreakdown } from '../platforms-breakdown'

type PlatformsPanelProps = {
  workspaceId: string
  range: AnalyticsRange
  provider?: SocialProvider | 'all'
  overview: AnalyticsOverviewResponse
}

export async function PlatformsPanel({ workspaceId, range, provider, overview }: PlatformsPanelProps) {
  const { data, error } = await loadPlatforms({ workspaceId, range })

  if (error || !data) {
    return (
      <AnalyticsSection title="Platform Breakdown" description="Performance by provider.">
        <ErrorState
          title="Couldn't load platforms"
          description={error ?? 'Something went wrong while loading platform breakdown.'}
          minHeight="sm"
          className="py-6"
        />
      </AnalyticsSection>
    )
  }

  return <PlatformsBreakdown data={data} overview={overview} provider={provider} />
}
