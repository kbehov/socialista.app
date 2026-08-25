'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TimezoneSelector } from '@/components/ui/timezone-selector'
import { cn } from '@/lib/utils'
import { uploadToWorkspace } from '@/services/files.service'
import { createProject, deleteProject, updateProject } from '@/services/project.service'
import { getProjectId, useProjectStoreActions } from '@/store/project.store'
import { getWorkspaceId, useWorkspaceStore } from '@/store/workspace.store'
import { isValidIanaTimezone } from '@/utils/timezone'
import { getInitials } from '@/utils/user'
import type { ProjectResponse } from '@socialista/types'
import { CameraIcon, Loader2Icon, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react'
import { toast } from 'sonner'

const FALLBACK_TIMEZONE = 'Europe/Sofia'

function resolveDefaultTimezone(fallback?: string) {
  if (typeof Intl !== 'undefined') {
    const browser = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (browser && isValidIanaTimezone(browser)) return browser
  }
  if (fallback && isValidIanaTimezone(fallback)) return fallback
  return FALLBACK_TIMEZONE
}

type ProjectFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: ProjectResponse | null
}

export function CreateProjectDialog({ open, onOpenChange }: Omit<ProjectFormDialogProps, 'project'>) {
  return <ProjectFormDialog open={open} onOpenChange={onOpenChange} />
}

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
}: ProjectFormDialogProps & { project: ProjectResponse | null }) {
  return <ProjectFormDialog open={open} onOpenChange={onOpenChange} project={project} />
}

function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const isEdit = Boolean(project)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/50 px-5 py-4 pr-12 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {isEdit ? 'Edit project' : 'New project'}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            {isEdit
              ? 'Update the name, icon, and time zone for this project.'
              : 'Group accounts, posts, and studio work for one client.'}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ProjectForm
            key={getProjectId(project) ?? 'create'}
            project={project}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ProjectForm({ project, onClose }: { project?: ProjectResponse | null; onClose: () => void }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const { addProject, setCurrentProject, updateProject: patchStore, removeProject } = useProjectStoreActions()

  const isEdit = Boolean(project)
  const [name, setName] = useState(project?.name ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [timezone, setTimezone] = useState(() =>
    resolveDefaultTimezone(project?.timezone ?? currentWorkspace?.settings.timezone),
  )
  const [iconUrl, setIconUrl] = useState(project?.icon ?? '')
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [removeIcon, setRemoveIcon] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  const trimmedName = name.trim()
  const workspaceId = getWorkspaceId(currentWorkspace)
  const displayedIcon = iconPreview ?? (removeIcon ? '' : iconUrl)
  const canDelete = Boolean(project && !project.isDefault)

  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview)
    }
  }, [iconPreview])

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file')
      return
    }

    if (iconPreview) URL.revokeObjectURL(iconPreview)
    setIconPreview(URL.createObjectURL(file))
    setIconFile(file)
    setRemoveIcon(false)
  }

  const clearIcon = () => {
    if (iconPreview) URL.revokeObjectURL(iconPreview)
    setIconFile(null)
    setIconPreview(null)
    if (isEdit && iconUrl) {
      setRemoveIcon(true)
    }
  }

  const uploadIcon = async (targetWorkspaceId: string): Promise<string | undefined> => {
    if (!iconFile) return undefined
    if ((currentWorkspace?.limits.storage ?? 0) <= 0) {
      toast.error('This workspace has no storage available')
      return undefined
    }

    const formData = new FormData()
    formData.append('file', iconFile)
    const upload = await uploadToWorkspace(targetWorkspaceId, formData)
    const url = upload.data?.url
    if (!upload.success || !url) {
      toast.error(upload.message ?? 'Couldn’t upload icon')
      return undefined
    }
    return url
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmedName || !workspaceId || isPending) return

    startTransition(async () => {
      try {
        const nextIcon = await uploadIcon(workspaceId)

        if (isEdit && project) {
          const projectId = getProjectId(project)
          if (!projectId) return

          const response = await updateProject(projectId, {
            name: trimmedName,
            description: description.trim() || null,
            timezone,
            icon: nextIcon ?? (removeIcon ? null : undefined),
          })
          const updated = response.data?.project
          if (!updated) {
            toast.error(response.message || 'Failed to update project')
            return
          }

          patchStore(updated)
          toast.success('Project updated')
          onClose()
          router.refresh()
          return
        }

        const response = await createProject({
          workspaceId,
          name: trimmedName,
          timezone,
          description: description.trim() || undefined,
          icon: nextIcon,
        })
        const created = response.data?.project
        if (!created) {
          toast.error(response.message || 'Failed to create project')
          return
        }

        addProject(created)
        setCurrentProject(created)
        toast.success('Project created')
        onClose()
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Couldn’t save project')
      }
    })
  }

  const handleDelete = () => {
    if (!project || !canDelete || isDeleting) return
    const projectId = getProjectId(project)
    if (!projectId) return

    setIsDeleting(true)
    startTransition(async () => {
      try {
        const response = await deleteProject(projectId)
        setIsDeleting(false)

        if (!response.success) {
          toast.error(response.message ?? 'Couldn’t delete project')
          return
        }

        removeProject(projectId)
        toast.success('Project deleted')
        setDeleteOpen(false)
        onClose()
        router.refresh()
      } catch (error) {
        setIsDeleting(false)
        toast.error(error instanceof Error ? error.message : 'Couldn’t delete project')
      }
    })
  }

  return (
    <>
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className={cn(
                'relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/40',
                'transition-transform duration-150 ease-out active:scale-[0.97]',
                'hover:border-border focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                'motion-reduce:active:scale-100',
              )}
              style={!displayedIcon && project?.color ? { backgroundColor: project.color } : undefined}
              aria-label="Choose project icon"
            >
              {displayedIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayedIcon} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-lg font-semibold tracking-tight text-muted-foreground">
                  {getInitials(trimmedName || 'Project')}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity hover:opacity-100">
                <CameraIcon className="size-4 text-white" strokeWidth={1.75} />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={event => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) handleLogoFile(file)
              }}
            />
            <div className="min-w-0">
              <p className="text-[13px] font-medium tracking-tight">Icon</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Optional. A square image works best.</p>
              {displayedIcon || iconFile ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 px-2 text-xs text-muted-foreground"
                  onClick={clearIcon}
                  disabled={isPending}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-name" className="text-xs text-muted-foreground">
              Name
            </Label>
            <Input
              id="project-name"
              value={name}
              onChange={event => setName(event.target.value)}
              maxLength={80}
              placeholder="Client or campaign name"
              autoComplete="off"
              autoFocus
              disabled={isPending}
              className="h-9 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-description" className="text-xs text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={event => setDescription(event.target.value)}
              maxLength={240}
              placeholder="What this project is for"
              disabled={isPending}
              className="min-h-20 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Time zone</Label>
            <TimezoneSelector
              value={timezone}
              onChange={setTimezone}
              disabled={isPending}
              popoverWidth="trigger"
              aria-label="Project timezone"
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/50 bg-muted/10 px-5 py-3">
          {canDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mr-auto rounded-lg text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={isPending || isDeleting}
            >
              <Trash2Icon className="size-3.5" strokeWidth={1.75} />
              Delete
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="rounded-lg shadow-xs" disabled={!trimmedName || !workspaceId || isPending}>
            {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
            {isEdit ? 'Save' : 'Create project'}
          </Button>
        </DialogFooter>
      </form>

      {project && canDelete ? (
        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete this project?"
          description="Posts, accounts, and studio work in this project stay in the workspace but will need another project."
          confirmLabel="Delete project"
          isDeleting={isDeleting}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  )
}
