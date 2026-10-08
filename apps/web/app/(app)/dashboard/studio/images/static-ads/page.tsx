import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { StaticAdStudioWorkspace } from '@/components/studio/static-ads/static-ad-studio-workspace'
import { getModels } from '@/services/models.service'
import { getStaticAdTemplateCategories } from '@/services/static-ad-templates.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { ContextSupport } from '@socialista/types'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { preload } from 'react-dom'

export const metadata = createDashboardMetadata('Static ads')

const STATIC_AD_MODELS_QUERY =
  'limit=50&modelType=image&contextSupports=image&sort=-usageCount'

const StaticAdsPage = async () => {
  preload('/socialista-static-ads.webp', { as: 'image' })

  const [workspace, modelsRes, categoriesRes] = await Promise.all([
    getCurrentWorkspace(),
    getModels(STATIC_AD_MODELS_QUERY),
    getStaticAdTemplateCategories(),
  ])

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to create static ads." />
  }

  const models = (modelsRes.success ? (modelsRes.data?.models ?? []) : []).filter(model =>
    model.contextSupports?.includes(ContextSupport.IMAGE),
  )

  return (
    <StaticAdStudioWorkspace
      models={models}
      workspaceId={workspace.id}
      templateCategories={categoriesRes.success ? (categoriesRes.data?.categories ?? []) : []}
    />
  )
}

export default StaticAdsPage
