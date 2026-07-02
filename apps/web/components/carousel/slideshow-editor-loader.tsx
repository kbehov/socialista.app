'use client'

import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { SlideshowStudio } from '@/components/carousel/slideshow-studio'
import { useEditorStore } from '@/lib/carousel/store'
import { getSlideshow } from '@/services/slideshow.service'
import { useEffect, useState } from 'react'

type SlideshowEditorLoaderProps = {
  slideshowId: string
}

export function SlideshowEditorLoader({ slideshowId }: SlideshowEditorLoaderProps) {
  const loadProject = useEditorStore(s => s.loadProject)
  const clearProject = useEditorStore(s => s.clearProject)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      const response = await getSlideshow(slideshowId)
      if (cancelled) return

      if (!response.success || !response.data?.slideshow) {
        setError(response.message ?? 'Slideshow not found')
        setIsLoading(false)
        return
      }

      const { slideshow } = response.data
      loadProject({
        id: slideshow.id,
        name: slideshow.name,
        canvas: slideshow.canvas,
        aspectRatioId: slideshow.aspectRatioId,
        slides: slideshow.slides,
      })
      setIsLoading(false)
    }

    void load()

    return () => {
      cancelled = true
      clearProject()
    }
  }, [clearProject, loadProject, slideshowId])

  if (isLoading) {
    return <LoadingState message="Loading slideshow…" className="flex-1" />
  }

  if (error) {
    return <ErrorState title={error} description="This slideshow may have been deleted." className="flex-1" />
  }

  return <SlideshowStudio />
}
