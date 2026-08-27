'use client'

import { useState, useTransition, type RefObject } from 'react'
import { CheckIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { importMediaFromUrl, MediaImportError } from '@/lib/video/media-import'
import { registerAndPlaceAtPlayhead } from '@/lib/video/import-placement'
import { MAX_IMPORT_BYTES_WARN } from '@/lib/video/defaults'
import { cn } from '@/lib/utils'

type VideoUrlImportFormProps = {
  className?: string
  inputRef?: RefObject<HTMLInputElement | null>
  compact?: boolean
}

export function VideoUrlImportForm({ className, inputRef, compact = false }: VideoUrlImportFormProps) {
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
    <div className={cn('flex flex-col gap-1.5', className)}>
      {compact ? null : (
        <p className="text-[11px] font-medium text-muted-foreground">Import from URL</p>
      )}
      <form
        className="flex gap-1"
        onSubmit={e => {
          e.preventDefault()
          handleImport()
        }}
      >
        <input
          ref={inputRef}
          id="video-url"
          type="url"
          placeholder="https://…"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={isPending}
          aria-label="Media URL"
          className="min-w-0 flex-1 rounded-md border border-input bg-background/60 px-2 py-1 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
        />
        <Button
          size="icon-xs"
          type="submit"
          disabled={isPending || !url.trim()}
          aria-label={isPending ? 'Importing' : 'Import from URL'}
        >
          {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : <CheckIcon className="size-3.5" />}
        </Button>
      </form>
      {compact ? null : (
        <p className="text-[11px] leading-[1.45] text-muted-foreground">
          Direct links to video, audio, or image files · added at playhead
        </p>
      )}
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
      </div>
    </aside>
  )
}
