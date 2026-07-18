import { WorkspaceRequired } from '../../_components/workspace-required'
import { VideoList } from '@/components/video/video-list'
import { getWorkspaceVideos } from '@/services/video.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export default async function VideosPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view videos." />
  }

  const response = await getWorkspaceVideos(workspace.id, 'draft')
  const videos = response.data?.videos ?? []
  const error = response.success ? null : (response.message ?? 'Failed to load videos')

  return (
    <VideoList
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      initialVideos={videos}
      initialError={error}
    />
  )
}
