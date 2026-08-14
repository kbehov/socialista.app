import { ErrorState } from '@/components/common/error-state'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { PageHeader } from '@/components/headers/page-header'
import { NotificationsView } from '@/components/notifications/notifications-view'
import { getNotifications } from '@/services/notification.service'
import { formatItemCount } from '@/utils/format'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { MetaResponse } from '@socialista/types'

type NotificationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const DEFAULT_LIMIT = 20

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: DEFAULT_LIMIT,
  hasNextPage: false,
  hasPreviousPage: false,
}

function firstParam(value: string | string[] | undefined) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view notifications." />
  }

  const params = await searchParams
  const page = Number.parseInt(firstParam(params.page) ?? '1', 10)
  const limit = Number.parseInt(firstParam(params.limit) ?? String(DEFAULT_LIMIT), 10)
  const unreadOnly = firstParam(params.unread) === 'true'

  const response = await getNotifications(workspace.id, {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT,
    sort: '-createdAt',
    unread: unreadOnly,
  })

  const notifications = response.data?.notifications ?? []
  const meta = response.meta ?? defaultMeta

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Notifications"
        description={`${formatItemCount(meta.total)} in ${workspace.name}`}
      />

      {!response.success ? (
        <ErrorState
          title={response.message ?? 'Failed to load notifications'}
          description="Refresh the page to try again."
          className="flex-1 rounded-xl"
        />
      ) : (
        <NotificationsView
          notifications={notifications}
          meta={meta}
          workspaceId={workspace.id}
          unreadOnly={unreadOnly}
        />
      )}
    </div>
  )
}
