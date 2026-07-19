'use client'

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
import { cn } from '@/lib/utils'
import { deleteAccount, disconnectAccount } from '@/services/account.service'
import { formatRelativeTime } from '@/utils/format'
import type { Account, ConnectionStatus } from '@socialista/types'
import {
  MoreHorizontalIcon,
  UnplugIcon,
  Trash2Icon,
  GlobeIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type AccountsTableProps = {
  accounts: Account[]
  className?: string
}

type ConfirmAction = {
  type: 'disconnect' | 'delete'
  account: Account
}

const STATUS_META: Record<
  ConnectionStatus,
  { label: string; className: string; dotClassName: string }
> = {
  connected: {
    label: 'Connected',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    dotClassName: 'bg-amber-500',
  },
  disconnected: {
    label: 'Disconnected',
    className: 'border-border bg-muted/60 text-muted-foreground',
    dotClassName: 'bg-muted-foreground/50',
  },
  error: {
    label: 'Error',
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
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

function formatTimezoneLabel(timezone: string) {
  const city = timezone.split('/').pop()?.replaceAll('_', ' ')
  return city ?? timezone
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
    <Badge variant="outline" className={cn('gap-1.5 font-medium', meta.className)}>
      <span className={cn('size-1.5 rounded-full', meta.dotClassName)} aria-hidden />
      {meta.label}
    </Badge>
  )
}

function AccountIdentity({ account }: { account: Account }) {
  const handle = account.username ? `@${account.username.replace(/^@/, '')}` : null

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative shrink-0">
        <Avatar size="lg" className="size-10 ring-1 ring-border/60">
          {account.accountAvatar ? (
            <AvatarImage src={account.accountAvatar} alt="" />
          ) : null}
          <AvatarFallback className="bg-muted text-[11px] font-semibold tracking-wide">
            {getInitials(account.accountName)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-md bg-background text-foreground shadow-xs ring-1 ring-border/70">
          <SocialPlatformIcon provider={account.provider} size={9} framed={false} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium tracking-tight text-foreground">
          {account.accountName}
        </p>
        {handle ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{handle}</p>
        ) : (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground md:hidden">
            {getSocialPlatformLabel(account.provider)}
          </p>
        )}
      </div>
    </div>
  )
}

export function AccountsTable({ accounts, className }: AccountsTableProps) {
  const router = useRouter()
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
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
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs',
          className,
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
              <TableHead className="h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Account
              </TableHead>
              <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell">
                Platform
              </TableHead>
              <TableHead className="h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Status
              </TableHead>
              <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
                Timezone
              </TableHead>
              <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
                Connected
              </TableHead>
              <TableHead className="h-11 w-[52px] px-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map(account => {
              const platformLabel = getSocialPlatformLabel(account.provider)
              const timezoneCity = formatTimezoneLabel(account.timezone)
              const canDisconnect = account.connectionStatus === 'connected'

              return (
                <TableRow key={account._id} className="group border-border/50 hover:bg-muted/25">
                  <TableCell className="px-4 py-3.5 whitespace-normal">
                    <AccountIdentity account={account} />
                  </TableCell>

                  <TableCell className="hidden px-4 py-3.5 sm:table-cell">
                    <div className="flex items-center gap-2.5">
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

                  <TableCell className="hidden px-4 py-3.5 md:table-cell">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex max-w-[160px] cursor-default items-center gap-1.5 text-xs text-muted-foreground">
                          <GlobeIcon className="size-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
                          <span className="truncate">{timezoneCity}</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">{account.timezone}</TooltipContent>
                    </Tooltip>
                  </TableCell>

                  <TableCell className="hidden px-4 py-3.5 lg:table-cell">
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
                    <div className="flex justify-end opacity-70 transition-opacity group-hover:opacity-100">
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
                          {canDisconnect ? (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  setConfirmAction({ type: 'disconnect', account })
                                }
                              >
                                <UnplugIcon />
                                Disconnect
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          ) : null}
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
