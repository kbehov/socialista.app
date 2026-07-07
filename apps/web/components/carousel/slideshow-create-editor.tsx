'use client'

import { SlideshowStudio } from '@/components/carousel/slideshow-studio'
import { useEditorStore } from '@/lib/carousel/store'
import { useEffect } from 'react'

export function SlideshowCreateEditor() {
  const clearProject = useEditorStore(s => s.clearProject)

  useEffect(() => {
    clearProject()
    return () => clearProject()
  }, [clearProject])

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <SlideshowStudio />
    </div>
  )
}
