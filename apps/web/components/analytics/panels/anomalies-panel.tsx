import { ErrorState } from '@/components/common/error-state'
import { loadAnomalies } from '@/services/analytics.service'
import type { AnalyticsRange, SocialProvider } from '@socialista/types'

import { AnalyticsSection } from '../analytics-section'
import { AnomaliesList } from '../anomalies-list'

type AnomaliesPanelProps = {
  workspaceId: string
  range: AnalyticsRange
  provider?: SocialProvider | 'all'
  projectId?: string
}

export async function AnomaliesPanel({ workspaceId, range, provider, projectId }: AnomaliesPanelProps) {
  const { data, error } = await loadAnomalies({ workspaceId, range, projectId })

  if (error || !data) {
    return (
      <AnalyticsSection title="Anomalies" description="Spike and drop detection vs. baseline.">
        <ErrorState
          title="Couldn't load anomalies"
          description={error ?? 'Something went wrong while loading anomalies.'}
          minHeight="sm"
          className="py-6"
        />
      </AnalyticsSection>
    )
  }

  const anomalies =
    !provider || provider === 'all' ? data.anomalies : data.anomalies.filter(item => item.provider === provider)

  return <AnomaliesList anomalies={anomalies} />
}
