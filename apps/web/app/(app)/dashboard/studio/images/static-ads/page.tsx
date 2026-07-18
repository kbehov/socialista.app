import { ErrorState } from '@/components/common/error-state'
import { getModels } from '@/services/models.service'
import { getWorkspaceProducts } from '@/services/product.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { STATIC_AD_MODEL } from '@socialista/types'
import { WorkspaceRequired } from '../../../_components/workspace-required'
import { StaticAdStudioWorkspace } from './_components/static-ad-studio-workspace'

const StaticAdsPage = async () => {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to create static ads." />
  }

  const [productsRes, modelsRes] = await Promise.all([
    getWorkspaceProducts(workspace.id, { limit: 100, sort: '-createdAt' }),
    getModels(`limit=1&modelType=text-to-image&value=${encodeURIComponent(STATIC_AD_MODEL)}`),
  ])

  if (!productsRes.success) {
    return (
      <div className="image-studio flex min-h-0 flex-1 flex-col p-6 sm:p-8">
        <ErrorState
          className="flex-1 rounded-xl"
          description="Refresh the page to try again."
          title={productsRes.message ?? 'Failed to load products'}
        />
      </div>
    )
  }

  const products = productsRes.data?.products ?? []
  const totalProducts = productsRes.data?.meta.total ?? products.length
  const model = modelsRes.success ? (modelsRes.data?.models[0] ?? null) : null

  return (
    <StaticAdStudioWorkspace
      model={model}
      products={products}
      productsTruncated={totalProducts > products.length}
      workspaceId={workspace.id}
    />
  )
}

export default StaticAdsPage
