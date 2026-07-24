import { ConnectAccountTrigger } from '@/components/accounts/connect-account-trigger'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PostComposer } from '@/components/posts/composer/post-composer'
import { getWorkspaceAccounts } from '@/services/account.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { Link2Icon } from 'lucide-react'

import { WorkspaceRequired } from '../../_components/workspace-required'

export default async function CreatePostPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to create a post." />
  }

  const response = await getWorkspaceAccounts(workspace.id, {
    limit: 50,
    connectionStatus: 'connected',
  })
  const accounts = response.data?.accounts ?? []
  const accountsTotal = response.data?.meta.total ?? accounts.length

  if (!response.success) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <ErrorState
          title={response.message ?? 'Failed to load accounts'}
          description="Refresh the page to try again."
          className="flex-1 rounded-xl"
        />
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <EmptyState
          icon={Link2Icon}
          title="Connect an account first"
          description="Link at least one social profile before creating a post."
          minHeight="lg"
          variant="default"
          className="flex-1 rounded-2xl border-border/50 bg-gradient-to-b from-muted/25 via-muted/10 to-transparent"
          iconClassName="size-12 rounded-2xl border-0 bg-background shadow-xs ring-1 ring-border/50 [&_svg]:size-5"
          action={<ConnectAccountTrigger label="Connect account" showPlusIcon={false} />}
        />
      </div>
    )
  }

  return (
    <div className="post-composer flex min-h-0 flex-1 flex-col px-1 sm:px-0">
      <PostComposer workspaceId={workspace.id} accounts={accounts} accountsTotal={accountsTotal} />
    </div>
  )
}
