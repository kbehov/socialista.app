import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { InfluencerList } from '@/components/studio/influencers/influencer-list'
import { INFLUENCER_LIST_LIMIT } from '@/lib/studio/influencers/influencer-filters'
import { getWorkspaceInfluencers } from '@/services/influencer.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export default async function InfluencersPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view AI influencers." />
  }

  const response = await getWorkspaceInfluencers(workspace.id, {
    sort: 'newest',
    limit: INFLUENCER_LIST_LIMIT,
  })
  const influencers = response.data?.influencers ?? []
  const error = response.success ? null : (response.message ?? 'Failed to load influencers')

  return (
    <InfluencerList
      workspaceId={workspace.id}
      initialInfluencers={influencers}
      initialError={error}
      initialHasMore={Boolean(response.meta?.hasNextPage)}
      initialTotal={response.meta?.total}
    />
  )
}
