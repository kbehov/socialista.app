'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  getAccountInitials,
  getAccountPrimaryLabel,
  getAccountSecondaryLabel,
} from '@/utils/account-display.utils'
import type { AccountSummary, SocialProvider } from '@socialista/types'
import { CheckIcon, SearchIcon } from 'lucide-react'

type AccountSelectorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  search: string
  onSearchChange: (value: string) => void
  providerFilter: SocialProvider | 'all'
  onProviderFilterChange: (value: SocialProvider | 'all') => void
  providers: SocialProvider[]
  filteredAccounts: AccountSummary[]
  selectedSet: Set<string>
  selectedCount: number
  totalCount: number
  isSearching: boolean
  accountsWithIssues?: Set<string>
  duplicateNameKeys: Map<string, number>
  filteredAllSelected: boolean
  onToggle: (accountId: string) => void
  onSelectVisible: () => void
  onClearAll: () => void
}

function SelectionCheckbox({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background dark:border-input/80',
      )}
    >
      {selected ? <CheckIcon className="size-2.5" strokeWidth={3} /> : null}
    </span>
  )
}

export function AccountSelectorDialog({
  open,
  onOpenChange,
  search,
  onSearchChange,
  providerFilter,
  onProviderFilterChange,
  providers,
  filteredAccounts,
  selectedSet,
  selectedCount,
  totalCount,
  isSearching,
  accountsWithIssues,
  duplicateNameKeys,
  filteredAllSelected,
  onToggle,
  onSelectVisible,
  onClearAll,
}: AccountSelectorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden bg-background p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border/50 px-4 py-3.5">
          <DialogTitle className="text-sm font-semibold tracking-tight">Select accounts</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {selectedCount} of {totalCount} selected
          </DialogDescription>
        </DialogHeader>

        {providers.length > 1 ? (
          <div className="flex gap-1 overflow-x-auto border-b border-border/50 px-3 py-2 scrollbar-none">
            <button
              type="button"
              onClick={() => onProviderFilterChange('all')}
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors active:scale-[0.97]',
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
                onClick={() => onProviderFilterChange(provider)}
                className={cn(
                  'flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors active:scale-[0.97]',
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

        <div className="border-b border-border/50 px-3 py-2.5">
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <Input
              value={search}
              onChange={event => onSearchChange(event.target.value)}
              placeholder="Search by name, handle, or platform…"
              className="h-9 rounded-xl border-border/50 bg-background pl-8 text-xs shadow-none dark:bg-background"
            />
          </div>
        </div>

        <ScrollArea className="max-h-[min(50vh,22rem)]" scrollbarGutter>
          <div className="space-y-0.5 p-2">
            {isSearching ? (
              <p className="py-10 text-center text-xs text-muted-foreground">Searching…</p>
            ) : filteredAccounts.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <SearchIcon className="mb-2 size-4 text-muted-foreground/50" strokeWidth={1.75} />
                <p className="text-xs text-muted-foreground">No accounts match your search.</p>
              </div>
            ) : (
              filteredAccounts.map(account => {
                const selected = selectedSet.has(account._id)
                const hasIssue = accountsWithIssues?.has(account._id)

                return (
                  <button
                    key={account._id}
                    type="button"
                    onClick={() => onToggle(account._id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors',
                      'hover:bg-muted/60 dark:hover:bg-muted/30',
                      'active:scale-[0.995]',
                      selected && 'bg-primary/5 dark:bg-primary/10',
                    )}
                  >
                    <SelectionCheckbox selected={selected} />

                    <Avatar className="size-8 rounded-lg ring-1 ring-border/40">
                      {account.accountAvatar ? (
                        <AvatarImage src={account.accountAvatar} alt={account.accountName} />
                      ) : null}
                      <AvatarFallback className="rounded-lg text-[9px] font-medium">
                        {getAccountInitials(account)}
                      </AvatarFallback>
                    </Avatar>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-medium text-foreground">
                          {getAccountPrimaryLabel(account, duplicateNameKeys)}
                        </span>
                        {hasIssue ? (
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-amber-500"
                            title="Needs attention"
                          />
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

        <DialogFooter className="flex-row justify-between border-t border-border/50 bg-muted/15 px-4 py-3">
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-lg px-2 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={onSelectVisible}
              disabled={filteredAllSelected}
            >
              {providerFilter === 'all' ? 'Select all' : 'Select visible'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-lg px-2 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={onClearAll}
              disabled={selectedCount === 0}
            >
              Clear
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-7 rounded-full px-3.5 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
