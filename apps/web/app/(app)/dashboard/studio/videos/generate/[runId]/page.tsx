import { lockedStudioShellRootClassName } from '@/components/dashboard/studio-shell'
import { VideoGenerationProgress } from '@/components/studio/videos/video-generation-progress'
import { getModels } from '@/services/models.service'

type VideoGenerationRunPageProps = {
  params: Promise<{ runId: string }>
}

export default async function VideoGenerationRunPage({ params }: VideoGenerationRunPageProps) {
  const [{ runId }, modelsRes] = await Promise.all([
    params,
    getModels('limit=100&modelType=video'),
  ])

  const models = modelsRes.success ? (modelsRes.data?.models ?? []) : []

  return (
    <div className={lockedStudioShellRootClassName}>
      <VideoGenerationProgress models={models} runId={runId} />
    </div>
  )
}
