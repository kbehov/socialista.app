import { ImageStudioWorkspace } from '@/components/studio/images/image-studio-workspace'
import { getModels } from '@/services/models.service'
import { preload } from 'react-dom'

const ImagesPage = async () => {
  preload('/socialista-image.webp', { as: 'image' })
  const { data, success } = await getModels('limit=20&modelType=text-to-image&sort=-usageCount')

  if (!success) {
    throw new Error('Failed to load models')
  }

  return <ImageStudioWorkspace models={data?.models ?? []} />
}

export default ImagesPage
