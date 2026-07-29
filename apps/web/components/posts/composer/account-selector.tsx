'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { AccountSelectorDialog } from '@/components/posts/composer/account-selector-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getWorkspaceAccounts } from '@/services/account.service'
import {
  buildDuplicateNameKeys,
  getAccountChipLabel,
  getAccountInitials,
  getAccountSecondaryLabel,
} from '@/utils/account-display.utils'
import type { AccountSummary, SocialProvider } from '@socialista/types'
import { ChevronsUpDownIcon, UsersIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ComposerSection } from './composer-section'

type AccountSelectorProps = {
  workspaceId: string
  accounts: AccountSummary[]
  accountsTotal?: number
  selectedAccountIds: string[]
  onToggle: (accountId: string) => void
  onSelectAccounts: (accountIds: string[]) => void
  onClearAll: () => void
  accountsWithIssues?: Set<string>
  className?: string
}

export function AccountSelector({
  workspaceId,
  accounts,
  accountsTotal,
  selectedAccountIds,
  onToggle,
  onSelectAccounts,
  onClearAll,
  accountsWithIssues,
  className,
}: AccountSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState<SocialProvider | 'all'>('all')
  const [browseAccounts, setBrowseAccounts] = useState<AccountSummary[]>(accounts)
  const [isSearching, setIsSearching] = useState(false)

  const selectedCount = selectedAccountIds.length
  const selectedSet = useMemo(() => new Set(selectedAccountIds), [selectedAccountIds])

  const accountCatalog = useMemo(() => {
    const byId = new Map<string, AccountSummary>()
    for (const account of accounts) byId.set(account._id, account)
    for (const account of browseAccounts) byId.set(account._id, account)
    return byId
  }, [accounts, browseAccounts])

  const duplicateNameKeys = useMemo(
    () => buildDuplicateNameKeys([...accountCatalog.values()]),
    [accountCatalog],
  )

  const providers = useMemo(
    () => [...new Set(browseAccounts.map(account => account.provider))],
    [browseAccounts],
  )

  const filteredAccounts = useMemo(
    () =>
      providerFilter === 'all'
        ? browseAccounts
        : browseAccounts.filter(account => account.provider === providerFilter),
    [browseAccounts, providerFilter],
  )

  const selectedAccounts = useMemo(
    () =>
      selectedAccountIds
        .map(id => accountCatalog.get(id))
        .filter((account): account is AccountSummary => account !== undefined),
    [accountCatalog, selectedAccountIds],
  )

  const visibleChips = selectedAccounts.slice(0, 5)
  const hiddenChipCount = Math.max(0, selectedAccounts.length - visibleChips.length)
  const totalCount = accountsTotal ?? accountCatalog.size

  useEffect(() => {
    let cancelled = false
    const trimmed = search.trim()

    const timeout = window.setTimeout(
      () => {
        setIsSearching(true)
        void getWorkspaceAccounts(workspaceId, {
          query: trimmed || undefined,
          connectionStatus: 'connected',
          limit: 50,
        })
          .then(response => {
            if (!cancelled) {
              setBrowseAccounts(response.data?.accounts ?? [])
            }
          })
          .finally(() => {
            if (!cancelled) setIsSearching(false)
          })
      },
      trimmed ? 300 : 0,
    )

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [search, workspaceId])

  const filteredAllSelected =
    filteredAccounts.length > 0 && filteredAccounts.every(account => selectedSet.has(account._id))

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setSearch('')
      setProviderFilter('all')
    }
  }

  const handleSelectVisible = () => {
    const merged = new Set(selectedAccountIds)
    for (const account of filteredAccounts) {
      merged.add(account._id)
    }
    onSelectAccounts([...merged])
  }

  return (
    <>
      <ComposerSection
        title="Publish to"
        description={
          totalCount > 20
            ? 'Search and select from your connected accounts.'
            : 'Choose where this post will go live.'
        }
        compact
        className={className}
        contentClassName="space-y-2.5 pt-0"
        badge={
          selectedCount > 0 ? (
            <Badge
              variant="outline"
              className="h-5 rounded-full border-border/60 bg-muted/30 px-2 text-[10px] font-medium tabular-nums"
            >
              {selectedCount}
            </Badge>
          ) : null
        }
        action={
          selectedCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 rounded-full px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              onClick={onClearAll}
            >
              Clear
            </Button>
          ) : null
        }
      >
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-10 w-full justify-between rounded-xl border-border/50 bg-background px-3 text-xs font-normal shadow-none',
            'hover:bg-muted/30 dark:hover:bg-muted/20',
            'active:scale-[0.995]',
            selectedCount === 0 && 'text-muted-foreground',
          )}
          onClick={() => setOpen(true)}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-lg border border-border/50',
                selectedCount > 0 ? 'bg-foreground text-background' : 'bg-muted/40 text-muted-foreground',
              )}
            >
              <UsersIcon className="size-3" strokeWidth={1.75} />
            </span>
            <span className="truncate">
              {selectedCount === 0
                ? `Select from ${totalCount} account${totalCount === 1 ? '' : 's'}…`
                : `${selectedCount} account${selectedCount === 1 ? '' : 's'} selected`}
            </span>
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        </Button>

        {selectedCount > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleChips.map(account => {
              const hasIssue = accountsWithIssues?.has(account._id)

              return (
                <button
                  key={account._id}
                  type="button"
                  onClick={() => onToggle(account._id)}
                  title={`${getAccountSecondaryLabel(account, duplicateNameKeys)} — click to remove`}
                  className={cn(
                    'group inline-flex max-w-48 items-center gap-1.5 rounded-full border bg-background py-1 pr-1.5 pl-1',
                    'text-[11px] font-medium transition-colors active:scale-[0.97]',
                    'hover:bg-muted/40 dark:hover:bg-muted/30',
                    hasIssue
                      ? 'border-amber-500/40 text-foreground dark:border-amber-500/45'
                      : 'border-border/60 text-foreground',
                  )}
                >
                  <span className="relative shrink-0">
                    <Avatar className="size-5 rounded-full ring-1 ring-border/40">
                      {account.accountAvatar ? (
                        <AvatarImage src={account.accountAvatar} alt={account.accountName} />
                      ) : null}
                      <AvatarFallback className="rounded-full text-[8px] font-medium">
                        {getAccountInitials(account)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -right-0.5 -bottom-0.5 flex size-3 items-center justify-center rounded-full bg-background">
                      <SocialPlatformIcon
                        provider={account.provider}
                        size={8}
                        framed={false}
                        className="size-2.5"
                      />
                    </span>
                  </span>
                  <span className="truncate">{getAccountChipLabel(account, duplicateNameKeys)}</span>
                  {hasIssue ? (
                    <span className="size-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  ) : null}
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors group-hover:bg-muted/60 group-hover:text-foreground">
                    <XIcon className="size-2.5" strokeWidth={2.25} />
                  </span>
                </button>
              )
            })}
            {hiddenChipCount > 0 ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-full border border-border/60 bg-background px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground dark:hover:bg-muted/30"
              >
                +{hiddenChipCount} more
              </button>
            ) : null}
          </div>
        ) : null}
      </ComposerSection>

      <AccountSelectorDialog
        open={open}
        onOpenChange={handleOpenChange}
        search={search}
        onSearchChange={setSearch}
        providerFilter={providerFilter}
        onProviderFilterChange={setProviderFilter}
        providers={providers}
        filteredAccounts={filteredAccounts}
        selectedSet={selectedSet}
        selectedCount={selectedCount}
        totalCount={totalCount}
        isSearching={isSearching}
        accountsWithIssues={accountsWithIssues}
        duplicateNameKeys={duplicateNameKeys}
        filteredAllSelected={filteredAllSelected}
        onToggle={onToggle}
        onSelectVisible={handleSelectVisible}
        onClearAll={onClearAll}
      />
    </>
  )
}
