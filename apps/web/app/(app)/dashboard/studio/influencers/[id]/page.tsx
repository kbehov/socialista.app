import { ErrorState } from '@/components/common/error-state'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { InfluencerDetail } from '@/components/studio/influencers/influencer-detail'
import { getInfluencer } from '@/services/influencer.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

type InfluencerPageProps = {
  params: Promise<{ id: string }>
}

export default async function InfluencerPage({ params }: InfluencerPageProps) {
  const workspace = await getCurrentWorkspace()
  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view this influencer." />
  }

  const { id } = await params
  const response = await getInfluencer(id)

  if (!response.success || !response.data?.influencer) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6 sm:p-8">
        <ErrorState
          className="flex-1 rounded-xl"
          title={response.message ?? 'Influencer not found'}
          description="It may have been deleted, or you don’t have access."
        />
      </div>
    )
  }

  return <InfluencerDetail initialInfluencer={response.data.influencer} />
}
