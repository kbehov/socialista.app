'use client'

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
import { TimezoneSelector } from '@/components/ui/timezone-selector'
import { cn } from '@/lib/utils'
import { uploadToWorkspace } from '@/services/files.service'
import { createWorkspace, updateWorkspace } from '@/services/workspace.service'
import { useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import { DEFAULT_TIMEZONE, isValidIanaTimezone } from '@/utils/timezone'
import { getInitials } from '@/utils/user'
import { CameraIcon, Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react'
import { toast } from 'sonner'

function resolveDefaultTimezone(fallback?: string) {
  if (typeof Intl !== 'undefined') {
    const browser = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (browser && isValidIanaTimezone(browser)) return browser
  }
  if (fallback && isValidIanaTimezone(fallback)) return fallback
  return DEFAULT_TIMEZONE
}

type CreateWorkspaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateWorkspaceForm({
  defaultTimezone,
  defaultLanguage,
  onClose,
}: {
  defaultTimezone?: string
  defaultLanguage?: string
  onClose: () => void
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addWorkspace, setCurrentWorkspace } = useWorkspaceStoreActions()

  const [name, setName] = useState('')
  const [timezone, setTimezone] = useState(() => resolveDefaultTimezone(defaultTimezone))
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const trimmedName = name.trim()

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview)
    }
  }, [logoPreview])

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file')
      return
    }

    setLogoPreview(URL.createObjectURL(file))
    setLogoFile(file)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmedName || isPending) return

    startTransition(async () => {
      try {
        const response = await createWorkspace({
          name: trimmedName,
          settings: {
            timezone,
            language: defaultLanguage ?? 'en',
          },
        })

        if (!response.success || !response.data?.workspace) {
          toast.error(response.message ?? 'Couldn’t create workspace')
          return
        }

        let workspace = response.data.workspace

        if (logoFile && workspace.limits.storage > 0) {
          const formData = new FormData()
          formData.append('file', logoFile)
          const upload = await uploadToWorkspace(workspace.id, formData)
          const url = upload.data?.url

          if (upload.success && url) {
            const updated = await updateWorkspace(workspace.id, { logo: url })
            if (updated.success && updated.data?.workspace) {
              workspace = updated.data.workspace
            }
          } else {
            toast.error(upload.message ?? 'Couldn’t upload icon')
          }
        }

        addWorkspace(workspace)
        setCurrentWorkspace(workspace)
        toast.success('Workspace created')
        onClose()
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Couldn’t create workspace')
      }
    })
  }

  return (
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
            aria-label="Choose workspace icon"
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-lg font-semibold tracking-tight text-muted-foreground">
                {getInitials(trimmedName || 'Workspace')}
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
            {logoFile ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 h-7 px-2 text-xs text-muted-foreground"
                onClick={() => {
                  setLogoFile(null)
                  setLogoPreview(null)
                }}
                disabled={isPending}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="create-workspace-name" className="text-xs text-muted-foreground">
            Name
          </Label>
          <Input
            id="create-workspace-name"
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={80}
            placeholder="Acme Studio"
            autoComplete="off"
            autoFocus
            disabled={isPending}
            className="h-9 rounded-lg"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Time zone</Label>
          <TimezoneSelector
            value={timezone}
            onChange={setTimezone}
            disabled={isPending}
            popoverWidth="trigger"
            aria-label="Workspace timezone"
          />
        </div>
      </div>

      <DialogFooter className="shrink-0 border-t border-border/50 bg-muted/10 px-5 py-3">
        <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="rounded-lg shadow-xs" disabled={!trimmedName || isPending}>
          {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
          Create workspace
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/50 px-5 py-4 pr-12 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">New workspace</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            Name this workspace and set its icon and time zone.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <CreateWorkspaceForm
            defaultTimezone={currentWorkspace?.settings.timezone}
            defaultLanguage={currentWorkspace?.settings.language}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
