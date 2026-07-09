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
import { CreditCardIcon, LogOutIcon } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Badge } from '../ui/badge'

function getInitials(name?: string | null) {
  if (!name?.trim()) return '?'

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()

  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
}

export function UserDropdown() {
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
    return <Skeleton className="size-8 shrink-0 rounded-full" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn('rounded-full p-0 transition-colors', 'hover:bg-muted/80 aria-expanded:bg-muted')}
          aria-label="Open account menu"
        >
          <Avatar className="size-7 ring-1 ring-border/60">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-[11px] font-medium">{getInitials(user?.name)}</AvatarFallback>
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
              <span className="truncate text-[11px] capitalize text-muted-foreground/80">{plan} plan</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={DASHBOARD_ROUTES.UPGRADE}>
              <Badge variant="default">Pro</Badge>
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
