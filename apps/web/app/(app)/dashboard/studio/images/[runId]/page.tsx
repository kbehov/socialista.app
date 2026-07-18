import { getModels } from '@/services/models.service'
import { GenerationProgress } from '../_components/studio/generation-progress'

type ImageGenerationRunPageProps = {
  params: Promise<{ runId: string }>
}

export default async function ImageGenerationRunPage({ params }: ImageGenerationRunPageProps) {
  const [{ runId }, modelsRes] = await Promise.all([
    params,
    getModels('limit=100&modelType=text-to-image'),
  ])

  const models = modelsRes.success ? (modelsRes.data?.models ?? []) : []

  return (
    <div className="image-studio relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <GenerationProgress models={models} runId={runId} />
    </div>
  )
}
