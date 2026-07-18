import { DashboardShell } from './_components/dashboard-shell'
import { getDashboardLayoutData } from './_lib/get-dashboard-layout-data'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, workspaces, aiCreditsBalance } = await getDashboardLayoutData()

  return (
    <DashboardShell
      workspaces={workspaces}
      aiCreditsBalance={aiCreditsBalance}
      user={{
        name: session.user?.name ?? 'User',
        email: session.user?.email ?? '',
        avatar: session.user?.image ?? '',
      }}
    >
      {children}
    </DashboardShell>
  )
}
