import { ErrorState } from '@/components/common/error-state'
import { loadAccountPerformance } from '@/services/analytics.service'
import type { AnalyticsAccountPerformanceRankBy, AnalyticsRange, SocialProvider } from '@socialista/types'

import { AccountPerformance } from '../account-performance'
import { AnalyticsSection } from '../analytics-section'

type AccountPerformancePanelProps = {
  workspaceId: string
  range: AnalyticsRange
  rankBy?: AnalyticsAccountPerformanceRankBy
  provider?: SocialProvider | 'all'
}

export async function AccountPerformancePanel({
  workspaceId,
  range,
  rankBy = 'followerGrowth',
  provider,
}: AccountPerformancePanelProps) {
  const { data, error } = await loadAccountPerformance({
    workspaceId,
    range,
    rankBy,
    limit: 5,
  })

  if (error || !data) {
    return (
      <AnalyticsSection title="Top movers" description="Biggest wins and losses this period.">
        <ErrorState
          title="Couldn't load account performance"
          description={error ?? 'Something went wrong while loading top movers.'}
          minHeight="sm"
          className="py-6"
        />
      </AnalyticsSection>
    )
  }

  return <AccountPerformance data={data} range={range} provider={provider} />
}
