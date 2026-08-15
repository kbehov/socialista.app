'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { DashboardSection } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LanguageSelector } from '@/components/ui/language-selector'
import { Textarea } from '@/components/ui/textarea'
import { TimezoneSelector } from '@/components/ui/timezone-selector'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { uploadToWorkspace } from '@/services/files.service'
import { deleteWorkspace, updateWorkspace } from '@/services/workspace.service'
import { getWorkspaceId, useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import { getInitials } from '@/utils/user'
import type { WorkspaceResponse } from '@socialista/types'
import { CameraIcon, Loader2Icon, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

type GeneralSettingsProps = {
  workspace: WorkspaceResponse
  isOwner: boolean
}

export function GeneralSettings({ workspace, isOwner }: GeneralSettingsProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const workspaces = useWorkspaceStore(s => s.workspaces)
  const { setCurrentWorkspace, updateWorkspace: patchStore, reset } = useWorkspaceStoreActions()

  const [name, setName] = useState(workspace.name)
  const [description, setDescription] = useState(workspace.description ?? '')
  const [timezone, setTimezone] = useState(workspace.settings.timezone)
  const [language, setLanguage] = useState(workspace.settings.language ?? 'en')
  const [logo, setLogo] = useState(workspace.logo ?? workspace.avatar ?? '')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const trimmedName = name.trim()
  const isDirty =
    trimmedName !== workspace.name ||
    description !== (workspace.description ?? '') ||
    timezone !== workspace.settings.timezone ||
    language !== (workspace.settings.language ?? 'en')

  const handleSave = () => {
    if (!trimmedName || isPending) return

    startTransition(async () => {
      try {
        const response = await updateWorkspace(workspace.id, {
          name: trimmedName,
          description: description.trim() || undefined,
          settings: { timezone, language },
        })

        if (!response.success || !response.data?.workspace) {
          toast.error(response.message ?? 'Couldn’t save workspace')
          return
        }

        patchStore(response.data.workspace)
        toast.success('Workspace updated')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Couldn’t save workspace')
      }
    })
  }

  const persistLogo = async (nextLogo: string | undefined) => {
    try {
      const response = await updateWorkspace(workspace.id, { logo: nextLogo ?? '' })
      if (!response.success || !response.data?.workspace) {
        toast.error(response.message ?? 'Couldn’t update icon')
        return false
      }

      setLogo(nextLogo ?? '')
      patchStore(response.data.workspace)
      router.refresh()
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Couldn’t update icon')
      return false
    }
  }

  const handleLogoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const upload = await uploadToWorkspace(workspace.id, formData)
      const url = upload.data?.url

      if (!upload.success || !url) {
        toast.error(upload.message ?? 'Couldn’t upload image')
        return
      }

      const saved = await persistLogo(url)
      if (saved) toast.success('Icon updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Couldn’t upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = () => {
    if (confirmName.trim() !== workspace.name) {
      toast.error('Type the workspace name to confirm')
      return
    }
    if (isDeleting) return

    setIsDeleting(true)
    startTransition(async () => {
      try {
        const response = await deleteWorkspace(workspace.id)
        setIsDeleting(false)

        if (!response.success) {
          toast.error(response.message ?? 'Couldn’t delete workspace')
          return
        }

        const remaining = workspaces.filter(item => getWorkspaceId(item) !== workspace.id)
        const next = remaining[0] ?? null
        if (next) {
          setCurrentWorkspace(next)
        } else {
          reset()
        }

        toast.success('Workspace deleted')
        router.push(DASHBOARD_ROUTES.ROOT)
        router.refresh()
      } catch (error) {
        setIsDeleting(false)
        toast.error(error instanceof Error ? error.message : 'Couldn’t delete workspace')
      }
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardSection title="Workspace" description="How this workspace appears to your team.">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isPending}
              className={cn(
                'relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/40',
                'transition-transform duration-150 ease-out active:scale-[0.97]',
                'hover:border-border focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                'motion-reduce:active:scale-100',
              )}
              aria-label="Change workspace icon"
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-lg font-semibold tracking-tight text-muted-foreground">
                  {getInitials(trimmedName || workspace.name)}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity hover:opacity-100">
                {isUploading ? (
                  <Loader2Icon className="size-4 animate-spin text-white" />
                ) : (
                  <CameraIcon className="size-4 text-white" strokeWidth={1.75} />
                )}
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
                if (file) void handleLogoFile(file)
              }}
            />
            <div className="min-w-0">
              <p className="text-[13px] font-medium tracking-tight">Icon</p>
              <p className="mt-0.5 text-xs text-muted-foreground">A square image works best.</p>
              {logo ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 px-2 text-xs text-muted-foreground"
                  onClick={() => {
                    void persistLogo(undefined).then(saved => {
                      if (saved) toast.success('Icon removed')
                    })
                  }}
                  disabled={isUploading || isPending}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workspace-name" className="text-xs text-muted-foreground">
              Name
            </Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={event => setName(event.target.value)}
              maxLength={80}
              className="h-9 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workspace-description" className="text-xs text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="workspace-description"
              value={description}
              onChange={event => setDescription(event.target.value)}
              maxLength={240}
              placeholder="What this workspace is for"
              className="min-h-20 rounded-lg"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full px-4"
              onClick={handleSave}
              disabled={!isDirty || !trimmedName || isPending}
            >
              {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </div>
      </DashboardSection>

      <DashboardSection title="Defaults" description="Used when scheduling posts and generating copy.">
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Time zone</Label>
            <TimezoneSelector value={timezone} onChange={setTimezone} disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Language</Label>
            <LanguageSelector value={language} onChange={setLanguage} disabled={isPending} className="w-full" />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full px-4"
              onClick={handleSave}
              disabled={!isDirty || !trimmedName || isPending}
            >
              {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </div>
      </DashboardSection>

      {isOwner ? (
        <DashboardSection title="Delete workspace" description="This cannot be undone. Posts, files, and members are removed.">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Only the owner can delete this workspace.</p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 rounded-full px-3"
              onClick={() => {
                setConfirmName('')
                setDeleteOpen(true)
              }}
            >
              <Trash2Icon className="size-3.5" strokeWidth={1.75} />
              Delete
            </Button>
          </div>
        </DashboardSection>
      ) : null}

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={open => {
          setDeleteOpen(open)
          if (!open) setConfirmName('')
        }}
        title="Delete this workspace?"
        description={
          <span className="flex flex-col gap-3">
            <span>
              Type <span className="font-medium text-foreground">{workspace.name}</span> to confirm.
            </span>
            <Input
              value={confirmName}
              onChange={event => setConfirmName(event.target.value)}
              placeholder={workspace.name}
              autoComplete="off"
              className="h-9 rounded-lg"
            />
          </span>
        }
        confirmLabel="Delete workspace"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
