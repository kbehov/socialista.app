'use client'

import { AccountsToolbar } from '@/components/accounts/accounts-toolbar'
import { AccountsTable } from '@/components/tables/accounts.table'
import { EmptyState } from '@/components/common/empty-state'
import { SmartPagination } from '@/components/common/smart-pagination'
import { dashboardSurface } from '@/components/dashboard'
import { useAccountFilters } from '@/hooks/use-account-filters'
import { useAccountSearch } from '@/hooks/use-account-search'
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
  const { clearFilters } = useAccountFilters()
  const { clearSearch } = useAccountSearch()
  const isFiltered = hasFilters || Boolean(searchQuery)

  if (accounts.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <AccountsToolbar total={meta.total} initialQuery={searchQuery} filters={filters} />
        <EmptyState
          icon={SearchXIcon}
          title={isFiltered ? 'No accounts match' : 'No accounts found'}
          description={
            isFiltered
              ? 'Try a different platform, status, or name — or clear filters to see everything.'
              : 'Connect a social account to get started.'
          }
          minHeight="lg"
          variant="hero"
          className="flex-1"
          iconClassName={dashboardSurface.emptyIcon}
          action={
            isFiltered ? (
              <button
                type="button"
                onClick={() => {
                  clearFilters()
                  clearSearch()
                }}
                className="text-sm font-medium text-foreground underline-offset-4 transition-colors duration-150 hover:underline"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <AccountsToolbar total={meta.total} initialQuery={searchQuery} filters={filters} />
      <AccountsTable accounts={accounts} />
      <SmartPagination meta={meta} />
    </div>
  )
}
