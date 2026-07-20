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
import { cn } from '@/lib/utils'
import type { MetaCandidate } from '@/lib/social-connect/types'
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

  const selectableCount = accounts.filter(account => !account.alreadyConnected).length

  const toggle = (id: string, disabled: boolean) => {
    if (disabled) return
    setSelected(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
        <div className="border-b border-border/60 px-6 py-5">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle>Select Meta accounts</DialogTitle>
            <DialogDescription>
              Choose the Facebook Pages and Instagram accounts to add to this workspace.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {isLoading && accounts.length === 0 && !loadError ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Loading accounts…
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
            <ul className="grid gap-2">
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
                        'flex w-full items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-3 text-left transition-colors',
                        disabled ? 'cursor-default opacity-60' : 'hover:bg-muted/50',
                        checked && !disabled && 'border-foreground/20 bg-muted/40',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-md border',
                          checked
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background',
                        )}
                        aria-hidden
                      >
                        {checked ? <CheckIcon className="size-3.5" strokeWidth={2.5} /> : null}
                      </span>
                      {account.accountAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element -- provider CDN avatars
                        <img
                          src={account.accountAvatar}
                          alt=""
                          width={36}
                          height={36}
                          className="size-9 rounded-lg object-cover ring-1 ring-border/60"
                        />
                      ) : (
                        <SocialPlatformIcon
                          provider={account.provider}
                          size={16}
                          className="size-9 rounded-lg"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
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

        <DialogFooter className="border-t border-border/60 px-6 py-4 sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {selectableCount === 0
              ? 'All available accounts are already connected'
              : `${selected.size} selected`}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
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
