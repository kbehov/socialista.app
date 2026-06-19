import { auth } from '@/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { WorkspaceProvider } from '@/context/workspace-provider'
import { getUserWorkspaces } from '@/services/workspace.service'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) {
    redirect('/auth/signin')
  }

  const workspaces = await getUserWorkspaces()

  return (
    <WorkspaceProvider workspaces={workspaces.data || []}>
      <SidebarProvider>
        <AppSidebar workspaces={workspaces.data ?? []} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </WorkspaceProvider>
  )
}
