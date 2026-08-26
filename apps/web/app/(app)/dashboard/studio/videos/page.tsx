import { VideoStudioWorkspace } from '@/components/studio/videos/video-studio-workspace'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { getGeneration } from '@/services/generation.service'
import { getModels } from '@/services/models.service'
import { getWorkspaceVideos } from '@/services/video.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import type { Model } from '@socialista/types'
import { preload } from 'react-dom'

function mergeModels(groups: Array<Model[] | undefined>): Model[] {
  const byId = new Map<string, Model>()
  for (const group of groups) {
    for (const model of group ?? []) {
      byId.set(model._id, model)
    }
  }
  return [...byId.values()]
}

async function getGenerationImageUrl(generationId?: string): Promise<string | undefined> {
  if (!generationId) return undefined

  try {
    const response = await getGeneration(generationId)
    const result = response.data?.generation.result
    if (result?.type !== 'image') return undefined
    return result.url ?? result.urls?.[0]
  } catch {
    return undefined
  }
}

type VideosPageProps = {
  searchParams: Promise<{ generationId?: string }>
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  preload('/socialista-video.webp', { as: 'image' })
  const [{ generationId }, { workspace, project }] = await Promise.all([
    searchParams,
    getCurrentWorkspaceContext(),
  ])

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view videos." />
  }

  const [textToVideo, imageToVideo, videosResponse, initialAttachmentUrl] = await Promise.all([
    getModels('limit=20&modelType=text-to-video&sort=-usageCount'),
    getModels('limit=20&modelType=image-to-video&sort=-usageCount'),
    getWorkspaceVideos(workspace.id, 'draft', { projectId: project?.id }),
    getGenerationImageUrl(generationId),
  ])

  const models = mergeModels([textToVideo.data?.models, imageToVideo.data?.models])
  const videos = videosResponse.data?.videos ?? []
  const error = videosResponse.success ? null : (videosResponse.message ?? 'Failed to load videos')

  return (
    <VideoStudioWorkspace
      models={models}
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      initialVideos={videos}
      initialError={error}
      initialAttachmentUrl={initialAttachmentUrl}
    />
  )
}
