import { lockedStudioShellRootClassName } from '@/components/dashboard/studio-shell'
import { GenerationProgress } from '@/components/studio/images/generation-progress'
import { getModels } from '@/services/models.service'

type ImageGenerationRunPageProps = {
  params: Promise<{ runId: string }>
}

export default async function ImageGenerationRunPage({ params }: ImageGenerationRunPageProps) {
  const [{ runId }, modelsRes] = await Promise.all([
    params,
    getModels('limit=100&modelType=image'),
  ])

  const models = modelsRes.success ? (modelsRes.data?.models ?? []) : []

  return (
    <div className={lockedStudioShellRootClassName}>
      <GenerationProgress models={models} runId={runId} />
    </div>
  )
}
