'use client'

import { AccountsToolbar } from '@/components/accounts/accounts-toolbar'
import { AccountsTable } from '@/components/tables/accounts.table'
import { EmptyState } from '@/components/common/empty-state'
import { PostsPagination } from '@/components/posts/posts-pagination'
import type { AccountSummary, MetaResponse } from '@socialista/types'
import { SearchXIcon } from 'lucide-react'

type AccountsViewProps = {
  accounts: AccountSummary[]
  meta: MetaResponse
  searchQuery?: string
}

export function AccountsView({ accounts, meta, searchQuery }: AccountsViewProps) {
  if (accounts.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <AccountsToolbar total={meta.total} initialQuery={searchQuery} />
        <EmptyState
          icon={SearchXIcon}
          title="No accounts match your search"
          description="Try a different name, handle, or provider account ID."
          minHeight="lg"
          variant="default"
          className="flex-1 rounded-2xl border-border/60 bg-gradient-to-b from-muted/30 to-muted/10"
          iconClassName="size-12 rounded-2xl border-0 bg-background shadow-xs ring-1 ring-border/60 [&_svg]:size-5"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <AccountsToolbar total={meta.total} initialQuery={searchQuery} />
      <AccountsTable accounts={accounts} />
      <PostsPagination meta={meta} />
    </div>
  )
}
