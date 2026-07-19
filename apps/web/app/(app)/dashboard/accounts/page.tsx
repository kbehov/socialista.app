import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/headers/page-header'
import { AccountsTable } from '@/components/tables/accounts.table'
import { WorkspaceRequired } from '../_components/workspace-required'
import { getWorkspaceAccounts } from '@/services/account.service'
import { formatItemCount } from '@/utils/format'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { Link2Icon } from 'lucide-react'

export default async function AccountsPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view connected accounts." />
  }

  const response = await getWorkspaceAccounts(workspace.id)
  const accounts = response.data?.accounts ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Accounts"
        description={`${formatItemCount(accounts.length)} connected in ${workspace.name}`}
      />

      {!response.success ? (
        <ErrorState
          title={response.message ?? 'Failed to load accounts'}
          description="Refresh the page to try again."
          className="flex-1 rounded-xl"
        />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Link2Icon}
          title="Connect your social accounts"
          description="Link Instagram, TikTok, YouTube, and more so you can schedule and publish from one workspace."
          minHeight="lg"
          variant="default"
          className="flex-1 rounded-2xl border-border/60 bg-gradient-to-b from-muted/30 to-muted/10"
          iconClassName="size-12 rounded-2xl border-0 bg-background shadow-xs ring-1 ring-border/60 [&_svg]:size-5"
          footer={
            <p className="mt-6 text-[11px] text-muted-foreground">
              Each account can use its own timezone for scheduling.
            </p>
          }
        />
      ) : (
        <AccountsTable accounts={accounts} />
      )}
    </div>
  )
}
