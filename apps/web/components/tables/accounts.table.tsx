'use client'

import { EditAccountDialog } from '@/components/accounts/edit-account-dialog'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import {
  getSocialPlatformLabel,
  SocialPlatformIcon,
} from '@/components/icons/social-platform-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatTimezoneCity } from '@/lib/timezone'
import { cn } from '@/lib/utils'
import { deleteAccount, disconnectAccount } from '@/services/account.service'
import { formatRelativeTime } from '@/utils/format'
import type { AccountSummary, ConnectionStatus, SocialProvider } from '@socialista/types'
import {
  MoreHorizontalIcon,
  PencilIcon,
  UnplugIcon,
  Trash2Icon,
  GlobeIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

type AccountsTableProps = {
  accounts: AccountSummary[]
  className?: string
}

type ConfirmAction = {
  type: 'disconnect' | 'delete'
  account: AccountSummary
}

const STATUS_META: Record<
  ConnectionStatus,
  { label: string; className: string; dotClassName: string; pulse?: boolean }
> = {
  connected: {
    label: 'Connected',
    className: 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500',
    pulse: true,
  },
  pending: {
    label: 'Pending',
    className: 'border-amber-500/25 bg-amber-500/[0.08] text-amber-700 dark:text-amber-400',
    dotClassName: 'bg-amber-500',
  },
  disconnected: {
    label: 'Disconnected',
    className: 'border-border/80 bg-muted/50 text-muted-foreground',
    dotClassName: 'bg-muted-foreground/40',
  },
  error: {
    label: 'Error',
    className: 'border-destructive/25 bg-destructive/[0.08] text-destructive',
    dotClassName: 'bg-destructive',
  },
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
}

function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const meta = STATUS_META[status]

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 border px-2 py-0.5 text-[11px] font-medium', meta.className)}
    >
      <span className="relative flex size-1.5" aria-hidden>
        <span className={cn('absolute inset-0 rounded-full', meta.dotClassName)} />
        {meta.pulse ? (
          <span
            className={cn(
              'absolute inset-0 animate-ping rounded-full opacity-60',
              meta.dotClassName,
            )}
          />
        ) : null}
      </span>
      {meta.label}
    </Badge>
  )
}

function AccountIdentity({ account }: { account: AccountSummary }) {
  const handle = account.username ? `@${account.username.replace(/^@/, '')}` : null
  const platformLabel = getSocialPlatformLabel(account.provider)

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative shrink-0">
        <Avatar
          size="lg"
          className="size-10 ring-1 ring-border/50 transition-shadow duration-150 group-hover:ring-border"
        >
          {account.accountAvatar ? <AvatarImage src={account.accountAvatar} alt="" /> : null}
          <AvatarFallback className="bg-muted/80 text-[11px] font-semibold tracking-wide text-muted-foreground">
            {getInitials(account.accountName)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -right-0.5 -bottom-0.5 flex size-[18px] items-center justify-center rounded-[5px] bg-background shadow-xs ring-1 ring-border/60">
          <SocialPlatformIcon provider={account.provider} size={9} framed={false} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium tracking-tight text-foreground">
          {account.accountName}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {handle ?? platformLabel}
        </p>
      </div>
    </div>
  )
}

function AccountsSummary({ accounts }: { accounts: AccountSummary[] }) {
  const connectedCount = accounts.filter(a => a.connectionStatus === 'connected').length
  const platforms = useMemo(() => {
    const seen = new Set<SocialProvider>()
    for (const account of accounts) {
      seen.add(account.provider)
    }
    return [...seen]
  }, [accounts])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <p className="text-[13px] font-medium tracking-tight text-foreground">
          {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
        </p>
        <span className="hidden h-3 w-px bg-border/80 sm:block" aria-hidden />
        <p className="hidden text-[13px] text-muted-foreground sm:block">
          {connectedCount} connected
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {platforms.map(provider => (
          <Tooltip key={provider}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <SocialPlatformIcon
                  provider={provider}
                  size={12}
                  className="size-7 rounded-lg opacity-80 transition-opacity hover:opacity-100"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {getSocialPlatformLabel(provider)}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

function AccountCard({
  account,
  onAction,
  onEdit,
}: {
  account: AccountSummary
  onAction: (action: ConfirmAction) => void
  onEdit: (account: AccountSummary) => void
}) {
  const platformLabel = getSocialPlatformLabel(account.provider)
  const timezoneCity = formatTimezoneCity(account.timezone)
  const canDisconnect = account.connectionStatus === 'connected'

  return (
    <article className="group rounded-xl border border-border/70 bg-background p-4 shadow-xs transition-all duration-150 hover:border-border hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <AccountIdentity account={account} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-8 shrink-0 rounded-lg opacity-60 transition-opacity group-hover:opacity-100"
              aria-label={`Actions for ${account.accountName}`}
            >
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(account)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            {canDisconnect ? (
              <>
                <DropdownMenuItem onClick={() => onAction({ type: 'disconnect', account })}>
                  <UnplugIcon />
                  Disconnect
                </DropdownMenuItem>
              </>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onAction({ type: 'delete', account })}
            >
              <Trash2Icon />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {account.lastError && account.connectionStatus === 'error' ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <ConnectionStatusBadge status={account.connectionStatus} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px]">
              {account.lastError}
            </TooltipContent>
          </Tooltip>
        ) : (
          <ConnectionStatusBadge status={account.connectionStatus} />
        )}

        <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
          <SocialPlatformIcon provider={account.provider} size={10} framed={false} />
          {platformLabel}
        </span>

        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <GlobeIcon className="size-3 opacity-70" strokeWidth={1.75} />
          {timezoneCity}
        </span>
      </div>

      <p className="mt-2.5 text-[11px] text-muted-foreground/80">
        Connected {formatRelativeTime(account.createdAt)}
      </p>
    </article>
  )
}

export function AccountsTable({ accounts, className }: AccountsTableProps) {
  const router = useRouter()
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [editAccount, setEditAccount] = useState<AccountSummary | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleConfirm = async () => {
    if (!confirmAction || isPending) return
    setIsPending(true)

    const { type, account } = confirmAction
    const response =
      type === 'disconnect'
        ? await disconnectAccount(account._id)
        : await deleteAccount(account._id)

    setIsPending(false)

    if (!response.success) {
      toast.error(
        response.message ??
          (type === 'disconnect' ? 'Failed to disconnect account' : 'Failed to remove account'),
      )
      return
    }

    toast.success(
      type === 'disconnect'
        ? `Disconnected “${account.accountName}”`
        : `Removed “${account.accountName}”`,
    )
    setConfirmAction(null)
    router.refresh()
  }

  return (
    <>
      <div className={cn('flex flex-col gap-3', className)}>
        <AccountsSummary accounts={accounts} />

        {/* Mobile card layout */}
        <div className="grid gap-2.5 sm:hidden">
          {accounts.map(account => (
            <AccountCard
              key={account._id}
              account={account}
              onAction={setConfirmAction}
              onEdit={setEditAccount}
            />
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-background shadow-xs sm:block">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-background hover:bg-background">
                <TableHead className="h-10 px-4 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Account
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase md:table-cell">
                  Platform
                </TableHead>
                <TableHead className="h-10 px-4 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Status
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase lg:table-cell">
                  Timezone
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase xl:table-cell">
                  Connected
                </TableHead>
                <TableHead className="h-10 w-[52px] px-2" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(account => {
                const platformLabel = getSocialPlatformLabel(account.provider)
                const timezoneCity = formatTimezoneCity(account.timezone)
                const canDisconnect = account.connectionStatus === 'connected'

                return (
                  <TableRow
                    key={account._id}
                    className="group border-border/40 bg-background transition-colors duration-150 hover:bg-muted/20"
                  >
                    <TableCell className="px-4 py-3.5 whitespace-normal">
                      <AccountIdentity account={account} />
                    </TableCell>

                    <TableCell className="hidden px-4 py-3.5 md:table-cell">
                      <div className="flex items-center gap-2">
                        <SocialPlatformIcon provider={account.provider} size={13} />
                        <span className="text-sm tracking-tight text-foreground">{platformLabel}</span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3.5">
                      {account.lastError && account.connectionStatus === 'error' ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <ConnectionStatusBadge status={account.connectionStatus} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px]">
                            {account.lastError}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <ConnectionStatusBadge status={account.connectionStatus} />
                      )}
                    </TableCell>

                    <TableCell className="hidden px-4 py-3.5 lg:table-cell">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex max-w-[160px] cursor-default items-center gap-1.5 text-xs text-muted-foreground">
                            <GlobeIcon className="size-3.5 shrink-0 opacity-60" strokeWidth={1.75} />
                            <span className="truncate">{timezoneCity}</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">{account.timezone}</TooltipContent>
                      </Tooltip>
                    </TableCell>

                    <TableCell className="hidden px-4 py-3.5 xl:table-cell">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default text-xs text-muted-foreground">
                            {formatRelativeTime(account.createdAt)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">{formatDate(account.createdAt)}</TooltipContent>
                      </Tooltip>
                    </TableCell>

                    <TableCell className="px-2 py-3.5">
                      <div className="flex justify-end opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              className="size-8 rounded-lg"
                              aria-label={`Actions for ${account.accountName}`}
                            >
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => setEditAccount(account)}>
                              <PencilIcon />
                              Edit
                            </DropdownMenuItem>
                            {canDisconnect ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  setConfirmAction({ type: 'disconnect', account })
                                }
                              >
                                <UnplugIcon />
                                Disconnect
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setConfirmAction({ type: 'delete', account })}
                            >
                              <Trash2Icon />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditAccountDialog
        account={editAccount}
        open={editAccount !== null}
        onOpenChange={open => {
          if (!open) setEditAccount(null)
        }}
        onUpdated={() => router.refresh()}
      />

      <DeleteConfirmDialog
        open={confirmAction !== null}
        onOpenChange={open => {
          if (!open) setConfirmAction(null)
        }}
        title={
          confirmAction?.type === 'disconnect' ? 'Disconnect account' : 'Remove account'
        }
        description={
          confirmAction?.type === 'disconnect'
            ? `“${confirmAction.account.accountName}” will be disconnected. You can reconnect it later.`
            : confirmAction
              ? `“${confirmAction.account.accountName}” will be removed from this workspace. This cannot be undone.`
              : ''
        }
        confirmLabel={
          confirmAction?.type === 'disconnect' ? 'Disconnect' : 'Remove account'
        }
        isDeleting={isPending}
        onConfirm={() => void handleConfirm()}
      />
    </>
  )
}
