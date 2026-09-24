import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { VideoLibrary } from '@/components/studio/videos/video-library'
import { VIDEO_LIST_PAGE_SIZE } from '@/constants/studio'
import { getWorkspaceVideos } from '@/services/video.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'

export default async function AllVideosPage() {
  const { workspace, project } = await getCurrentWorkspaceContext()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view videos." />
  }

  const response = await getWorkspaceVideos(workspace.id, {
    status: 'draft',
    page: 1,
    limit: VIDEO_LIST_PAGE_SIZE,
    projectId: project?.id,
  })
  const videos = response.data?.videos ?? []
  const error = response.success ? null : (response.message ?? 'Failed to load videos')

  return (
    <VideoLibrary
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      initialVideos={videos}
      initialError={error}
      initialHasMore={Boolean(response.meta?.hasNextPage)}
      initialTotal={response.meta?.total}
    />
  )
}
