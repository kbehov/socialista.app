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
import { getProjectId, useProjectStore } from '@/store/project.store'
import { formatTimezoneLocation } from '@/utils/timezone'
import { ProjectResponse } from '@socialista/types'
import { ChevronsUpDownIcon, PlusIcon, Settings2Icon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function projectTimezoneLabel(project: ProjectResponse): string | null {
  return project.timezone ? formatTimezoneLocation(project.timezone) : null
}

function ProjectAvatar({ project }: { project: ProjectResponse }) {
  return (
    <div
      className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-sidebar-primary text-sidebar-primary-foreground"
      style={!project.icon && project.color ? { backgroundColor: project.color } : undefined}
    >
      {project.icon ? (
        <Image src={project.icon} alt={project.name} width={24} height={24} className="size-full object-cover" />
      ) : (
        <span className="text-xs font-medium">{project.name.charAt(0).toUpperCase()}</span>
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
            size="lg"
            tooltip="Add project"
            className="group-data-[collapsible=icon]:justify-center"
            onClick={() => setCreateOpen(true)}
          >
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sidebar-border/60 bg-sidebar-primary text-sidebar-primary-foreground">
              <PlusIcon className="size-4" strokeWidth={1.75} />
            </div>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium tracking-tight">Add project</span>
              <span className="truncate text-[11px] text-muted-foreground">Create your first project</span>
            </div>
          </SidebarMenuButton>
          <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const timezoneLabel = projectTimezoneLabel(currentProject)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={currentProject.name}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
            >
              <div
                className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sidebar-border/60 bg-sidebar-primary text-sidebar-primary-foreground"
                style={!currentProject.icon && currentProject.color ? { backgroundColor: currentProject.color } : undefined}
              >
                {currentProject.icon ? (
                  <Image
                    src={currentProject.icon}
                    alt={currentProject.name}
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">{currentProject.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium tracking-tight">{currentProject.name}</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {timezoneLabel ?? (currentProject.isDefault ? 'Default project' : 'Project')}
                </span>
              </div>
              <ChevronsUpDownIcon
                className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden"
                strokeWidth={1.75}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Projects</DropdownMenuLabel>
            {projectList.map((project, index) => {
              const city = projectTimezoneLabel(project)

              return (
                <DropdownMenuItem
                  key={getProjectId(project) ?? project._id}
                  onClick={() => {
                    setCurrentProject(project)
                    router.refresh()
                  }}
                  className="gap-2 p-2"
                >
                  <ProjectAvatar project={project} />
                  <div className="grid min-w-0 flex-1 leading-tight">
                    <span className="truncate">{project.name}</span>
                    {city ? <span className="truncate text-[11px] text-muted-foreground">{city}</span> : null}
                  </div>
                  {index < 9 ? <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> : null}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onSelect={() => setEditOpen(true)}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Settings2Icon className="size-3.5" strokeWidth={1.75} />
              </div>
              <div className="font-medium">Edit project</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-2" onSelect={() => setCreateOpen(true)}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add project</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
        <EditProjectDialog open={editOpen} onOpenChange={setEditOpen} project={currentProject} />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
