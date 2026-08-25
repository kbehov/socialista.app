import { dashboardMainClassName } from '@/components/dashboard/studio-shell'
import DashboardHeader from '@/components/headers/dashboard-header'
import { PageScrollCompactProvider } from '@/components/headers/page-scroll-compact'
import { AppSidebar } from '@/components/sidebars/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ProjectProvider } from '@/context/project-provider'
import { WorkspaceProvider } from '@/context/workspace-provider'
import { getDashboardData } from '@/services/dashboard.service'
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { workspaces, projects, currentWorkspace, aiCreditsBalance } = await getDashboardData()

  const dashboard = (
    <SidebarProvider className="dashboard-shell h-svh max-h-svh overflow-hidden">
      <AppSidebar workspaces={workspaces} projects={projects} />
      <SidebarInset className="dashboard-inset flex h-svh max-h-svh min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader workspaceBalance={aiCreditsBalance} />
        <main id="dashboard-scroll" data-dashboard-scroll className={dashboardMainClassName}>
          <PageScrollCompactProvider>
            <div className="dashboard-page">{children}</div>
          </PageScrollCompactProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )

  return (
    <WorkspaceProvider workspaces={workspaces}>
      {currentWorkspace ? (
        <ProjectProvider projects={projects} workspaceId={currentWorkspace._id}>
          {dashboard}
        </ProjectProvider>
      ) : (
        dashboard
      )}
    </WorkspaceProvider>
  )
}
