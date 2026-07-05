'use client'

import { VideoStudio } from '@/components/video/video-studio'
import { useVideoEditorStore } from '@/lib/video/store'
import { useEffect } from 'react'

export function VideoCreateEditor() {
  const clearProject = useVideoEditorStore(s => s.clearProject)

  useEffect(() => {
    clearProject()
    return () => clearProject()
  }, [clearProject])

  return <VideoStudio />
}
