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
      <div className="flex items-center justify-between">
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

      <div
        className={cn(
          'rounded-lg border border-dashed px-3 py-4 text-center transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-border/60 bg-muted/20',
        )}
      >
        <UploadIcon className="mx-auto size-5 text-muted-foreground" />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Drop files here or click Import
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground/80">
          Added at playhead · double-click to re-add
        </p>
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

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto sidebar-scrollbar">
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
                'group relative flex cursor-grab flex-col gap-1 rounded-md border bg-muted/30 p-1.5 transition-opacity active:cursor-grabbing',
                isDragging && 'opacity-50',
                available && 'hover:border-primary/40 hover:bg-muted/50',
              )}
              title={available ? 'Double-click to add at playhead · drag onto timeline' : 'Re-link file to use on timeline'}
            >
              <div className="aspect-video w-full overflow-hidden rounded bg-black">
                {available && asset && 'thumbnails' in asset && asset.thumbnails && asset.thumbnails.length > 0 ? (
                  <img
                    src={asset.thumbnails[0]}
                    alt={serialized.name}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : available && asset && asset.type === 'audio' ? (
                  <div className="flex h-full w-full items-center justify-center text-emerald-400">
                    <MusicIcon className="h-6 w-6" />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-yellow-400">
                    {serialized.type === 'audio' ? (
                      <MusicIcon className="h-6 w-6" />
                    ) : serialized.type === 'image' ? (
                      <ImageIcon className="h-6 w-6" />
                    ) : (
                      <FilmIcon className="h-6 w-6" />
                    )}
                  </div>
                )}
              </div>
              <div className="truncate text-[10px]" title={serialized.name}>
                {serialized.name}
              </div>
              <div className="text-[9px] text-muted-foreground">
                {serialized.duration > 0 ? `${serialized.duration.toFixed(1)}s` : serialized.type === 'image' ? '5.0s' : '—'} ·{' '}
                {serialized.type}
              </div>
              {!available && (
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
                  className="rounded bg-yellow-500/20 px-1 py-0.5 text-[9px] text-yellow-700 dark:text-yellow-300"
                >
                  Re-link
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAsset(serialized.id)}
                className="absolute right-1 top-1 hidden rounded bg-black/60 p-1 text-white hover:bg-red-500 group-hover:block"
                aria-label="Remove asset"
              >
                <Trash2Icon className="h-3 w-3" />
              </button>
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
