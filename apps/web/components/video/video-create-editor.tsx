'use client'

import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { VideoStudio } from '@/components/video/video-studio'
import { importSlideshowToTimeline, type SlideshowImportProgress } from '@/lib/video/slideshow-import'
import { useVideoEditorStore } from '@/lib/video/store'
import { fetchSlideshow } from '@/services/slideshow.client'
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
  const [ready, setReady] = useState(!slideshowId)
  const [error, setError] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState<SlideshowImportProgress | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    async function init() {
      if (!slideshowId) {
        if (!importedRef.current) {
          clearProject()
        }
        importedRef.current = false
        setReady(true)
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
        router.replace('/dashboard/studio/videos/create')
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
      <LoadingState message={formatImportMessage(importProgress)} className="flex-1 px-4 py-8">
        {progressPercent !== null ? (
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        ) : null}
      </LoadingState>
    )
  }

  if (error) {
    return (
      <ErrorState
        title={error}
        description="This slideshow may have been deleted or could not be rendered."
        className="flex-1"
      />
    )
  }

  return <VideoStudio />
}
