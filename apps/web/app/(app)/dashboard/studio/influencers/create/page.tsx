import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { InfluencerCreateWorkspace } from '@/components/studio/influencers/influencer-create-workspace'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export default async function CreateInfluencerPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to create an AI influencer." />
  }

  return <InfluencerCreateWorkspace workspaceId={workspace.id} />
}
