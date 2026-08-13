import { ErrorState } from '@/components/common/error-state'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { UgcProjectWorkspace } from '@/components/studio/ugc/ugc-project-workspace'
import {
  UGC_IMAGE_MODELS_QUERY,
  UGC_SCRIPT_MODELS_QUERY,
  UGC_VIDEO_MODELS_QUERY,
} from '@/lib/studio/ugc/model-filters'
import { getModels } from '@/services/models.service'
import { getWorkspaceProducts } from '@/services/product.service'
import { getUgcProject } from '@/services/ugc-project.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { ContextSupport } from '@socialista/types'

type UgcProjectPageProps = {
  params: Promise<{ id: string }>
}

export default async function UgcProjectPage({ params }: UgcProjectPageProps) {
  const { id } = await params
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to open this UGC ad." />
  }

  const [projectResponse, imageModelsResponse, scriptModelsResponse, videoModelsResponse, productsResponse] =
    await Promise.all([
      getUgcProject(id),
      getModels(UGC_IMAGE_MODELS_QUERY),
      getModels(UGC_SCRIPT_MODELS_QUERY),
      getModels(UGC_VIDEO_MODELS_QUERY),
      getWorkspaceProducts(workspace.id, { limit: 50, sort: '-updatedAt' }),
    ])

  const project = projectResponse.data?.project
  if (!projectResponse.success || !project) {
    return (
      <ErrorState
        title={projectResponse.message ?? 'UGC ad not found'}
        description="It may have been deleted, or you might not have access."
      />
    )
  }

  const imageModels = (imageModelsResponse.data?.models ?? []).filter(model =>
    model.contextSupports?.includes(ContextSupport.IMAGE),
  )
  const scriptModels = scriptModelsResponse.data?.models ?? []
  const videoModels = videoModelsResponse.data?.models ?? []
  const products = productsResponse.data?.products ?? []

  return (
    <UgcProjectWorkspace
      workspaceId={workspace.id}
      initialProject={project}
      imageModels={imageModels}
      scriptModels={scriptModels}
      videoModels={videoModels}
      products={products}
      productsTruncated={(productsResponse.meta?.total ?? products.length) > products.length}
    />
  )
}
