import { cache } from 'react'

import { getWorkspacePublishedActivity } from '@/services/post.service'
import type { PublishedPostActivityResponse, SocialProvider } from '@socialista/types'

import { AnalyticsSection } from './analytics-section'
import { PublishedActivity } from './published-activity'

const loadPublishedActivity = cache((workspaceId: string, provider?: SocialProvider) =>
  getWorkspacePublishedActivity(workspaceId, {
    days: 365,
    provider,
  }),
)

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

async function PublishedActivityPanel({
  workspaceId,
  provider = 'all',
}: {
  workspaceId: string
  provider?: SocialProvider | 'all'
}) {
  let data: PublishedPostActivityResponse | null = null
  let error: string | null = null

  try {
    const response = await loadPublishedActivity(
      workspaceId,
      provider === 'all' ? undefined : provider,
    )

    if (!response.success || !response.data) {
      error = response.message ?? 'Failed to load publishing activity.'
    } else {
      data = response.data
    }
  } catch (caught) {
    error = errorMessage(caught, 'Failed to load publishing activity.')
  }

  if (error) {
    return (
      <AnalyticsSection title="Publishing Activity" className="min-h-48">
        <p className="py-8 text-center text-sm text-destructive">{error}</p>
      </AnalyticsSection>
    )
  }

  return <PublishedActivity data={data!} />
}

export { PublishedActivityPanel }
