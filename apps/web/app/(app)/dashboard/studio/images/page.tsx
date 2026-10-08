import { ImageStudioWorkspace } from '@/components/studio/images/image-studio-workspace'
import { getModels } from '@/services/models.service'
import { getStudioTemplateCategories } from '@/services/studio-templates.service'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { StudioTemplateKind } from '@socialista/types'

export const metadata = createDashboardMetadata('Images')

const ImagesPage = async () => {
  const [modelsRes, categoriesRes] = await Promise.all([
    getModels('limit=20&modelType=image&sort=-usageCount'),
    getStudioTemplateCategories(StudioTemplateKind.IMAGE),
  ])

  if (!modelsRes.success) {
    throw new Error('Failed to load models')
  }

  return (
    <ImageStudioWorkspace
      models={modelsRes.data?.models ?? []}
      templateCategories={categoriesRes.success ? (categoriesRes.data?.categories ?? []) : []}
    />
  )
}

export default ImagesPage
