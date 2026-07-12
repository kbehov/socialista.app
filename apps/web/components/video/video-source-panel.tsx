'use client'

import { useState } from 'react'
import { SparklesIcon, UploadIcon } from 'lucide-react'
import { StudioSegmentedTabs } from '@/components/carousel/studio-segmented-tabs'
import { MediaPool } from '@/components/video/media-pool'
import { VideoGeneratePanel } from '@/components/video/video-generate-panel'

type SourceMode = 'generate' | 'files'

const SOURCE_TABS = [
  { id: 'generate' as const, label: 'Generate', icon: SparklesIcon },
  { id: 'files' as const, label: 'Files', icon: UploadIcon },
]

export function VideoSourcePanel() {
  const [mode, setMode] = useState<SourceMode>('generate')

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-b bg-background px-3 py-2.5">
        <StudioSegmentedTabs tabs={SOURCE_TABS} value={mode} onChange={setMode} size="sm" />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {mode === 'generate' ? <VideoGeneratePanel embedded /> : <MediaPool embedded />}
      </div>
    </div>
  )
}
