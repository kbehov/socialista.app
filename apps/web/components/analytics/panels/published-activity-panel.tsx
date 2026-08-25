import type { SocialProvider } from '@socialista/types'

import { ErrorState } from '@/components/common/error-state'
import { loadPublishedActivity } from '@/services/analytics.service'

import { AnalyticsSection } from '../analytics-section'
import { PublishedActivity } from '../published-activity'

type PublishedActivityPanelProps = {
  workspaceId: string
  provider?: SocialProvider | 'all'
  projectId?: string
}

export async function PublishedActivityPanel({
  workspaceId,
  provider = 'all',
  projectId,
}: PublishedActivityPanelProps) {
  const { data, error } = await loadPublishedActivity({
    workspaceId,
    provider: provider === 'all' ? undefined : provider,
    projectId,
  })

  if (error || !data) {
    return (
      <AnalyticsSection title="Publishing Activity">
        <ErrorState
          title="Couldn't load activity"
          description={error ?? 'Something went wrong while loading publishing activity.'}
          minHeight="sm"
          className="py-6"
        />
      </AnalyticsSection>
    )
  }

  return <PublishedActivity data={data} />
}
