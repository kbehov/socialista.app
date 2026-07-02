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

  return <SlideshowStudio />
}
