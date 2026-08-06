import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { InfluencerList } from '@/components/studio/influencers/influencer-list'
import { getWorkspaceInfluencers } from '@/services/influencer.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export default async function InfluencersPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view AI influencers." />
  }

  const response = await getWorkspaceInfluencers(workspace.id, { sort: 'newest', limit: 48 })
  const influencers = response.data?.influencers ?? []
  const error = response.success ? null : (response.message ?? 'Failed to load influencers')

  return (
    <InfluencerList
      workspaceId={workspace.id}
      initialInfluencers={influencers}
      initialError={error}
    />
  )
}
