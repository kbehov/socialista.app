import { SettingsNav } from '@/components/settings/settings-nav'
import { PageHeader } from '@/components/headers/page-header'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { isWorkspaceAdmin } from '@/lib/workspace-role'
import { auth } from '@/auth'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { redirect } from 'next/navigation'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const [session, workspace] = await Promise.all([auth(), getCurrentWorkspace()])

  if (!session?.user?.id || !workspace || !isWorkspaceAdmin(workspace, session.user.id)) {
    redirect(DASHBOARD_ROUTES.ROOT)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Settings" description={`Manage ${workspace.name}`} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pb-12">
        <SettingsNav />
        {children}
      </div>
    </div>
  )
}
