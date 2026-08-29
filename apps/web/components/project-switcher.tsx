'use client'

import { CreateProjectDialog, EditProjectDialog } from '@/components/project/create-project-dialog'
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
import { cn } from '@/lib/utils'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { formatTimezoneLocation } from '@/utils/timezone'
import { ProjectResponse } from '@socialista/types'
import { CheckIcon, ChevronDownIcon, PlusIcon, Settings2Icon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const SWITCHER_ICON_STROKE = 1.5

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function projectTimezoneLabel(project: ProjectResponse): string | null {
  return project.timezone ? formatTimezoneLocation(project.timezone) : null
}

type SwitcherAvatarProps = {
  project: ProjectResponse
  className?: string
}

function ProjectAvatar({ project, className }: SwitcherAvatarProps) {
  return (
    <div
      className={cn('sidebar-switcher-avatar', className)}
      style={!project.icon && project.color ? { backgroundColor: project.color } : undefined}
    >
      {project.icon ? (
        <Image
          src={project.icon}
          alt=""
          width={20}
          height={20}
          className="size-full object-cover"
        />
      ) : (
        <span className="font-medium">{project.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )
}

export function ProjectSwitcher({ projects }: { projects: ProjectResponse[] }) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const currentProject = useProjectStore(state => state.currentProject)
  const storedProjects = useProjectStore(state => state.projects)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const projectList = storedProjects.length > 0 ? storedProjects : projects
  const currentProjectId = currentProject ? (getProjectId(currentProject) ?? currentProject._id) : null

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      if (!/^[1-9]$/.test(event.key)) return
      if (isTypingTarget(event.target)) return

      const index = Number.parseInt(event.key, 10) - 1
      if (index < 0 || index >= projectList.length) return

      const project = projectList[index]
      if (!project) return

      event.preventDefault()
      setCurrentProject(project)
      router.refresh()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [projectList, setCurrentProject, router])

  if (!currentProject) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Add project"
            className="h-7 gap-1.5 px-1.5 group-data-[collapsible=icon]:justify-center"
            onClick={() => setCreateOpen(true)}
          >
            <div className="sidebar-switcher-avatar">
              <PlusIcon className="size-3!" strokeWidth={SWITCHER_ICON_STROKE} />
            </div>
            <span className="min-w-0 flex-1 truncate font-medium tracking-tight group-data-[collapsible=icon]:hidden">
              Add project
            </span>
          </SidebarMenuButton>
          <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={currentProject.name}
              className="h-7 gap-1.5 px-1.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
            >
              <ProjectAvatar project={currentProject} />
              <span className="min-w-0 flex-1 truncate font-medium tracking-tight group-data-[collapsible=icon]:hidden">
                {currentProject.name}
              </span>
              <ChevronDownIcon
                className="ml-auto size-3! text-muted-foreground group-data-[collapsible=icon]:hidden"
                strokeWidth={2}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuLabel className="sidebar-switcher-meta px-2 py-1.5 text-xs font-medium">
              Projects
            </DropdownMenuLabel>
            {projectList.map((project, index) => {
              const projectId = getProjectId(project) ?? project._id
              const isSelected = projectId === currentProjectId
              const city = projectTimezoneLabel(project)

              return (
                <DropdownMenuItem
                  key={projectId}
                  onClick={() => {
                    setCurrentProject(project)
                    router.refresh()
                  }}
                  className="gap-2.5 px-2 py-2"
                >
                  <ProjectAvatar project={project} />
                  <div className="grid min-w-0 flex-1 leading-tight">
                    <span className="truncate text-sm">{project.name}</span>
                    {city ? <span className="sidebar-switcher-meta truncate">{city}</span> : null}
                  </div>
                  {isSelected ? (
                    <CheckIcon className="size-3.5 shrink-0 text-foreground" strokeWidth={SWITCHER_ICON_STROKE} />
                  ) : index < 9 ? (
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  ) : null}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2.5 px-2 py-2" onSelect={() => setEditOpen(true)}>
              <Settings2Icon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={SWITCHER_ICON_STROKE} />
              <span className="font-medium">Edit project</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5 px-2 py-2" onSelect={() => setCreateOpen(true)}>
              <PlusIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={SWITCHER_ICON_STROKE} />
              <span className="text-muted-foreground">Add project</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
        <EditProjectDialog open={editOpen} onOpenChange={setEditOpen} project={currentProject} />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
