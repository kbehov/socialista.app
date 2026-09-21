import { auth } from '@/auth'
import { dashboardMainClassName } from '@/components/dashboard/studio-shell'
import { ManagerHeader } from '@/components/headers/manager-header'
import { PageScrollCompactProvider } from '@/components/headers/page-scroll-compact'
import { AdminSidebar } from '@/components/sidebars/admin-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { WorkspaceProvider } from '@/context/workspace-provider'
import { getUserWorkspaces } from '@/services/workspace.service'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const workspaces = await getUserWorkspaces()

  return (
    <WorkspaceProvider workspaces={workspaces.data ?? []}>
      <SidebarProvider className="dashboard-shell h-svh max-h-svh overflow-hidden">
        <AdminSidebar />
        <SidebarInset className="dashboard-inset flex h-svh max-h-svh min-w-0 flex-1 flex-col overflow-hidden">
          <ManagerHeader />
          <main id="manager-scroll" data-dashboard-scroll className={dashboardMainClassName}>
            <PageScrollCompactProvider>
              <div className="dashboard-page">{children}</div>
            </PageScrollCompactProvider>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </WorkspaceProvider>
  )
}
