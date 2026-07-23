'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Account, SocialProvider } from '@socialista/types'
import { CheckIcon, ChevronsUpDownIcon, SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ComposerSection } from './composer-section'

type AccountSelectorProps = {
  accounts: Account[]
  selectedAccountIds: string[]
  onToggle: (accountId: string) => void
  onSelectAccounts: (accountIds: string[]) => void
  onClearAll: () => void
  accountsWithIssues?: Set<string>
  className?: string
}

function normalizeHandle(username?: string) {
  if (!username) return ''
  return username.replace(/^@/, '')
}

function accountMatchesSearch(account: Account, query: string) {
  const handle = normalizeHandle(account.username)
  const haystack = [
    account.accountName,
    handle,
    handle ? `@${handle}` : '',
    getSocialPlatformLabel(account.provider),
    account.provider,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

function buildDuplicateNameKeys(accounts: Account[]) {
  const counts = new Map<string, number>()
  for (const account of accounts) {
    const key = account.accountName.trim().toLowerCase()
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

function hasDuplicateName(account: Account, duplicateNameKeys: Map<string, number>) {
  const key = account.accountName.trim().toLowerCase()
  return (duplicateNameKeys.get(key) ?? 0) > 1
}

function getAccountPrimaryLabel(account: Account, duplicateNameKeys: Map<string, number>) {
  const handle = normalizeHandle(account.username)
  if (hasDuplicateName(account, duplicateNameKeys) && handle) {
    return `@${handle}`
  }
  return account.accountName
}

function getAccountSecondaryLabel(account: Account, duplicateNameKeys: Map<string, number>) {
  const handle = normalizeHandle(account.username)
  const platform = getSocialPlatformLabel(account.provider)

  if (hasDuplicateName(account, duplicateNameKeys)) {
    return handle ? `${account.accountName} · ${platform}` : platform
  }

  return handle ? `@${handle} · ${platform}` : platform
}

function getChipLabel(account: Account, duplicateNameKeys: Map<string, number>) {
  const handle = normalizeHandle(account.username)
  if (hasDuplicateName(account, duplicateNameKeys) && handle) {
    return `@${handle}`
  }
  if (handle) return `@${handle}`
  return account.accountName
}

function SelectionCheckbox({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background dark:border-input/80',
      )}
    >
      {selected ? <CheckIcon className="size-2.5" strokeWidth={3} /> : null}
    </span>
  )
}

export function AccountSelector({
  accounts,
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

  const selectedCount = selectedAccountIds.length
  const selectedSet = useMemo(() => new Set(selectedAccountIds), [selectedAccountIds])
  const duplicateNameKeys = useMemo(() => buildDuplicateNameKeys(accounts), [accounts])

  const providers = useMemo(
    () => [...new Set(accounts.map(account => account.provider))],
    [accounts],
  )

  const filteredAccounts = useMemo(
    () =>
      providerFilter === 'all'
        ? accounts
        : accounts.filter(account => account.provider === providerFilter),
    [accounts, providerFilter],
  )

  const searchedAccounts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return filteredAccounts
    return filteredAccounts.filter(account => accountMatchesSearch(account, query))
  }, [filteredAccounts, search])

  const filteredAllSelected =
    filteredAccounts.length > 0 &&
    filteredAccounts.every(account => selectedSet.has(account._id))

  const selectedAccounts = useMemo(
    () => accounts.filter(account => selectedSet.has(account._id)),
    [accounts, selectedSet],
  )

  const visibleChips = selectedAccounts.slice(0, 4)
  const hiddenChipCount = Math.max(0, selectedAccounts.length - visibleChips.length)

  useEffect(() => {
    if (!open) {
      setSearch('')
      setProviderFilter('all')
    }
  }, [open])

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
          accounts.length > 20
            ? 'Search and select from your connected accounts.'
            : 'Choose where this post will be published.'
        }
        compact
        className={className}
        contentClassName="space-y-2 pt-0"
        badge={
          selectedCount > 0 ? (
            <Badge
              variant="outline"
              className="h-5 rounded-full border-border/60 bg-background px-2 text-[10px] font-medium tabular-nums"
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
          className="h-9 w-full justify-between rounded-lg border-border/50 bg-background px-3 text-xs font-normal shadow-none hover:bg-muted/30 dark:hover:bg-muted/20"
          onClick={() => setOpen(true)}
        >
          <span className="truncate text-muted-foreground">
            {selectedCount === 0
              ? `Select from ${accounts.length} account${accounts.length === 1 ? '' : 's'}…`
              : `${selectedCount} account${selectedCount === 1 ? '' : 's'} selected`}
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        </Button>

        {selectedCount > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            {visibleChips.map(account => {
              const hasIssue = accountsWithIssues?.has(account._id)
              const chipLabel = getChipLabel(account, duplicateNameKeys)

              return (
                <button
                  key={account._id}
                  type="button"
                  onClick={() => onToggle(account._id)}
                  title={getAccountSecondaryLabel(account, duplicateNameKeys)}
                  className={cn(
                    'inline-flex max-w-[11rem] items-center gap-1 rounded-md border bg-background py-0.5 pr-1 pl-1 text-[10px] font-medium transition-colors',
                    'hover:bg-muted/40 dark:hover:bg-muted/30',
                    hasIssue
                      ? 'border-amber-500/35 text-amber-700 dark:border-amber-500/40 dark:text-amber-300'
                      : 'border-border/60 text-foreground',
                  )}
                >
                  <SocialPlatformIcon
                    provider={account.provider}
                    size={9}
                    framed={false}
                    className="size-3 shrink-0"
                  />
                  <span className="truncate">{chipLabel}</span>
                  <XIcon className="size-2.5 shrink-0 text-muted-foreground" strokeWidth={2} />
                </button>
              )
            })}
            {hiddenChipCount > 0 ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground dark:hover:bg-muted/30"
              >
                +{hiddenChipCount} more
              </button>
            ) : null}
          </div>
        ) : null}
      </ComposerSection>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden bg-background p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border/50 px-4 py-3">
            <DialogTitle className="text-sm font-semibold tracking-tight">
              Select accounts
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedCount} of {accounts.length} selected
            </DialogDescription>
          </DialogHeader>

          {providers.length > 1 ? (
            <div className="flex gap-1 overflow-x-auto border-b border-border/50 px-3 py-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setProviderFilter('all')}
                className={cn(
                  'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors',
                  providerFilter === 'all'
                    ? 'border-border bg-muted/60 text-foreground dark:bg-muted/40'
                    : 'border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground dark:hover:bg-muted/20',
                )}
              >
                All
              </button>
              {providers.map(provider => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setProviderFilter(provider)}
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors',
                    providerFilter === provider
                      ? 'border-border bg-muted/60 text-foreground dark:bg-muted/40'
                      : 'border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground dark:hover:bg-muted/20',
                  )}
                >
                  <SocialPlatformIcon provider={provider} size={9} framed={false} className="size-3" />
                  {getSocialPlatformLabel(provider)}
                </button>
              ))}
            </div>
          ) : null}

          <div className="border-b border-border/50 px-3 py-2">
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
              />
              <Input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search by name, handle, or platform…"
                className="h-8 border-border/50 bg-background pl-8 text-xs shadow-none dark:bg-background"
              />
            </div>
          </div>

          <ScrollArea className="max-h-[min(50vh,22rem)]" scrollbarGutter>
            <div className="space-y-0.5 p-2">
              {searchedAccounts.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No accounts match your search.
                </p>
              ) : (
                searchedAccounts.map(account => {
                  const selected = selectedSet.has(account._id)
                  const hasIssue = accountsWithIssues?.has(account._id)
                  const initials = (account.accountName || account.username || '?')
                    .slice(0, 2)
                    .toUpperCase()

                  return (
                    <button
                      key={account._id}
                      type="button"
                      onClick={() => onToggle(account._id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors',
                        'hover:bg-muted/60 dark:hover:bg-muted/30',
                        selected && 'bg-primary/5 dark:bg-primary/10',
                      )}
                    >
                      <SelectionCheckbox selected={selected} />

                      <Avatar className="size-7 rounded-md ring-1 ring-border/40">
                        {account.accountAvatar ? (
                          <AvatarImage src={account.accountAvatar} alt={account.accountName} />
                        ) : null}
                        <AvatarFallback className="rounded-md text-[9px] font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-medium text-foreground">
                            {getAccountPrimaryLabel(account, duplicateNameKeys)}
                          </span>
                          {hasIssue ? (
                            <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                          ) : null}
                        </span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {getAccountSecondaryLabel(account, duplicateNameKeys)}
                        </span>
                      </span>

                      <SocialPlatformIcon
                        provider={account.provider}
                        size={10}
                        framed={false}
                        className="size-3.5 shrink-0 opacity-70"
                      />
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="flex-row justify-between border-t border-border/50 bg-background px-4 py-3">
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 rounded-md px-2 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={handleSelectVisible}
                disabled={filteredAllSelected}
              >
                {providerFilter === 'all' ? 'Select all' : 'Select visible'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 rounded-md px-2 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={onClearAll}
                disabled={selectedCount === 0}
              >
                Clear
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              className="h-7 rounded-md px-3 text-xs"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
