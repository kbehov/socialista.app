'use client'

import { useState, useTransition } from 'react'
import { DownloadIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { importMediaFromUrl, MediaImportError } from '@/lib/video/media-import'
import { registerAndPlaceAtPlayhead } from '@/lib/video/import-placement'
import { MAX_IMPORT_BYTES_WARN } from '@/lib/video/defaults'
import { cn } from '@/lib/utils'

export function VideoUrlImportForm({ className }: { className?: string }) {
  const [url, setUrl] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleImport = () => {
    const trimmed = url.trim()
    if (!trimmed) {
      toast.error('Paste a media URL first')
      return
    }
    if (!/^https?:\/\//.test(trimmed)) {
      toast.error('Enter a valid http(s) URL')
      return
    }

    startTransition(async () => {
      try {
        const asset = await importMediaFromUrl(trimmed)
        if (asset.file.size > MAX_IMPORT_BYTES_WARN) {
          toast.message(
            `Large file (${(asset.file.size / 1024 / 1024).toFixed(0)} MB) — import may take a moment`,
          )
        }
        registerAndPlaceAtPlayhead(asset)
        setUrl('')
      } catch (err) {
        if (err instanceof MediaImportError) {
          toast.error(err.message)
        } else {
          toast.error('Failed to import media from URL')
        }
      }
    })
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-1.5">
        <Label htmlFor="video-url" className="text-xs font-medium">
          Import from URL
        </Label>
        <div className="flex gap-2">
          <Input
            id="video-url"
            type="url"
            placeholder="https://example.com/video.mp4"
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={isPending}
            className="min-w-0 flex-1 text-sm"
            onKeyDown={e => {
              if (e.key === 'Enter') handleImport()
            }}
          />
          <Button
            type="button"
            size="sm"
            className="h-9 shrink-0 px-2.5"
            onClick={handleImport}
            disabled={isPending || !url.trim()}
            aria-label={isPending ? 'Importing' : 'Import from URL'}
          >
            {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <DownloadIcon className="size-4" />}
          </Button>
        </div>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Direct links to video, audio, or image files · added at playhead
        </p>
      </div>
    </div>
  )
}

export function VideoUrlImportPanel({ embedded = false }: { embedded?: boolean }) {
  return (
    <aside
      className={
        embedded
          ? 'flex h-full min-h-0 flex-col overflow-hidden'
          : 'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm'
      }
    >
      <div data-studio-scroll="source" className="sidebar-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3.5">
        <VideoUrlImportForm />

        <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-2.5">
          <p className="text-[11px] font-medium">Supported formats</p>
          <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>· MP4, WebM, MOV for video</li>
            <li>· MP3, WAV, AAC for audio</li>
            <li>· JPG, PNG, WebP for images (5s default)</li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
