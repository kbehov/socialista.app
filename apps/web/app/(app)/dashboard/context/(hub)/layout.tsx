import { ContextHubHeader } from '@/components/context/context-hub-header'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { ReactNode } from 'react'

export default async function ContextHubLayout({ children }: { children: ReactNode }) {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view context and skills." />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ContextHubHeader workspaceId={workspace.id} />
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
