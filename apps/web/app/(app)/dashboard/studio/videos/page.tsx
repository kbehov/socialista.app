import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { VideoStudioWorkspace } from '@/components/studio/videos/video-studio-workspace'
import { VIDEO_LIST_PAGE_SIZE } from '@/constants/studio'
import { getGeneration } from '@/services/generation.service'
import { getModels } from '@/services/models.service'
import { getStudioTemplateCategories } from '@/services/studio-templates.service'
import { getWorkspaceVideos } from '@/services/video.service'
import { StudioTemplateKind } from '@socialista/types'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'

export const metadata = createDashboardMetadata('Videos')

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
  const [{ generationId }, { workspace, project }] = await Promise.all([
    searchParams,
    getCurrentWorkspaceContext(),
  ])

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view videos." />
  }

  const [modelsRes, initialAttachmentUrl, templateCategoriesRes, videosResponse] =
    await Promise.all([
      getModels('limit=100&modelType=video&sort=-usageCount'),
      getGenerationImageUrl(generationId),
      getStudioTemplateCategories(StudioTemplateKind.VIDEO),
      getWorkspaceVideos(workspace.id, {
        page: 1,
        limit: VIDEO_LIST_PAGE_SIZE,
        sort: '-updatedAt',
        projectId: project?.id,
      }),
    ])

  const models = modelsRes.data?.models ?? []

  return (
    <VideoStudioWorkspace
      models={models}
      initialAttachmentUrl={initialAttachmentUrl}
      templateCategories={
        templateCategoriesRes.success ? (templateCategoriesRes.data?.categories ?? []) : []
      }
      initialVideos={videosResponse.data?.videos ?? []}
      initialVideosError={videosResponse.success ? null : (videosResponse.message ?? 'Failed to load videos')}
      initialVideosHasMore={Boolean(videosResponse.meta?.hasNextPage)}
      initialVideosTotal={videosResponse.meta?.total}
    />
  )
}
