'use client'

import { TikTokPostCard } from '@/components/cards/tiktok-post-card'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { StudioPanelScrollArea } from '@/components/carousel/studio-segmented-tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isBlankSlide } from '@/lib/carousel/defaults'
import { useEditorStore } from '@/lib/carousel/store'
import type { TikTokExtractResult } from '@/lib/tiktok/extract'
import { isTikTokUrl } from '@/lib/tiktok/extract'
import { DownloadIcon, Loader2Icon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export function SlideshowTikTokImportPanel({ embedded = false }: { embedded?: boolean }) {
  const applyTikTokImport = useEditorStore(s => s.applyTikTokImport)
  const currentSlideCount = useEditorStore(s => s.slides.length)

  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<TikTokExtractResult | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

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

        if (data.type !== 'slideshow' || data.imageUrls.length === 0) {
          toast.error('This link is a video, not a slideshow. Paste a photo/slideshow URL.')
          return
        }

        setPreview(data)
      } catch {
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  const runImport = () => {
    if (!preview || preview.imageUrls.length === 0) return

    applyTikTokImport(preview.imageUrls)
    useEditorStore.getState().setStudioPanelTab('edit')
    toast.success(`Imported ${preview.imageUrls.length} slides from TikTok`)
    setPreview(null)
    setUrl('')
    setConfirmOpen(false)
  }

  const handleImport = () => {
    if (!preview || preview.imageUrls.length === 0) return

    const slides = useEditorStore.getState().slides
    const hasExistingWork =
      slides.length > 1 || (slides[0] != null && !isBlankSlide(slides[0]))

    if (hasExistingWork) {
      setConfirmOpen(true)
      return
    }

    runImport()
  }

  const canImport = Boolean(preview && preview.imageUrls.length > 0 && !isPending)
  const importCount = preview?.imageUrls.length ?? 0

  return (
    <aside
      className={
        embedded
          ? 'flex h-full min-h-0 flex-col overflow-hidden'
          : 'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm'
      }
    >
      {!embedded ? (
        <div className="border-b bg-muted/20 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
              TT
            </span>
            <div>
              <h2 className="text-sm font-semibold leading-none">TikTok import</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">Pull slides from an existing post</p>
            </div>
          </div>
        </div>
      ) : null}

      <StudioPanelScrollArea contentClassName="gap-4 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="tiktok-url" className="text-xs font-medium">
            TikTok slideshow URL
          </Label>
          <Input
            id="tiktok-url"
            type="url"
            placeholder="https://www.tiktok.com/@user/photo/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={isPending}
            className="text-sm"
          />
          <p className="text-[11px] text-muted-foreground">
            Photo carousel links work best. Each image becomes a slide background you can edit on the canvas.
          </p>
        </div>

        <Button className="w-full" onClick={handleExtract} disabled={isPending || !url.trim()}>
          {isPending ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
          {isPending ? 'Extracting…' : 'Extract slideshow'}
        </Button>

        {preview ? (
          <div className="space-y-3">
            <div className="flex justify-center rounded-lg border bg-muted/20 p-3">
              <TikTokPostCard post={preview} className="max-w-[200px] shadow-md" />
            </div>

            <Button className="w-full" onClick={handleImport} disabled={!canImport}>
              Import {preview.imageUrls.length} slides to canvas
            </Button>
          </div>
        ) : null}

        <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-2.5">
          <p className="text-[11px] font-medium">After importing</p>
          <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>· Canvas switches to TikTok 9:16 format</li>
            <li>· Add text layers or replace backgrounds per page</li>
            <li>· Export as ZIP when ready</li>
          </ul>
        </div>
      </StudioPanelScrollArea>

      <DeleteConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Replace current slides?"
        description={`Importing from TikTok will replace all ${currentSlideCount} current pages with ${importCount} imported slides. This cannot be undone.`}
        confirmLabel="Replace slides"
        onConfirm={runImport}
      />
    </aside>
  )
}
