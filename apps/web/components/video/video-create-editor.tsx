'use client'

import { ErrorState } from '@/components/common/error-state'
import { Button } from '@/components/ui/button'
import { VideoStudio } from '@/components/video/video-studio'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { registerAndPlaceAtPlayhead } from '@/lib/video/import-placement'
import { consumeVideoLibraryImport } from '@/lib/video/library-import-pending'
import { generateVideoThumbnails, importMediaFromLibrary } from '@/lib/video/media-import'
import { importSlideshowToTimeline, type SlideshowImportProgress } from '@/lib/video/slideshow-import'
import { useVideoEditorStore } from '@/lib/video/store'
import { fetchSlideshow } from '@/services/slideshow.client'
import { Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type VideoCreateEditorProps = {
  slideshowId?: string
}

function formatImportMessage(progress: SlideshowImportProgress | null): string {
  if (!progress) return 'Importing slideshow…'

  const label = progress.phase === 'rendering' ? 'Rendering slides' : 'Importing to timeline'
  return `${label} (${progress.current}/${progress.total})`
}

export function VideoCreateEditor({ slideshowId }: VideoCreateEditorProps) {
  const router = useRouter()
  const clearProject = useVideoEditorStore(s => s.clearProject)
  const importedRef = useRef(false)
  const libraryImportRef = useRef(false)
  const [ready, setReady] = useState(!slideshowId)
  const [error, setError] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState<SlideshowImportProgress | null>(null)

  useEffect(() => {
    if (slideshowId || libraryImportRef.current) return

    const pending = consumeVideoLibraryImport()
    if (!pending) return

    libraryImportRef.current = true
    setTimeout(() => {
      setReady(false)
      setError(null)
    }, 10)

    let cancelled = false

    async function importFromLibrary() {
      clearProject()

      try {
        const asset = await importMediaFromLibrary(
          {
            url: pending?.url ?? '',
            fileId: pending?.id,
            name: pending?.name,
            width: pending?.width,
            height: pending?.height,
          },
          { deferThumbnails: true },
        )
        if (cancelled) return

        registerAndPlaceAtPlayhead(asset)
        void generateVideoThumbnails(asset).then(thumbnails => {
          if (thumbnails.length > 0) {
            useVideoEditorStore.getState().setAssetThumbnails(asset.id, thumbnails)
          }
        })
        importedRef.current = true
        toast.success(`Added ${pending?.name ?? 'video'} to timeline`)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Failed to import video from library'
        toast.error(message)
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    void importFromLibrary()

    return () => {
      cancelled = true
    }
  }, [clearProject, slideshowId])

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    async function init() {
      if (!slideshowId) {
        if (!importedRef.current && !libraryImportRef.current) {
          clearProject()
        }
        if (!libraryImportRef.current) {
          importedRef.current = false
        }
        if (!libraryImportRef.current) {
          setReady(true)
        }
        setError(null)
        setImportProgress(null)
        return
      }

      clearProject()
      setReady(false)
      setError(null)
      setImportProgress(null)

      try {
        const response = await fetchSlideshow(slideshowId, { signal: controller.signal })
        if (cancelled || controller.signal.aborted) return

        if (!response.success || !response.data?.slideshow) {
          setError(response.message ?? 'Slideshow not found')
          return
        }

        const count = await importSlideshowToTimeline(response.data.slideshow, {
          onProgress: progress => {
            if (!cancelled && !controller.signal.aborted) {
              setImportProgress(progress)
            }
          },
        })
        if (cancelled || controller.signal.aborted) return

        if (count === 0) {
          setError('Slideshow has no slides to import')
          return
        }

        importedRef.current = true
        router.replace(DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE)
        setReady(true)
        setImportProgress(null)
        toast.success(`Imported ${count} slide${count === 1 ? '' : 's'} to timeline`)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message = err instanceof Error ? err.message : 'Failed to import slideshow'
        setError(message)
        toast.error(message)
      }
    }

    void init()

    return () => {
      cancelled = true
      controller.abort()
      if (!importedRef.current) {
        clearProject()
      }
    }
  }, [clearProject, router, slideshowId])

  if (!ready && !error) {
    const progressPercent =
      importProgress && importProgress.total > 0
        ? Math.round((importProgress.current / importProgress.total) * 100)
        : null

    return (
      <div className="video-studio flex h-full min-h-0 min-w-0 flex-1 flex-col items-center justify-center bg-background px-6">
        <div
          className="flex w-full max-w-xs flex-col items-center gap-3"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          <p className="text-[13px] font-medium tracking-tight text-foreground">
            {formatImportMessage(importProgress)}
          </p>
          {progressPercent !== null ? (
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/80 transition-[width] duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title={error}
        description="This slideshow may have been deleted or could not be rendered."
        className="flex-1"
        action={
          <Button asChild size="sm" variant="outline" className="h-8 text-sidebar-label font-medium">
            <Link href={DASHBOARD_ROUTES.STUDIO.VIDEOS}>Back to videos</Link>
          </Button>
        }
      />
    )
  }

  return <VideoStudio />
}
