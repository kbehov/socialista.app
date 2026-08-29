'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import { getBillingPortalUrl } from '@/utils/billing-urls'
import { ArrowUpRightIcon, CircleUserIcon, CreditCardIcon, LogOutIcon } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { getInitials } from '@/utils/user'

export function UserDropdown({ className }: { className?: string }) {
  const { data: session, status } = useSession()
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace)

  const user = session?.user
  const name = user?.name?.trim() || 'Account'
  const email = user?.email ?? ''
  const avatar = user?.image ?? ''
  const plan = currentWorkspace?.billing.plan ?? 'free'
  const workspaceId = currentWorkspace?.id
  const billingHref = plan !== 'free' && workspaceId ? getBillingPortalUrl(workspaceId) : DASHBOARD_ROUTES.UPGRADE

  if (status === 'loading') {
    return <Skeleton className="size-7 shrink-0 rounded-[6px]" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            'p-0 text-muted-foreground transition-colors',
            'hover:bg-muted/60 hover:text-foreground aria-expanded:bg-muted/60',
            className,
          )}
          aria-label="Open account menu"
        >
          <Avatar className="size-5 rounded-full after:rounded-full">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="rounded-full text-[9px] font-medium">{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-60 p-1.5">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <Avatar className="size-9 shrink-0">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-xs font-medium">{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 gap-0.5 text-left leading-none">
              <span className="truncate text-sm font-medium">{name}</span>
              {email ? <span className="truncate text-xs text-muted-foreground">{email}</span> : null}
              <span className="truncate text-[11px] text-muted-foreground">
                {plan.charAt(0).toUpperCase()}
                {plan.slice(1)} plan
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={DASHBOARD_ROUTES.ACCOUNT}>
              <CircleUserIcon />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={DASHBOARD_ROUTES.UPGRADE}>
              <ArrowUpRightIcon />
              Upgrade plan
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={billingHref}>
              <CreditCardIcon />
              {plan !== 'free' ? 'Manage billing' : 'Billing'}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() =>
            void signOut({
              redirect: true,
              redirectTo: '/',
            })
          }
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
