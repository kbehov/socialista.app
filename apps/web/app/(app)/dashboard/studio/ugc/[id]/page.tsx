import { ErrorState } from '@/components/common/error-state'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { UgcProjectWorkspace } from '@/components/studio/ugc/ugc-project-workspace'
import { getUgcProject } from '@/services/ugc-project.service'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { Metadata } from 'next'

type UgcProjectPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: UgcProjectPageProps): Promise<Metadata> {
  const { id } = await params
  const response = await getUgcProject(id)
  const name = response.data?.project?.name?.trim()
  return createDashboardMetadata(name || 'UGC ad')
}

export default async function UgcProjectPage({ params }: UgcProjectPageProps) {
  const { id } = await params
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to open this UGC ad." />
  }

  const projectResponse = await getUgcProject(id)
  const project = projectResponse.data?.project
  if (!projectResponse.success || !project) {
    return (
      <ErrorState
        title={projectResponse.message ?? 'UGC ad not found'}
        description="It may have been deleted, or you might not have access."
      />
    )
  }

  return <UgcProjectWorkspace workspaceId={workspace.id} initialProject={project} />
}
