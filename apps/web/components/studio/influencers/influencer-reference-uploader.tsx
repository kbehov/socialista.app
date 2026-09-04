'use client'

import {
  AttachImagesDialog,
  IMAGE_MAX_BYTES,
  isAllowedMime,
  toAttachedFromUpload,
  type AttachedMedia,
} from '@/components/files/attach-images-dialog'
import { dashboardSurface } from '@/components/dashboard'
import { FilePreview } from '@/components/media/file-preview'
import { formatBytes, useFileUpload, type FileWithPreview } from '@/hooks/use-file-upload'
import { cn } from '@/lib/utils'
import { uploadToWorkspace } from '@/services/files.service'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FolderIcon, ImagePlusIcon, Loader2Icon, XIcon } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const TAP_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.28 }

const THUMB_CLASS =
  'relative h-[3.25rem] w-[2.45rem] overflow-hidden rounded-md border border-border/55 dark:border-border/70'

type PendingUpload = {
  id: string
  previewUrl: string
  name: string
}

type InfluencerReferenceUploaderProps = {
  workspaceId: string
  images: AttachedMedia[]
  onImagesChange: (images: AttachedMedia[] | ((prev: AttachedMedia[]) => AttachedMedia[])) => void
  maxImages: number
  disabled?: boolean
}

function LibraryButton({
  disabled,
  onClick,
  className,
}: {
  disabled?: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        dashboardSurface.toolbarControl,
        'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 leading-none text-muted-foreground',
        className,
      )}
    >
      <FolderIcon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="leading-none">Library</span>
    </button>
  )
}

function RemoveButton({
  disabled,
  label,
  onRemove,
}: {
  disabled?: boolean
  label: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={event => {
        event.stopPropagation()
        onRemove()
      }}
      className={cn(
        'absolute top-0.5 right-0.5 z-10 flex size-4 items-center justify-center rounded-[4px]',
        'bg-background/90 text-foreground backdrop-blur-sm',
        'border border-border/55',
        'opacity-0 transition-opacity duration-150',
        'group-hover:opacity-100 group-focus-within:opacity-100',
        'max-sm:opacity-100',
        'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        'active:scale-95 disabled:pointer-events-none',
      )}
    >
      <XIcon className="size-2.5" strokeWidth={2.5} />
    </button>
  )
}

export function InfluencerReferenceUploader({
  workspaceId,
  images,
  onImagesChange,
  maxImages,
  disabled,
}: InfluencerReferenceUploaderProps) {
  const reduceMotion = useReducedMotion()
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [pending, setPending] = useState<PendingUpload[]>([])
  const pendingRef = useRef<PendingUpload[]>([])
  const uploadFnRef = useRef<(files: File[]) => Promise<void>>(async () => {})

  useEffect(() => {
    pendingRef.current = pending
  }, [pending])

  const occupied = images.length + pending.length
  const remaining = Math.max(0, maxImages - occupied)
  const atMax = remaining === 0
  const isUploading = pending.length > 0

  const handleFilesAdded = useCallback((added: FileWithPreview[]) => {
    const files = added
      .map(item => item.file)
      .filter((file): file is File => file instanceof File)
    if (files.length > 0) {
      void uploadFnRef.current(files)
    }
  }, [])

  const [uploadState, uploadActions] = useFileUpload({
    multiple: maxImages > 1,
    maxFiles: Math.max(1, remaining || 1),
    maxSize: IMAGE_MAX_BYTES,
    accept: 'image/*',
    onFilesAdded: handleFilesAdded,
    onError: errors => {
      for (const message of errors) {
        toast.error(message)
      }
    },
  })

  const uploadFiles = useCallback(
    async (incoming: File[]) => {
      if (!workspaceId || incoming.length === 0 || disabled) return

      const room = Math.max(0, maxImages - images.length - pending.length)
      if (room <= 0) {
        toast.error(`You can add up to ${maxImages} reference photos`)
        return
      }

      const batch = incoming.slice(0, room)
      const nextPending: PendingUpload[] = batch.map(file => ({
        id: `pending:${file.name}:${file.size}:${file.lastModified}`,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      }))

      setPending(current => [...current, ...nextPending])

      try {
        const uploaded: AttachedMedia[] = []

        for (const file of batch) {
          if (!isAllowedMime(file.type, 'image')) {
            toast.error(`“${file.name}” is not an image`)
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
          if (attached) uploaded.push(attached)
        }

        if (uploaded.length > 0) {
          onImagesChange(current => [...current, ...uploaded].slice(0, maxImages))
          toast.success(
            uploaded.length === 1
              ? 'Reference added'
              : `${uploaded.length} references added`,
          )
        }

        if (incoming.length > batch.length) {
          toast.message(`Only ${batch.length} photo${batch.length === 1 ? '' : 's'} added — limit reached.`)
        }
      } finally {
        setPending(current => {
          for (const item of nextPending) {
            URL.revokeObjectURL(item.previewUrl)
          }
          return current.filter(item => !nextPending.some(pendingItem => pendingItem.id === item.id))
        })
        uploadActions.clearFiles()
      }
    },
    [workspaceId, disabled, maxImages, images, pending.length, onImagesChange, uploadActions],
  )

  useEffect(() => {
    uploadFnRef.current = uploadFiles
  }, [uploadFiles])

  useEffect(() => {
    return () => {
      for (const item of pendingRef.current) {
        URL.revokeObjectURL(item.previewUrl)
      }
    }
  }, [])

  const removeImage = useCallback(
    (id: string) => {
      onImagesChange(current => current.filter(image => image.id !== id))
    },
    [onImagesChange],
  )

  const openPicker = useCallback(() => {
    if (disabled || atMax || isUploading) return
    uploadActions.openFileDialog()
  }, [disabled, atMax, isUploading, uploadActions])

  const addDisabled = disabled || atMax || isUploading
  const empty = images.length === 0 && pending.length === 0
  const hint = `PNG, JPG, or WebP · up to ${formatBytes(IMAGE_MAX_BYTES, 0)}`

  const addTooltip = (
    <span className="block max-w-[16rem] text-left leading-snug">
      Upload or drag in a photo for scene, lighting, and vibe. The person is generated from the form.
      <span className="mt-1 block text-background/70">{hint}</span>
    </span>
  )

  return (
    <div
      onDragEnter={uploadActions.handleDragEnter}
      onDragLeave={uploadActions.handleDragLeave}
      onDragOver={uploadActions.handleDragOver}
      onDrop={event => {
        if (addDisabled) {
          event.preventDefault()
          return
        }
        uploadActions.handleDrop(event)
      }}
      className={cn(
        'min-w-0 rounded-md transition-colors duration-150',
        uploadState.isDragging && 'bg-muted/40',
      )}
    >
      <input
        {...uploadActions.getInputProps({
          accept: 'image/*',
          multiple: remaining > 1,
          disabled: addDisabled,
        })}
        className="sr-only"
      />

      {empty ? (
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={addDisabled}
                onClick={openPicker}
                className={cn(
                  'flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-md px-2.5',
                  'border border-dashed border-border/55 text-[12px] font-medium tracking-[-0.01em]',
                  'text-muted-foreground transition-colors duration-150',
                  'hover:border-border hover:bg-muted/25 hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                  'active:scale-[0.99] motion-reduce:active:scale-100',
                  'disabled:pointer-events-none disabled:opacity-50',
                  'dark:border-border/70',
                  uploadState.isDragging && 'border-foreground/30 bg-muted/30 text-foreground',
                )}
              >
                <ImagePlusIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
                Add
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {addTooltip}
            </TooltipContent>
          </Tooltip>
          <LibraryButton disabled={addDisabled} onClick={() => setLibraryOpen(true)} />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          <AnimatePresence initial={false}>
            {images.map(image => (
              <motion.div
                key={image.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                transition={reduceMotion ? { duration: 0 } : TAP_SPRING}
                className="group"
              >
                <div className={cn(THUMB_CLASS, 'bg-muted/30')}>
                  <FilePreview
                    src={image.url}
                    alt={image.name ?? 'Reference'}
                    kind="image"
                    className="size-full"
                  />
                  <RemoveButton
                    disabled={disabled}
                    label={`Remove ${image.name ?? 'reference'}`}
                    onRemove={() => removeImage(image.id)}
                  />
                </div>
              </motion.div>
            ))}

            {pending.map(item => (
              <motion.div
                key={item.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reduceMotion ? { duration: 0 } : TAP_SPRING}
              >
                <div className={cn(THUMB_CLASS, 'bg-muted/30')}>
                  <FilePreview src={item.previewUrl} alt={item.name} kind="image" className="size-full" />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/45 backdrop-blur-[2px]">
                    <div className="animate-spin">
                      <Loader2Icon className="size-3 text-foreground/70" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {atMax ? null : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={addDisabled}
                  onClick={openPicker}
                  aria-label="Add reference photo"
                  className={cn(
                    THUMB_CLASS,
                    'flex items-center justify-center border-dashed bg-transparent text-muted-foreground',
                    'transition-colors duration-150 hover:border-border hover:bg-muted/20 hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                    'active:scale-[0.97] motion-reduce:active:scale-100',
                    'disabled:pointer-events-none disabled:opacity-50',
                    uploadState.isDragging && 'border-foreground/30 bg-muted/30',
                  )}
                >
                  <ImagePlusIcon className="size-3.5" strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>
                {addTooltip}
              </TooltipContent>
            </Tooltip>
          )}

          <LibraryButton
            disabled={addDisabled}
            onClick={() => setLibraryOpen(true)}
            className="ml-auto"
          />
        </div>
      )}

      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground/70">
        Optional. Photos set scene, lighting, and vibe — the person is generated from the form.
      </p>

      <AttachImagesDialog
        open={libraryOpen}
        accept="image"
        onOpenChange={setLibraryOpen}
        maxSelect={maxImages}
        initialSelected={images}
        defaultTab="library"
        workspaceId={workspaceId}
        title="Reference photos"
        description="A face or full-body photo locks identity. Extra shots help with outfit, lighting, and grade."
        onSelect={files => onImagesChange(files)}
      />
    </div>
  )
}
