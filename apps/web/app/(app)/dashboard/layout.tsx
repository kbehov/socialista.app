import { auth } from '@/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { WorkspaceProvider } from '@/context/workspace-provider'
import { getUserWorkspaces } from '@/services/workspace.service'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth()
  if (!session) {
    redirect('/auth/signin')
  }
  const workspaces = await getUserWorkspaces()
  console.log('workspaces', workspaces.data)

  return (
    <Suspense fallback={<div>suspended...</div>}>
      <WorkspaceProvider workspaces={workspaces.data || []}>
        <SidebarProvider>
          <AppSidebar workspaces={workspaces.data ?? []} />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </WorkspaceProvider>
    </Suspense>
  )
}

export default DashboardLayout
