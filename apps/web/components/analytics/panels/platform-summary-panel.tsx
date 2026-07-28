import { ErrorState } from '@/components/common/error-state'
import { loadGrowth } from '@/services/analytics.service'
import type { AnalyticsOverviewResponse, AnalyticsRange, SocialProvider } from '@socialista/types'

import { AnalyticsSection } from '../analytics-section'
import { PlatformSummary } from '../platform-summary'

type PlatformSummaryPanelProps = {
  workspaceId: string
  range: AnalyticsRange
  overview: AnalyticsOverviewResponse
  provider?: SocialProvider | 'all'
}

export async function PlatformSummaryPanel({
  workspaceId,
  range,
  overview,
  provider,
}: PlatformSummaryPanelProps) {
  const { data, error } = await loadGrowth({ workspaceId, range })

  if (error || !data) {
    return (
      <AnalyticsSection title="Platforms" description="Audience by network." className="h-full">
        <ErrorState
          title="Couldn't load platforms"
          description={error ?? 'Something went wrong while loading platform data.'}
          minHeight="sm"
          className="py-6"
        />
      </AnalyticsSection>
    )
  }

  return <PlatformSummary overview={overview} growth={data} provider={provider} />
}
