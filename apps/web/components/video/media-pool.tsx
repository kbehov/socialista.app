'use client'

import { useCallback, useRef, useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { importMediaAsset, MediaImportError } from '@/lib/video/media-import'
import { isMediaAssetAvailable } from '@/lib/video/types'
import { HARD_IMPORT_LIMIT, MAX_IMPORT_BYTES_WARN } from '@/lib/video/defaults'
import {
  ASSET_DRAG_MIME,
} from '@/lib/video/timeline-placement'
import { placeAssetAtPlayhead } from '@/lib/video/import-placement'
import { VideoUrlImportForm } from '@/components/video/video-url-import-panel'
import { FilmIcon, ImageIcon, Loader2Icon, MusicIcon, PlusIcon, Trash2Icon, UploadIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ACCEPT = 'video/*,audio/*,image/*'

export function MediaPool({ embedded = false }: { embedded?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const project = useVideoEditorStore(s => s.project)
  const assets = useVideoEditorStore(s => s.assets)
  const registerAsset = useVideoEditorStore(s => s.registerAsset)
  const removeAsset = useVideoEditorStore(s => s.removeAsset)
  const relinkAsset = useVideoEditorStore(s => s.relinkAsset)
  const [isImporting, setIsImporting] = useState(false)
  const [draggingAssetId, setDraggingAssetId] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

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
            toast.message(`${file.name} is large (${(file.size / 1024 / 1024).toFixed(0)} MB) — import may take a moment`)
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

  const handleAddAtPlayhead = useCallback(
    (assetId: string, name: string) => {
      placeAssetAtPlayhead(assetId, name)
    },
    [],
  )

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

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col gap-2',
        embedded ? 'p-3' : 'p-3',
      )}
      onDragOver={e => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDropFiles}
    >
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-semibold">Media</h2>
        <Button
          type="button"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={isImporting}
        >
          {isImporting ? <Loader2Icon className="size-3 animate-spin" /> : <PlusIcon className="size-3" />}
          Import
        </Button>
      </div>

      <VideoUrlImportForm className="shrink-0" />

      <div
        className={cn(
          'shrink-0 rounded-lg border border-dashed text-center transition-colors',
          project.assets.length > 0 ? 'px-2 py-2' : 'px-3 py-4',
          isDragOver ? 'border-primary bg-primary/5' : 'border-border/60 bg-muted/20',
        )}
      >
        <UploadIcon
          className={cn('mx-auto text-muted-foreground', project.assets.length > 0 ? 'size-4' : 'size-5')}
        />
        <p
          className={cn(
            'text-muted-foreground',
            project.assets.length > 0 ? 'mt-1 text-[10px]' : 'mt-1.5 text-[11px]',
          )}
        >
          {project.assets.length > 0 ? 'Drop more files' : 'Drop files here or click Import'}
        </p>
        {project.assets.length === 0 ? (
          <p className="mt-0.5 text-[10px] text-muted-foreground/80">
            Added at playhead · double-click to re-add
          </p>
        ) : null}
      </div>

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

      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-2 overflow-y-auto sidebar-scrollbar">
        {isImporting && project.assets.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
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
                'group relative w-full cursor-grab self-start overflow-hidden rounded-md border bg-muted/30 transition-opacity active:cursor-grabbing',
                isDragging && 'opacity-50',
                available && 'hover:border-primary/40 hover:bg-muted/50',
              )}
              title={available ? 'Double-click to add at playhead · drag onto timeline' : 'Re-link file to use on timeline'}
            >
              <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black">
                {available && asset && 'thumbnails' in asset && asset.thumbnails && asset.thumbnails.length > 0 ? (
                  <img
                    src={asset.thumbnails[0]}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    draggable={false}
                  />
                ) : available && asset && asset.type === 'audio' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/40 text-emerald-400">
                    <MusicIcon className="size-5" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-yellow-950/20 text-yellow-500">
                    {serialized.type === 'audio' ? (
                      <MusicIcon className="size-5" />
                    ) : serialized.type === 'image' ? (
                      <ImageIcon className="size-5" />
                    ) : (
                      <FilmIcon className="size-5" />
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
                  className="absolute right-1 top-1 hidden rounded bg-black/70 p-1 text-white hover:bg-red-500 group-hover:block"
                  aria-label="Remove asset"
                >
                  <Trash2Icon className="size-3" />
                </button>
              </div>
              <div className="space-y-1 px-1.5 py-1.5">
                <p className="truncate text-[10px] leading-tight font-medium" title={serialized.name}>
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
                            toast.error('File hash does not match the original. Re-import the same file.')
                            return
                          }
                          relinkAsset(serialized.id, file, hash)
                          toast.success(`Re-linked ${serialized.name}`)
                        } catch {
                          toast.error('Failed to re-link file')
                        }
                      }
                      input.click()
                    }}
                    className="w-full rounded bg-yellow-500/15 px-1 py-0.5 text-[9px] font-medium text-yellow-700 dark:text-yellow-300"
                  >
                    Re-link file
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}

        {project.assets.length === 0 && !isImporting ? (
          <div className="col-span-2 rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            Import video, audio, or image files to start building your timeline.
          </div>
        ) : null}
      </div>
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
