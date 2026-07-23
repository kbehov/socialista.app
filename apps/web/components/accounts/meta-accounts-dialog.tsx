'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { MetaCandidate } from '@socialista/types'
import { CheckIcon, Loader2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

type MetaAccountsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnected?: () => void
}

type AccountsResponse = {
  workspaceId: string
  accounts: MetaCandidate[]
}

type FinalizeResponse = {
  summary: {
    created: number
    skipped: number
    failed: number
  }
}

function MetaAccountSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background px-3 py-3">
      <Skeleton className="size-5 shrink-0 rounded-md" />
      <Skeleton className="size-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  )
}

export function MetaAccountsDialog({ open, onOpenChange, onConnected }: MetaAccountsDialogProps) {
  const [accounts, setAccounts] = useState<MetaCandidate[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, startLoad] = useTransition()
  const [isSaving, startSave] = useTransition()
  const loadedForOpen = useRef(false)

  const loadAccounts = useCallback(() => {
    startLoad(async () => {
      setLoadError(null)
      try {
        const response = await fetch('/api/connect/facebook/accounts')
        const payload = (await response.json().catch(() => null)) as
          | AccountsResponse
          | { message?: string; error?: string }
          | null

        if (!response.ok) {
          throw new Error(
            (payload && 'message' in payload && payload.message) ||
              'Failed to load Facebook accounts',
          )
        }

        const list = (payload as AccountsResponse).accounts ?? []
        setAccounts(list)
        setSelected(
          new Set(list.filter(account => !account.alreadyConnected).map(account => account.id)),
        )
      } catch (error) {
        setAccounts([])
        setSelected(new Set())
        setLoadError(error instanceof Error ? error.message : 'Failed to load accounts')
      }
    })
  }, [])

  useEffect(() => {
    if (!open) {
      loadedForOpen.current = false
      return
    }
    if (loadedForOpen.current) return
    loadedForOpen.current = true
    queueMicrotask(() => {
      loadAccounts()
    })
  }, [open, loadAccounts])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setAccounts([])
      setSelected(new Set())
      setLoadError(null)
      loadedForOpen.current = false
    }
    onOpenChange(next)
  }

  const selectableAccounts = accounts.filter(account => !account.alreadyConnected)
  const selectableCount = selectableAccounts.length
  const allSelected =
    selectableCount > 0 && selectableAccounts.every(account => selected.has(account.id))

  const toggle = (id: string, disabled: boolean) => {
    if (disabled) return
    setSelected(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
      return
    }
    setSelected(new Set(selectableAccounts.map(account => account.id)))
  }

  const handleConnect = () => {
    const accountIds = [...selected]
    if (accountIds.length === 0) {
      toast.error('Select at least one account to connect')
      return
    }

    startSave(async () => {
      try {
        const response = await fetch('/api/connect/facebook/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountIds }),
        })
        const payload = (await response.json().catch(() => null)) as
          | FinalizeResponse
          | { message?: string }
          | null

        if (!response.ok) {
          throw new Error(
            (payload && 'message' in payload && payload.message) ||
              'Failed to connect accounts',
          )
        }

        const summary = (payload as FinalizeResponse).summary
        if (summary.created > 0) {
          toast.success(
            summary.created === 1
              ? 'Account connected'
              : `${summary.created} accounts connected`,
          )
        } else if (summary.skipped > 0 && summary.failed === 0) {
          toast.message('Selected accounts were already connected')
        }

        if (summary.failed > 0) {
          toast.error(
            summary.failed === 1
              ? 'One account failed to connect'
              : `${summary.failed} accounts failed to connect`,
          )
        }

        handleOpenChange(false)
        onConnected?.()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to connect accounts')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(88vh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="border-b border-border/50 px-6 py-5">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Select Meta accounts
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              Choose Facebook Pages and/or Instagram accounts. You can connect Instagram alone
              without selecting its Facebook Page.
            </DialogDescription>
          </DialogHeader>
        </div>

        {selectableCount > 0 && !isLoading && !loadError && accounts.length > 0 ? (
          <div className="flex items-center justify-between border-b border-border/40 px-6 py-2.5">
            <p className="text-xs text-muted-foreground">
              {selected.size} of {selectableCount} selected
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={toggleAll}
              disabled={isSaving}
            >
              {allSelected ? 'Clear all' : 'Select all'}
            </Button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {isLoading && accounts.length === 0 && !loadError ? (
            <div className="grid gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <MetaAccountSkeleton key={i} />
              ))}
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">{loadError}</p>
              <Button type="button" size="sm" variant="outline" onClick={loadAccounts}>
                Try again
              </Button>
            </div>
          ) : accounts.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No Facebook Pages or Instagram accounts were found for this login.
            </p>
          ) : (
            <ul className="grid gap-1.5">
              {accounts.map(account => {
                const disabled = account.alreadyConnected
                const checked = disabled || selected.has(account.id)

                return (
                  <li key={account.id}>
                    <button
                      type="button"
                      disabled={disabled || isSaving}
                      onClick={() => toggle(account.id, disabled)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-150',
                        disabled
                          ? 'cursor-default border-border/40 bg-muted/20 opacity-60'
                          : 'border-border/60 bg-background hover:-translate-y-px hover:border-border hover:shadow-sm active:scale-[0.99]',
                        checked && !disabled && 'border-foreground/15 bg-muted/30 shadow-xs',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150',
                          checked
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border/80 bg-background',
                        )}
                        aria-hidden
                      >
                        {checked ? <CheckIcon className="size-3" strokeWidth={2.5} /> : null}
                      </span>
                      {account.accountAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element -- provider CDN avatars
                        <img
                          src={account.accountAvatar}
                          alt=""
                          width={36}
                          height={36}
                          className="size-9 rounded-lg object-cover ring-1 ring-border/50"
                        />
                      ) : (
                        <SocialPlatformIcon
                          provider={account.provider}
                          size={16}
                          className="size-9 rounded-lg"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium tracking-tight text-foreground">
                          {account.accountName}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {getSocialPlatformLabel(account.provider)}
                          {account.username ? ` · @${account.username}` : ''}
                          {disabled ? ' · Already connected' : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="border-t border-border/50 bg-muted/10 px-6 py-4 sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {selectableCount === 0
              ? 'All available accounts are already connected'
              : `${selected.size} selected`}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg shadow-xs"
              onClick={handleConnect}
              disabled={isLoading || isSaving || selected.size === 0}
            >
              {isSaving ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Connect
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
