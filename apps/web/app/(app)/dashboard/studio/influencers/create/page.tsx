import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { InfluencerCreateWorkspace } from '@/components/studio/influencers/influencer-create-workspace'
import { getModels } from '@/services/models.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { ContextSupport } from '@socialista/types'

const INFLUENCER_MODELS_QUERY =
  'limit=50&modelType=image&contextSupports=image&sort=-usageCount'

function safeStudioReturnTo(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (!value.startsWith('/dashboard/studio/')) return undefined
  if (value.includes('://') || value.startsWith('//')) return undefined
  return value
}

export default async function CreateInfluencerPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const workspace = await getCurrentWorkspace()
  const params = await searchParams

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to create an AI influencer." />
  }

  const { data } = await getModels(INFLUENCER_MODELS_QUERY)
  const models = (data?.models ?? []).filter(model =>
    model.contextSupports?.includes(ContextSupport.IMAGE),
  )

  return (
    <InfluencerCreateWorkspace
      workspaceId={workspace.id}
      models={models}
      returnTo={safeStudioReturnTo(params.returnTo)}
    />
  )
}
