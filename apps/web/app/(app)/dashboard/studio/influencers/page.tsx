import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { InfluencerList } from '@/components/studio/influencers/influencer-list'
import { INFLUENCER_LIST_LIMIT } from '@/lib/studio/influencers/influencer-filters'
import { getWorkspaceInfluencers } from '@/services/influencer.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'

export default async function InfluencersPage() {
  const { workspace, project } = await getCurrentWorkspaceContext()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view AI influencers." />
  }

  const response = await getWorkspaceInfluencers(workspace.id, {
    sort: 'newest',
    limit: INFLUENCER_LIST_LIMIT,
    projectId: project?.id,
  })
  const influencers = response.data?.influencers ?? []
  const error = response.success ? null : (response.message ?? 'Failed to load influencers')

  return (
    <InfluencerList
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      initialInfluencers={influencers}
      initialError={error}
      initialHasMore={Boolean(response.meta?.hasNextPage)}
      initialTotal={response.meta?.total}
    />
  )
}
