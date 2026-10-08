import { ErrorState } from '@/components/common/error-state'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { InfluencerDetail } from '@/components/studio/influencers/influencer-detail'
import { deleteInfluencer, getInfluencer } from '@/services/influencer.service'
import { getModels } from '@/services/models.service'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { Metadata } from 'next'

type InfluencerPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: InfluencerPageProps): Promise<Metadata> {
  const { id } = await params
  const response = await getInfluencer(id)
  const name = response.data?.influencer?.name?.trim()
  return createDashboardMetadata(name || 'Influencer')
}

export default async function InfluencerPage({ params }: InfluencerPageProps) {
  const workspace = await getCurrentWorkspace()
  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view this influencer." />
  }

  const { id } = await params
  const [response, videoModelsRes, imageModelsRes] = await Promise.all([
    getInfluencer(id),
    getModels('limit=20&modelType=video&sort=-usageCount'),
    getModels('limit=20&modelType=image&sort=-usageCount'),
  ])

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

  return (
    <InfluencerDetail
      initialInfluencer={response.data.influencer}
      videoModels={videoModelsRes.data?.models ?? []}
      imageModels={imageModelsRes.data?.models ?? []}
      deleteAction={response.data.influencer.workspaceId ? deleteInfluencer : undefined}
    />
  )
}
