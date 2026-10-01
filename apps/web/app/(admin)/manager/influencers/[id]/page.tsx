import { ErrorState } from '@/components/common/error-state'
import { InfluencerDetail } from '@/components/studio/influencers/influencer-detail'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import { getAdminInfluencer } from '@/services/influencer.service'
import { getModels } from '@/services/models.service'

type ManagerInfluencerPageProps = {
  params: Promise<{ id: string }>
}

export default async function ManagerInfluencerPage({ params }: ManagerInfluencerPageProps) {
  const { id } = await params
  const [response, videoModelsRes, imageModelsRes] = await Promise.all([
    getAdminInfluencer(id),
    getModels('limit=20&modelType=video&sort=-usageCount'),
    getModels('limit=20&modelType=image&sort=-usageCount'),
  ])

  if (!response.success || !response.data?.influencer) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6 sm:p-8">
        <ErrorState
          className="flex-1 rounded-xl"
          title={response.message ?? 'Influencer not found'}
          description="It may have been deleted."
        />
      </div>
    )
  }

  return (
    <InfluencerDetail
      initialInfluencer={response.data.influencer}
      videoModels={videoModelsRes.data?.models ?? []}
      imageModels={imageModelsRes.data?.models ?? []}
      readOnly
      backHref={MANAGER_ROUTES.INFLUENCERS}
      fetchInfluencer={getAdminInfluencer}
    />
  )
}
