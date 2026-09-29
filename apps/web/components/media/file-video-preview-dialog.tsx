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
import type { MediaGridItem } from '@/components/media/media-grid'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { stashVideoLibraryImport } from '@/lib/video/library-import-pending'
import { cn } from '@/lib/utils'
import { DownloadIcon, FilmIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { toast } from 'sonner'

type FileVideoPreviewDialogProps = {
  item: MediaGridItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

function resolveFileName(item: MediaGridItem) {
  if (item.name) return item.name
  try {
    return decodeURIComponent(new URL(item.src).pathname.split('/').pop() ?? 'video')
  } catch {
    return 'video'
  }
}

async function downloadVideo(url: string, filename: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Download failed')
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(objectUrl)
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

export function FileVideoPreviewDialog({ item, open, onOpenChange }: FileVideoPreviewDialogProps) {
  const router = useRouter()
  const fileName = resolveFileName(item)

  const handleDownload = useCallback(() => {
    void downloadVideo(item.src, fileName)
  }, [fileName, item.src])

  const handleEditInEditor = useCallback(() => {
    stashVideoLibraryImport({
      id: item.id,
      url: item.src,
      name: fileName,
      width: item.width,
      height: item.height,
    })
    onOpenChange(false)
    router.push(DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE)
  }, [fileName, item, onOpenChange, router])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'gap-0 overflow-hidden p-0 sm:max-w-3xl',
          'border-border/80 bg-card shadow-2xl',
        )}
        showCloseButton
      >
        <DialogHeader className="gap-1 border-b border-border/60 px-5 py-4 pr-14">
          <DialogTitle className="truncate text-[15px] font-medium tracking-tight">{fileName}</DialogTitle>
          <DialogDescription className="text-xs">Preview and open in the video editor</DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 px-3 py-4 sm:px-5">
          <div
            className="relative mx-auto aspect-video w-full max-h-[min(70vh,520px)] overflow-hidden rounded-lg bg-black outline outline-1 outline-[oklch(0_0_0/0.12)] dark:outline-[oklch(1_0_0/0.12)]"
          >
            <video
              key={item.src}
              src={item.src}
              controls
              playsInline
              className="size-full object-contain"
              onError={() => toast.error('Could not play this video')}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border/60 px-5 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" size="sm" className="h-9" onClick={handleDownload}>
            <DownloadIcon className="size-4" />
            Download
          </Button>
          <Button type="button" size="sm" className="h-9" onClick={handleEditInEditor}>
            <FilmIcon className="size-4" />
            Edit in editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
