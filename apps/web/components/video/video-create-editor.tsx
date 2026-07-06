'use client'

import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { VideoStudio } from '@/components/video/video-studio'
import { importSlideshowToTimeline } from '@/lib/video/slideshow-import'
import { useVideoEditorStore } from '@/lib/video/store'
import { getSlideshow } from '@/services/slideshow.service'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type VideoCreateEditorProps = {
  slideshowId?: string
}

export function VideoCreateEditor({ slideshowId }: VideoCreateEditorProps) {
  const router = useRouter()
  const clearProject = useVideoEditorStore(s => s.clearProject)
  const importedRef = useRef(false)
  const [ready, setReady] = useState(!slideshowId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!slideshowId) {
        if (!importedRef.current) {
          clearProject()
        }
        importedRef.current = false
        setReady(true)
        setError(null)
        return
      }

      clearProject()
      setReady(false)
      setError(null)

      try {
        const response = await getSlideshow(slideshowId)
        if (cancelled) return

        if (!response.success || !response.data?.slideshow) {
          setError(response.message ?? 'Slideshow not found')
          return
        }

        const count = await importSlideshowToTimeline(response.data.slideshow)
        if (cancelled) return

        if (count === 0) {
          setError('Slideshow has no slides to import')
          return
        }

        importedRef.current = true
        router.replace('/dashboard/studio/videos/create')
        setReady(true)
        toast.success(`Imported ${count} slide${count === 1 ? '' : 's'} to timeline`)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Failed to import slideshow'
        setError(message)
        toast.error(message)
      }
    }

    void init()

    return () => {
      cancelled = true
      if (!importedRef.current) {
        clearProject()
      }
    }
  }, [clearProject, router, slideshowId])

  if (!ready && !error) {
    return <LoadingState message="Importing slideshow…" className="flex-1" />
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
