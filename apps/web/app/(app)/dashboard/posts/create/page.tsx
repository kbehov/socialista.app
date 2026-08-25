import { ConnectAccountTrigger } from '@/components/accounts/connect-account-trigger'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { dashboardSurface } from '@/components/dashboard'
import { PostComposer } from '@/components/posts/composer/post-composer'
import { getWorkspaceAccounts } from '@/services/account.service'
import { getGeneration } from '@/services/generation.service'
import type { ComposerMediaItem } from '@/types/composer-types'
import { generationToComposerMedia } from '@/utils/composer-media.utils'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { Link2Icon } from 'lucide-react'

import { WorkspaceRequired } from '../../../../../components/dashboard/workspace-required'

type CreatePostPageProps = {
  searchParams: Promise<{ generationId?: string; slideshowId?: string }>
}

export default async function CreatePostPage({ searchParams }: CreatePostPageProps) {
  const { workspace, project } = await getCurrentWorkspaceContext()
  const { generationId, slideshowId } = await searchParams

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to create a post." />
  }

  const [accountsResponse, initialMedia] = await Promise.all([
    getWorkspaceAccounts(workspace.id, {
      limit: 50,
      connectionStatus: 'connected',
      projectId: project?.id,
    }),
    loadInitialMedia(generationId),
  ])

  const accounts = accountsResponse.data?.accounts ?? []
  const accountsTotal = accountsResponse.meta?.total ?? accounts.length

  if (!accountsResponse.success) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <ErrorState
          title={accountsResponse.message ?? 'Failed to load accounts'}
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
          variant="hero"
          className="flex-1"
          iconClassName={dashboardSurface.emptyIcon}
          action={<ConnectAccountTrigger label="Connect account" showPlusIcon={false} />}
        />
      </div>
    )
  }

  return (
    <div className="px-1 sm:px-0">
      <PostComposer
        workspaceId={workspace.id}
        accounts={accounts}
        accountsTotal={accountsTotal}
        initialMedia={initialMedia}
        slideshowId={slideshowId}
      />
    </div>
  )
}

async function loadInitialMedia(generationId?: string): Promise<ComposerMediaItem[]> {
  if (!generationId) return []

  const response = await getGeneration(generationId)
  const generation = response.data?.generation
  if (!response.success || !generation) return []

  return generationToComposerMedia(generation)
}
