import { ErrorState } from '@/components/common/error-state'
import { loadGrowth } from '@/services/analytics.service'
import type { AnalyticsRange, SocialProvider } from '@socialista/types'

import { AnalyticsSection } from '../analytics-section'
import { GrowthChart } from '../growth-chart'

type GrowthPanelProps = {
  workspaceId: string
  range: AnalyticsRange
  provider?: SocialProvider | 'all'
}

export async function GrowthPanel({ workspaceId, range, provider }: GrowthPanelProps) {
  const { data, error } = await loadGrowth({ workspaceId, range })

  if (error || !data) {
    return (
      <AnalyticsSection title="Growth" description="Trends for the selected range." className="h-full">
        <ErrorState
          title="Couldn't load growth"
          description={error ?? 'Something went wrong while loading growth data.'}
          minHeight="sm"
          className="py-6"
        />
      </AnalyticsSection>
    )
  }

  return <GrowthChart data={data} provider={provider} />
}
