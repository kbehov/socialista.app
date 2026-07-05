'use client'

import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { VideoStudio } from '@/components/video/video-studio'
import { useVideoEditorStore } from '@/lib/video/store'
import { getVideo } from '@/services/video.service'
import { useEffect, useState } from 'react'

type VideoEditorLoaderProps = {
  videoId: string
}

export function VideoEditorLoader({ videoId }: VideoEditorLoaderProps) {
  const loadProject = useVideoEditorStore(s => s.loadProject)
  const clearProject = useVideoEditorStore(s => s.clearProject)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      const response = await getVideo(videoId)
      if (cancelled) return

      if (!response.success || !response.data?.video) {
        setError(response.message ?? 'Video not found')
        setIsLoading(false)
        return
      }

      const { video } = response.data
      loadProject({
        id: video.id,
        name: video.name,
        project: {
          id: video.id,
          name: video.name,
          duration: video.duration,
          resolution: video.resolution,
          fps: video.fps,
          tracks: video.tracks,
          clips: video.clips,
          textOverlays: video.textOverlays,
          assets: video.assets,
        },
      })
      setIsLoading(false)
    }

    void load()

    return () => {
      cancelled = true
      clearProject()
    }
  }, [clearProject, loadProject, videoId])

  if (isLoading) {
    return <LoadingState message="Loading video…" className="flex-1" />
  }

  if (error) {
    return <ErrorState title={error} description="This video may have been deleted." className="flex-1" />
  }

  return <VideoStudio />
}
