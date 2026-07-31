import { ImageStudioWorkspace } from '@/components/studio/images/image-studio-workspace'
import { getModels } from '@/services/models.service'

const ImagesPage = async () => {
  const { data, success } = await getModels('limit=10&modelType=text-to-image&sort=-usageCount')

  if (!success) {
    throw new Error('Failed to load models')
  }

  return <ImageStudioWorkspace models={data?.models ?? []} />
}

export default ImagesPage
