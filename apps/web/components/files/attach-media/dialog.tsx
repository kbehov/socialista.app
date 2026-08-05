'use client'

import { AttachMediaLibraryBrowser } from '@/components/files/attach-media/library-browser'
import { AttachMediaSelectionStrip } from '@/components/files/attach-media/selection-strip'
import { AttachMediaUploadPanel } from '@/components/files/attach-media/upload-panel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFileUpload, type FileWithPreview } from '@/hooks/use-file-upload'
import { cn } from '@/lib/utils'
import { uploadToWorkspace } from '@/services/files.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import { ImagePlusIcon, UploadCloudIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  buildAttachMediaCopy,
  defaultAttachMediaDescription,
  defaultAttachMediaTitle,
} from './copy'
import { DEFAULT_MAX_SELECT } from './constants'
import type { AttachImagesDialogProps, AttachedMedia } from './types'
import {
  buildLimitMessage,
  isAllowedMime,
  resolveAcceptAttr,
  resolveMaxSize,
  toAttachedFromUpload,
} from './utils'

const EMPTY_SELECTION: AttachedMedia[] = []

export function AttachImagesDialog({
  open,
  onOpenChange,
  onSelect,
  accept = 'image',
  maxSelect,
  maxImagesSelect,
  maxSize,
  workspaceId: workspaceIdProp,
  title,
  description,
  initialSelected = EMPTY_SELECTION,
  defaultTab = 'upload',
}: AttachImagesDialogProps) {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const workspaceId = workspaceIdProp ?? currentWorkspace?._id ?? currentWorkspace?.id

  const resolvedMaxSelect = maxSelect ?? maxImagesSelect ?? DEFAULT_MAX_SELECT
  const resolvedMaxSize = resolveMaxSize(accept, maxSize)
  const acceptAttr = resolveAcceptAttr(accept)
  const copy = useMemo(() => buildAttachMediaCopy(accept), [accept])
  const resolvedTitle = title ?? defaultAttachMediaTitle(accept)
  const resolvedDescription = description ?? defaultAttachMediaDescription(accept)

  const [tab, setTab] = useState<'upload' | 'library'>('upload')
  const [draft, setDraft] = useState<AttachedMedia[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const uploadFnRef = useRef<(files: File[]) => Promise<void>>(async () => {})
  const wasOpenRef = useRef(false)

  const maxReached = draft.length >= resolvedMaxSelect
  const remainingSlots = Math.max(0, resolvedMaxSelect - draft.length)
  const limitMessage = buildLimitMessage(resolvedMaxSelect, copy.noun, copy.nounPlural)

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen)
    },
    [onOpenChange],
  )

  // Seed draft/tab only when the dialog opens. Depending on `initialSelected` identity
  // would reset selection on every parent re-render (default `[]` is a new array each time).
  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false
      return
    }
    if (wasOpenRef.current) return
    wasOpenRef.current = true

    const t = window.setTimeout(() => {
      setDraft(initialSelected)
      setTab(defaultTab)
      setIsUploading(false)
    }, 100)
    return () => window.clearTimeout(t)
  }, [open, initialSelected, defaultTab])

  const addToDraft = useCallback(
    (files: AttachedMedia[]) => {
      setDraft(current => {
        const existing = new Set(current.map(item => item.id))
        const unique = files.filter(file => !existing.has(file.id))
        if (unique.length === 0) return current

        const room = resolvedMaxSelect - current.length
        if (room <= 0) {
          toast.error(limitMessage)
          return current
        }

        const next = [...current, ...unique.slice(0, room)]
        if (unique.length > room) {
          toast.message(
            `Only ${room} more ${room === 1 ? copy.noun : copy.nounPlural} can be attached.`,
          )
        }
        return next
      })
    },
    [resolvedMaxSelect, limitMessage, copy.noun, copy.nounPlural],
  )

  const removeFromDraft = useCallback((id: string) => {
    setDraft(current => current.filter(item => item.id !== id))
  }, [])

  const toggleLibraryFile = useCallback(
    (file: AttachedMedia) => {
      setDraft(current => {
        if (current.some(item => item.id === file.id)) {
          return current.filter(item => item.id !== file.id)
        }
        if (current.length >= resolvedMaxSelect) {
          toast.error(limitMessage)
          return current
        }
        return [...current, file]
      })
    },
    [resolvedMaxSelect, limitMessage],
  )

  const handleFilesAdded = useCallback((added: FileWithPreview[]) => {
    const files = added.map(item => item.file).filter((file): file is File => file instanceof File)
    if (files.length > 0) {
      void uploadFnRef.current(files)
    }
  }, [])

  const [uploadState, uploadActions] = useFileUpload({
    multiple: resolvedMaxSelect > 1,
    maxFiles: Math.max(1, remainingSlots || 1),
    maxSize: resolvedMaxSize,
    accept: acceptAttr,
    onFilesAdded: handleFilesAdded,
    onError: errors => {
      for (const message of errors) {
        toast.error(message)
      }
    },
  })

  const uploadFiles = useCallback(
    async (incoming: File[]) => {
      if (!workspaceId || incoming.length === 0) return

      if (remainingSlots <= 0) {
        toast.error(limitMessage)
        return
      }

      const batch = incoming.slice(0, remainingSlots)
      setIsUploading(true)

      try {
        const uploaded: AttachedMedia[] = []

        for (const file of batch) {
          if (!isAllowedMime(file.type, accept)) {
            toast.error(copy.notAllowed(file.name))
            continue
          }

          const formData = new FormData()
          formData.append('file', file)
          const response = await uploadToWorkspace(workspaceId, formData)

          if (!response.success || !response.data) {
            toast.error(response.message ?? `Failed to upload “${file.name}”`)
            continue
          }

          const attached = toAttachedFromUpload(response.data, file.name, file.type)
          if (attached) {
            uploaded.push(attached)
          }
        }

        if (uploaded.length > 0) {
          addToDraft(uploaded)
          toast.success(uploaded.length === 1 ? copy.uploadedOne : copy.uploadedMany(uploaded.length))
        }

        if (incoming.length > batch.length) {
          toast.message(
            `Only ${batch.length} ${batch.length === 1 ? copy.noun : copy.nounPlural} added — selection limit reached.`,
          )
        }
      } finally {
        setIsUploading(false)
        uploadActions.clearFiles()
      }
    },
    [workspaceId, remainingSlots, limitMessage, accept, copy, addToDraft, uploadActions],
  )

  useEffect(() => {
    uploadFnRef.current = uploadFiles
  }, [uploadFiles])

  const handleConfirm = () => {
    onSelect(draft)
    onOpenChange(false)
  }

  const confirmLabel =
    draft.length === 0 ? 'Attach' : draft.length === 1 ? copy.attachOne : copy.attachMany(draft.length)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[min(88vh,760px)] flex-col gap-0 overflow-hidden p-0',
          'sm:max-w-2xl',
          'rounded-2xl border-border/60 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.28)]',
        )}
        showCloseButton
      >
        <div className="shrink-0 space-y-1 border-b border-border/55 px-5 py-5 pr-12 sm:px-6">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-base font-semibold tracking-[-0.02em]">{resolvedTitle}</DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed tracking-[-0.01em]">
              {resolvedDescription}
              {resolvedMaxSelect < Number.POSITIVE_INFINITY
                ? ` Up to ${resolvedMaxSelect} ${
                    resolvedMaxSelect === 1 ? copy.noun : copy.nounPlural
                  }.`
                : null}
            </DialogDescription>
          </DialogHeader>
        </div>

        <AttachMediaSelectionStrip
          files={draft}
          maxSelect={resolvedMaxSelect}
          nounPlural={copy.nounPlural}
          onRemove={removeFromDraft}
        />

        <Tabs
          value={tab}
          onValueChange={value => setTab(value as 'upload' | 'library')}
          className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden"
        >
          <div className="shrink-0 px-5 pt-3 sm:px-6">
            <TabsList className="grid h-9 w-full grid-cols-2 rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="upload"
                className="h-7 gap-1.5 rounded-lg text-xs tracking-[-0.01em] data-active:shadow-sm"
              >
                <UploadCloudIcon className="size-3.5" strokeWidth={1.75} />
                Upload
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className="h-7 gap-1.5 rounded-lg text-xs tracking-[-0.01em] data-active:shadow-sm"
              >
                <ImagePlusIcon className="size-3.5" strokeWidth={1.75} />
                Library
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="upload"
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col px-5 py-4 sm:px-6">
              <AttachMediaUploadPanel
                accept={accept}
                acceptAttr={acceptAttr}
                copy={copy}
                maxSize={resolvedMaxSize}
                multiple={resolvedMaxSelect > 1}
                maxReached={maxReached}
                isUploading={isUploading}
                uploadState={uploadState}
                uploadActions={uploadActions}
                workspaceId={workspaceId}
              />
            </div>
          </TabsContent>

          <TabsContent
            value="library"
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            {!workspaceId ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Select a workspace to browse files.
              </p>
            ) : (
              <AttachMediaLibraryBrowser
                workspaceId={workspaceId}
                open={open && tab === 'library'}
                accept={accept}
                copy={copy}
                draft={draft}
                maxSelect={resolvedMaxSelect}
                onToggle={toggleLibraryFile}
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="relative z-10 shrink-0 gap-2 border-t border-border/55 bg-card px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl text-[13px] tracking-[-0.01em]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 rounded-xl px-4 text-[13px] font-semibold tracking-[-0.015em]"
            disabled={draft.length === 0 || isUploading}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
