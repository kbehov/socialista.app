'use client'

import { useState, useTransition } from 'react'
import { DownloadIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { TikTokPostCard } from '@/components/tiktok/tiktok-post-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { importMediaFromUrl, MediaImportError } from '@/lib/video/media-import'
import { registerAndPlaceAtPlayhead } from '@/lib/video/import-placement'
import type { TikTokExtractResult } from '@/lib/tiktok/extract'
import { isTikTokUrl } from '@/lib/tiktok/extract'

export function VideoTikTokImportPanel({ embedded = false }: { embedded?: boolean }) {
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<TikTokExtractResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isImporting, setIsImporting] = useState(false)

  const handleExtract = () => {
    const trimmed = url.trim()
    if (!trimmed) {
      toast.error('Paste a TikTok URL first')
      return
    }
    if (!isTikTokUrl(trimmed)) {
      toast.error('Enter a valid TikTok URL')
      return
    }

    startTransition(async () => {
      setPreview(null)

      try {
        const response = await fetch('/api/extract/tiktok', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        })

        const data = (await response.json()) as TikTokExtractResult & { error?: string }

        if (!response.ok) {
          toast.error(data.error ?? 'Failed to extract TikTok post')
          return
        }

        if (data.type !== 'video' || data.videoUrls.length === 0) {
          toast.error('This link is a slideshow, not a video. Use the slideshow editor for photo carousels.')
          return
        }

        setPreview(data)
      } catch {
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  const handleImport = async () => {
    if (!preview || preview.videoUrls.length === 0) return

    const videoUrl = preview.videoUrls[0]
    if (!videoUrl) return

    setIsImporting(true)
    try {
      const name = preview.description
        ? `tiktok-${preview.author.username || preview.id}.mp4`
        : `tiktok-${preview.id}.mp4`
      const asset = await importMediaFromUrl(videoUrl, name)
      registerAndPlaceAtPlayhead(asset)
      toast.success('Imported TikTok video to timeline')
      setPreview(null)
      setUrl('')
    } catch (err) {
      if (err instanceof MediaImportError) {
        toast.error(err.message)
      } else {
        toast.error('Failed to import TikTok video')
      }
    } finally {
      setIsImporting(false)
    }
  }

  const canImport = preview && preview.videoUrls.length > 0 && !isPending && !isImporting

  return (
    <aside
      className={
        embedded
          ? 'flex h-full min-h-0 flex-col overflow-hidden'
          : 'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm'
      }
    >
      <div data-studio-scroll="source" className="sidebar-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="video-tiktok-url" className="text-xs font-medium">
            TikTok video URL
          </Label>
          <Input
            id="video-tiktok-url"
            type="url"
            placeholder="https://www.tiktok.com/@user/video/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={isPending || isImporting}
            className="text-sm"
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Paste a TikTok video link. The video is added at the playhead for trimming and overlays.
          </p>
        </div>

        <Button className="w-full" onClick={handleExtract} disabled={isPending || isImporting || !url.trim()}>
          {isPending ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
          {isPending ? 'Extracting…' : 'Extract video'}
        </Button>

        {preview ? (
          <div className="space-y-3">
            <div className="flex justify-center rounded-lg border bg-muted/20 p-3">
              <TikTokPostCard post={preview} className="max-w-[200px] shadow-md" />
            </div>

            <Button className="w-full" onClick={() => void handleImport()} disabled={!canImport}>
              {isImporting ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
              {isImporting ? 'Importing…' : 'Import video to timeline'}
            </Button>
          </div>
        ) : null}

        <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-2.5">
          <p className="text-[11px] font-medium">After importing</p>
          <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>· Trim on the timeline or split with S</li>
            <li>· Add text overlays for captions and hooks</li>
            <li>· Export as MP4 when ready</li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
