'use client'

import { dashboardSurface } from '@/components/dashboard'
import { AccountsToolbar } from '@/components/accounts/accounts-toolbar'
import { AccountsTable } from '@/components/tables/accounts.table'
import { EmptyState } from '@/components/common/empty-state'
import { SmartPagination } from '@/components/common/smart-pagination'
import type { Filter } from '@/components/reui/filters'
import type { AccountSummary, MetaResponse } from '@socialista/types'
import { SearchXIcon } from 'lucide-react'

type AccountsViewProps = {
  accounts: AccountSummary[]
  meta: MetaResponse
  searchQuery?: string
  filters: Filter<string>[]
  hasFilters: boolean
}

export function AccountsView({ accounts, meta, searchQuery, filters, hasFilters }: AccountsViewProps) {
  if (accounts.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <AccountsToolbar
          total={meta.total}
          initialQuery={searchQuery}
          filters={filters}
        />
        <EmptyState
          icon={SearchXIcon}
          title={hasFilters || searchQuery ? 'No accounts match your filters' : 'No accounts found'}
          description={
            hasFilters || searchQuery
              ? 'Try removing a filter or searching with a different name, handle, or provider account ID.'
              : 'Connect a social account to get started.'
          }
          minHeight="lg"
          variant="hero"
          className="flex-1"
          iconClassName={dashboardSurface.emptyIcon}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <AccountsToolbar
        total={meta.total}
        initialQuery={searchQuery}
        filters={filters}
      />
      <AccountsTable accounts={accounts} />
      <SmartPagination meta={meta} />
    </div>
  )
}
