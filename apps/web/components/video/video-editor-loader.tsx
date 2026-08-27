'use client'

import { ErrorState } from '@/components/common/error-state'
import { VideoStudio } from '@/components/video/video-studio'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { hydrateVideoAssets } from '@/lib/video/hydrate-video-assets'
import { useVideoEditorStore } from '@/lib/video/store'
import { getVideo } from '@/services/video.service'
import { Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type VideoEditorLoaderProps = {
  videoId: string
}

export function VideoEditorLoader({ videoId }: VideoEditorLoaderProps) {
  const loadProject = useVideoEditorStore(s => s.loadProject)
  const hydrateRuntimeAssets = useVideoEditorStore(s => s.hydrateRuntimeAssets)
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

      const hydrated = await hydrateVideoAssets(video.assets)
      if (cancelled) return
      hydrateRuntimeAssets(hydrated)

      setIsLoading(false)
    }

    void load()

    return () => {
      cancelled = true
      clearProject()
    }
  }, [clearProject, hydrateRuntimeAssets, loadProject, videoId])

  if (isLoading) {
    return (
      <div className="video-studio flex h-full min-h-0 min-w-0 flex-1 flex-col items-center justify-center bg-background px-6">
        <div className="flex items-center gap-2" role="status" aria-live="polite" aria-busy="true">
          <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
          <p className="text-[13px] font-medium tracking-tight text-foreground">Loading video…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title={error}
        description="This video may have been deleted."
        className="flex-1"
        action={
          <Button asChild size="sm" variant="outline" className="h-8 text-[12px] font-medium">
            <Link href={DASHBOARD_ROUTES.STUDIO.VIDEOS}>Back to videos</Link>
          </Button>
        }
      />
    )
  }

  return <VideoStudio />
}
