'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import { WorkspaceResponse } from '@socialista/types'
import { ChevronsUpDownIcon, PlusIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'

function WorkspaceAvatar({ workspace }: { workspace: WorkspaceResponse }) {
  return (
    <div className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-sidebar-primary text-sidebar-primary-foreground">
      {workspace.logo ? (
        <Image src={workspace.logo} alt={workspace.name} width={24} height={24} className="size-full object-cover" />
      ) : (
        <span className="text-xs font-medium">{workspace.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )
}

export function TeamSwitcher({ workspaces }: { workspaces: WorkspaceResponse[] }) {
  const { isMobile } = useSidebar()
  const { currentWorkspace } = useWorkspaceStore()
  const { setCurrentWorkspace } = useWorkspaceStoreActions()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return

      const index = Number.parseInt(event.key, 10) - 1
      if (index < 0 || index >= workspaces.length) return

      event.preventDefault()
      setCurrentWorkspace(workspaces[index] ?? null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [workspaces, setCurrentWorkspace])

  if (!currentWorkspace) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={currentWorkspace.name}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {currentWorkspace.logo ? (
                  <Image
                    src={currentWorkspace.logo}
                    alt={currentWorkspace.name}
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">{currentWorkspace.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{currentWorkspace.name}</span>
                <span className="truncate text-xs capitalize">{currentWorkspace.billing.plan}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
            {workspaces.map((workspace, index) => (
              <DropdownMenuItem
                key={workspace._id}
                onClick={() => setCurrentWorkspace(workspace)}
                className="gap-2 p-2"
              >
                <WorkspaceAvatar workspace={workspace} />
                <span className="truncate">{workspace.name}</span>
                {index < 9 ? <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" disabled>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
