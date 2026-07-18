import { getModels } from '@/services/models.service'
import { ImageStudioWorkspace } from './_components/studio/image-studio-workspace'

const ImagesPage = async () => {
  const { data, success } = await getModels('limit=10&modelType=text-to-image&sort=-usageCount')

  if (!success) {
    throw new Error('Failed to load models')
  }

  return <ImageStudioWorkspace models={data?.models ?? []} />
}

export default ImagesPage
