import { getModels } from '@/services/models.service'
import { ImageStudioWorkspace } from './_components/image-studio-workspace'

const ImagesPage = async () => {
  const { data, success } = await getModels('limit=10&modelType=text-to-image&sort=-usageCount')
  console.log(data?.models.map(model => model.name))

  if (!success) {
    throw new Error('Failed to load models')
  }

  return <ImageStudioWorkspace models={data?.models ?? []} />
}

export default ImagesPage
