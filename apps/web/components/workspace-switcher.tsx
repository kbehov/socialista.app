'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { CreateWorkspaceDialog } from '@/components/workspace/create-workspace-dialog'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { isWorkspaceAdmin } from '@/lib/workspace-role'
import { getWorkspaceId, useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import { WorkspaceResponse } from '@socialista/types'
import { CheckIcon, ChevronDownIcon, PlusIcon, Settings2Icon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const SWITCHER_ICON_STROKE = 1.5

type WorkspaceAvatarProps = {
  workspace: WorkspaceResponse
  className?: string
}

function WorkspaceAvatar({ workspace, className }: WorkspaceAvatarProps) {
  return (
    <div className={cn('sidebar-switcher-avatar', className)}>
      {workspace.logo ? (
        <Image
          src={workspace.logo}
          alt=""
          width={20}
          height={20}
          className="size-full object-cover"
        />
      ) : (
        <span className="font-medium">{workspace.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )
}

export function TeamSwitcher({ workspaces }: { workspaces: WorkspaceResponse[] }) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { data: session } = useSession()
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace)
  const storedWorkspaces = useWorkspaceStore(state => state.workspaces)
  const { setCurrentWorkspace } = useWorkspaceStoreActions()
  const [createOpen, setCreateOpen] = useState(false)
  const workspaceList = storedWorkspaces.length > 0 ? storedWorkspaces : workspaces
  const showSettings = isWorkspaceAdmin(currentWorkspace, session?.user?.id)
  const currentWorkspaceId = currentWorkspace ? (getWorkspaceId(currentWorkspace) ?? currentWorkspace._id) : null

  if (!currentWorkspace) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={currentWorkspace.name}
              className="h-7 gap-1.5 px-1.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
            >
              <WorkspaceAvatar workspace={currentWorkspace} />
              <span className="min-w-0 flex-1 truncate font-medium tracking-tight group-data-[collapsible=icon]:hidden">
                {currentWorkspace.name}
              </span>
              <ChevronDownIcon
                className="ml-auto size-3! text-muted-foreground group-data-[collapsible=icon]:hidden"
                strokeWidth={2}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuLabel className="sidebar-switcher-meta px-2 py-1.5 text-xs font-medium">
              Workspaces
            </DropdownMenuLabel>
            {workspaceList.map(workspace => {
              const workspaceId = getWorkspaceId(workspace) ?? workspace._id
              const isSelected = workspaceId === currentWorkspaceId

              return (
                <DropdownMenuItem
                  key={workspaceId}
                  onClick={() => {
                    setCurrentWorkspace(workspace)
                    router.refresh()
                  }}
                  className="gap-2.5 px-2 py-2"
                >
                  <WorkspaceAvatar workspace={workspace} />
                  <span className="min-w-0 flex-1 truncate text-sm">{workspace.name}</span>
                  {isSelected ? (
                    <CheckIcon className="size-3.5 shrink-0 text-foreground" strokeWidth={SWITCHER_ICON_STROKE} />
                  ) : null}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            {showSettings ? (
              <DropdownMenuItem asChild className="gap-2.5 px-2 py-2">
                <Link href={DASHBOARD_ROUTES.SETTINGS}>
                  <Settings2Icon
                    className="size-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={SWITCHER_ICON_STROKE}
                  />
                  <span className="font-medium">Settings</span>
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem className="gap-2.5 px-2 py-2" onSelect={() => setCreateOpen(true)}>
              <PlusIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={SWITCHER_ICON_STROKE} />
              <span className="text-muted-foreground">Add workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
