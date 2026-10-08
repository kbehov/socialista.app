import { BillingSettings } from '@/components/settings/billing-settings'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { getWorkspaceBalance } from '@/services/workspace.service'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export const metadata = createDashboardMetadata('Plan')

export default async function SettingsBillingPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view billing." />
  }

  const balanceResponse = await getWorkspaceBalance(workspace.id)

  return <BillingSettings workspace={workspace} balance={balanceResponse.data ?? null} />
}
