import { VideoGenerationProgress } from '@/components/studio/videos/video-generation-progress'
import { getModels } from '@/services/models.service'
import type { Model } from '@socialista/types'

type VideoGenerationRunPageProps = {
  params: Promise<{ runId: string }>
}

function mergeModels(groups: Array<Model[] | undefined>): Model[] {
  const byId = new Map<string, Model>()
  for (const group of groups) {
    for (const model of group ?? []) {
      byId.set(model._id, model)
    }
  }
  return [...byId.values()]
}

export default async function VideoGenerationRunPage({ params }: VideoGenerationRunPageProps) {
  const [{ runId }, textToVideo, imageToVideo] = await Promise.all([
    params,
    getModels('limit=100&modelType=text-to-video'),
    getModels('limit=100&modelType=image-to-video'),
  ])

  const models = mergeModels([
    textToVideo.success ? textToVideo.data?.models : undefined,
    imageToVideo.success ? imageToVideo.data?.models : undefined,
  ])

  return (
    <div className="image-studio studio-shell relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <VideoGenerationProgress models={models} runId={runId} />
    </div>
  )
}
