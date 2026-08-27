'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AttachImagesDialog,
  type AttachedMedia,
} from '@/components/files/attach-images-dialog'
import { VIDEO_BROWSE_FILES_EVENT, VIDEO_FOCUS_URL_IMPORT_EVENT } from '@/lib/video/editor-events'
import { useVideoEditorStore } from '@/lib/video/store'
import {
  importMediaAsset,
  importMediaFromLibrary,
  importMediaFromUrl,
  MediaImportError,
} from '@/lib/video/media-import'
import { isMediaAssetAvailable } from '@/lib/video/types'
import { HARD_IMPORT_LIMIT, MAX_IMPORT_BYTES_WARN } from '@/lib/video/defaults'
import { ASSET_DRAG_MIME } from '@/lib/video/timeline-placement'
import { placeAssetAtPlayhead, registerAndPlaceAtPlayhead } from '@/lib/video/import-placement'
import { VideoUrlImportForm } from '@/components/video/video-url-import-panel'
import { PixabayVideoSearchDialog } from '@/components/video/pixabay-video-search-dialog'
import type { PixabayVideoResult } from '@/services/pixabay.service'
import {
  FilmIcon,
  FolderOpenIcon,
  ImageIcon,
  LinkIcon,
  Loader2Icon,
  MusicIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ACCEPT = 'video/*,audio/*,image/*'
const LIBRARY_MAX_SELECT = 20

export function MediaPool() {
  const inputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const project = useVideoEditorStore(s => s.project)
  const assets = useVideoEditorStore(s => s.assets)
  const registerAsset = useVideoEditorStore(s => s.registerAsset)
  const removeAsset = useVideoEditorStore(s => s.removeAsset)
  const relinkAsset = useVideoEditorStore(s => s.relinkAsset)
  const [isImporting, setIsImporting] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [pixabayOpen, setPixabayOpen] = useState(false)
  const [draggingAssetId, setDraggingAssetId] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    const browse = () => inputRef.current?.click()
    window.addEventListener(VIDEO_BROWSE_FILES_EVENT, browse)
    return () => window.removeEventListener(VIDEO_BROWSE_FILES_EVENT, browse)
  }, [])

  useEffect(() => {
    const focusUrl = () => {
      urlInputRef.current?.focus()
      urlInputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
    window.addEventListener(VIDEO_FOCUS_URL_IMPORT_EVENT, focusUrl)
    return () => window.removeEventListener(VIDEO_FOCUS_URL_IMPORT_EVENT, focusUrl)
  }, [])

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setIsImporting(true)
      try {
        for (const file of Array.from(files)) {
          if (file.size > HARD_IMPORT_LIMIT) {
            toast.error(`${file.name} exceeds the 500MB import limit`)
            continue
          }
          if (file.size > MAX_IMPORT_BYTES_WARN) {
            toast.message(
              `${file.name} is large (${(file.size / 1024 / 1024).toFixed(0)} MB) — import may take a moment`,
            )
          }
          try {
            const asset = await importMediaAsset(file)
            registerAsset(asset)
            placeAssetAtPlayhead(asset.id, asset.name)
          } catch (err) {
            if (err instanceof MediaImportError) {
              toast.error(`${file.name}: ${err.message}`)
            } else {
              toast.error(`Failed to import ${file.name}`)
            }
          }
        }
      } finally {
        setIsImporting(false)
      }
    },
    [registerAsset],
  )

  const handleLibrarySelect = useCallback(
    async (selected: AttachedMedia[]) => {
      if (selected.length === 0) return
      setIsImporting(true)
      try {
        const existingFileIds = new Set(
          project.assets.map(a => a.fileId).filter((id): id is string => Boolean(id)),
        )
        const existingUrls = new Set(
          project.assets.map(a => a.url).filter((url): url is string => Boolean(url)),
        )

        for (const item of selected) {
          if (existingFileIds.has(item.id) || existingUrls.has(item.url)) {
            toast.message(`${item.name ?? 'File'} is already in this project`)
            continue
          }
          try {
            const asset = await importMediaFromLibrary({
              url: item.url,
              name: item.name,
              fileId: item.id,
              width: item.width,
              height: item.height,
            })
            registerAsset(asset)
            placeAssetAtPlayhead(asset.id, asset.name)
          } catch (err) {
            const label = item.name ?? 'file'
            if (err instanceof MediaImportError) {
              toast.error(`${label}: ${err.message}`)
            } else {
              toast.error(`Failed to import ${label}`)
            }
          }
        }
      } finally {
        setIsImporting(false)
      }
    },
    [project.assets, registerAsset],
  )

  const handlePixabaySelect = useCallback(async (video: PixabayVideoResult) => {
    try {
      const asset = await importMediaFromUrl(video.videoUrl, video.name)
      if (asset.file.size > MAX_IMPORT_BYTES_WARN) {
        toast.message(
          `${video.name} is large (${(asset.file.size / 1024 / 1024).toFixed(0)} MB) — import may take a moment`,
        )
      }
      registerAndPlaceAtPlayhead(asset)
    } catch (err) {
      if (err instanceof MediaImportError) {
        toast.error(err.message)
      } else {
        toast.error('Failed to import Pixabay video')
      }
      throw err
    }
  }, [])

  const handleAddAtPlayhead = useCallback((assetId: string, name: string) => {
    placeAssetAtPlayhead(assetId, name)
  }, [])

  const onDropFiles = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        void handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const isEmpty = project.assets.length === 0

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col gap-2.5 p-3.5',
        isDragOver && 'rounded-none bg-primary/[0.03]',
      )}
      onDragOver={e => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDropFiles}
    >
      {isEmpty ? (
        <div className="flex shrink-0 flex-col gap-2.5">
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              disabled={isImporting}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left',
                'transition-colors duration-150',
                'hover:bg-foreground/[0.04] active:scale-[0.99]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/40">
                {isImporting ? (
                  <Loader2Icon className="size-3.5 animate-spin text-foreground/75" />
                ) : (
                  <UploadIcon className="size-3.5 text-foreground/75" strokeWidth={1.75} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-medium tracking-tight text-foreground">Upload</span>
                <span className="mt-0.5 block text-[11px] leading-[1.35] text-muted-foreground">
                  Video, audio, or images from your device
                </span>
              </span>
            </button>
            <button
              type="button"
              disabled={isImporting}
              onClick={() => setLibraryOpen(true)}
              className={cn(
                'group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left',
                'transition-colors duration-150',
                'hover:bg-foreground/[0.04] active:scale-[0.99]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/40">
                <FolderOpenIcon className="size-3.5 text-foreground/75" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-medium tracking-tight text-foreground">Files</span>
                <span className="mt-0.5 block text-[11px] leading-[1.35] text-muted-foreground">
                  Workspace library
                </span>
              </span>
            </button>
            <button
              type="button"
              disabled={isImporting}
              onClick={() => setPixabayOpen(true)}
              className={cn(
                'group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left',
                'transition-colors duration-150',
                'hover:bg-foreground/[0.04] active:scale-[0.99]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/40">
                <SearchIcon className="size-3.5 text-foreground/75" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-medium tracking-tight text-foreground">Pixabay</span>
                <span className="mt-0.5 block text-[11px] leading-[1.35] text-muted-foreground">
                  Search stock videos
                </span>
              </span>
            </button>
            <button
              type="button"
              disabled={isImporting}
              onClick={() => urlInputRef.current?.focus()}
              className={cn(
                'group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left',
                'transition-colors duration-150',
                'hover:bg-foreground/[0.04] active:scale-[0.99]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/40">
                <LinkIcon className="size-3.5 text-foreground/75" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-medium tracking-tight text-foreground">URL</span>
                <span className="mt-0.5 block text-[11px] leading-[1.35] text-muted-foreground">
                  Paste a direct media link
                </span>
              </span>
            </button>
          </div>
          <VideoUrlImportForm inputRef={urlInputRef} compact />
          <p className="px-2 text-[12px] leading-[1.45] text-muted-foreground">
            Files land on the timeline at the playhead. You can also drop them here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-[12px] font-medium"
              onClick={() => setPixabayOpen(true)}
              disabled={isImporting}
            >
              <SearchIcon className="size-3.5" strokeWidth={1.75} />
              Pixabay
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-[12px] font-medium"
              onClick={() => setLibraryOpen(true)}
              disabled={isImporting}
            >
              <FolderOpenIcon className="size-3.5" strokeWidth={1.75} />
              Files
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-[12px] font-medium"
              onClick={() => inputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <PlusIcon className="size-3.5" strokeWidth={1.75} />
              )}
              Import
            </Button>
          </div>

          <VideoUrlImportForm inputRef={urlInputRef} compact />
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={e => {
          if (e.target.files && e.target.files.length > 0) {
            void handleFiles(e.target.files)
          }
          e.target.value = ''
        }}
        className="hidden"
      />

      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-1.5 overflow-y-auto sidebar-scrollbar">
        {isImporting && project.assets.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center gap-2 py-8 text-[12px] text-muted-foreground">
            <Loader2Icon className="size-3.5 animate-spin" />
            Processing media…
          </div>
        ) : null}

        {project.assets.map(serialized => {
          const asset = assets[serialized.id]
          const available = asset ? isMediaAssetAvailable(asset) : false
          const isDragging = draggingAssetId === serialized.id
          const durationLabel =
            serialized.duration > 0
              ? `${serialized.duration.toFixed(1)}s`
              : serialized.type === 'image'
                ? '5.0s'
                : null
          return (
            <div
              key={serialized.id}
              draggable={available}
              onDragStart={e => {
                if (!available) return
                e.dataTransfer.setData(ASSET_DRAG_MIME, serialized.id)
                e.dataTransfer.effectAllowed = 'copy'
                setDraggingAssetId(serialized.id)
              }}
              onDragEnd={() => setDraggingAssetId(null)}
              onDoubleClick={() => {
                if (!available) return
                handleAddAtPlayhead(serialized.id, serialized.name)
              }}
              className={cn(
                'group relative w-full cursor-grab self-start overflow-hidden rounded-lg border border-border/50 bg-muted/20 transition-opacity active:cursor-grabbing',
                isDragging && 'opacity-50',
                available && 'hover:border-border hover:bg-muted/35',
              )}
              title={
                available
                  ? 'Double-click to add at playhead · drag onto timeline'
                  : 'File missing — locate it to use on timeline'
              }
            >
              <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black">
                {available &&
                asset &&
                'thumbnails' in asset &&
                asset.thumbnails &&
                asset.thumbnails.length > 0 ? (
                  <img
                    src={asset.thumbnails[0]}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    draggable={false}
                  />
                ) : available && asset && asset.type === 'audio' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/40 text-emerald-400">
                    <MusicIcon className="size-5" strokeWidth={1.5} />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/40 text-muted-foreground">
                    {serialized.type === 'audio' ? (
                      <MusicIcon className="size-5" strokeWidth={1.5} />
                    ) : serialized.type === 'image' ? (
                      <ImageIcon className="size-5" strokeWidth={1.5} />
                    ) : (
                      <FilmIcon className="size-5" strokeWidth={1.5} />
                    )}
                  </div>
                )}
                {durationLabel ? (
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-px text-[9px] font-medium tabular-nums leading-none text-white">
                    {durationLabel}
                  </span>
                ) : null}
                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-px text-[8px] font-medium uppercase leading-none tracking-wide text-white/90">
                  {serialized.type}
                </span>
                <button
                  type="button"
                  onClick={() => removeAsset(serialized.id)}
                  className="absolute right-1 top-1 hidden rounded-md bg-black/70 p-1 text-white transition-colors hover:bg-red-500 group-hover:block"
                  aria-label="Remove asset"
                >
                  <Trash2Icon className="size-3" />
                </button>
              </div>
              <div className="space-y-1 px-1.5 py-1.5">
                <p className="truncate text-[11px] leading-tight font-medium" title={serialized.name}>
                  {serialized.name}
                </p>
                {!available ? (
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = ACCEPT
                      input.onchange = async () => {
                        const file = input.files?.[0]
                        if (!file) return
                        try {
                          const hash = await sha1File(file)
                          if (hash !== serialized.hash) {
                            toast.error('This file does not match the original. Choose the same file.')
                            return
                          }
                          relinkAsset(serialized.id, file, hash)
                          toast.success(`Found ${serialized.name}`)
                        } catch {
                          toast.error('Could not locate file')
                        }
                      }
                      input.click()
                    }}
                    className="w-full rounded-md bg-yellow-500/15 px-1 py-0.5 text-[10px] font-medium text-yellow-700 dark:text-yellow-300"
                  >
                    Locate file
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <AttachImagesDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        accept="media"
        defaultTab="library"
        maxSelect={LIBRARY_MAX_SELECT}
        maxSize={HARD_IMPORT_LIMIT}
        title="Add from library"
        description="Choose images or videos from your workspace files to add to this project."
        onSelect={files => {
          void handleLibrarySelect(files)
        }}
      />
      <PixabayVideoSearchDialog
        open={pixabayOpen}
        onOpenChange={setPixabayOpen}
        onSelect={handlePixabaySelect}
      />
    </div>
  )
}

async function sha1File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-1', buffer)
  const bytes = new Uint8Array(digest)
  let hex = ''
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, '0')
  }
  return hex
}
