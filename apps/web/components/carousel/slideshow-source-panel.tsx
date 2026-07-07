'use client'

import { useState } from 'react'
import { SparklesIcon } from 'lucide-react'
import { TikTokIcon } from '@/components/icons/tiktok-icon'
import { SlideshowGeneratorPanel } from '@/components/carousel/slideshow-generator-panel'
import { SlideshowTikTokImportPanel } from '@/components/carousel/slideshow-tiktok-import-panel'
import { StudioPanelHeader, StudioSegmentedTabs } from '@/components/carousel/studio-segmented-tabs'

type SourceMode = 'ai' | 'tiktok'

function TikTokTabIcon({ className }: { className?: string }) {
  return <TikTokIcon className={className} size={14} />
}

const SOURCE_TABS = [
  { id: 'ai' as const, label: 'AI generate', icon: SparklesIcon },
  { id: 'tiktok' as const, label: 'TikTok', icon: TikTokTabIcon },
]

export function SlideshowSourcePanel({
  embedded = false,
  showPanelHeader,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const [mode, setMode] = useState<SourceMode>('ai')
  const panelHeaderVisible = showPanelHeader ?? embedded

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="shrink-0 space-y-2.5 border-b border-border/60 px-3 py-2.5">
        {panelHeaderVisible ? (
          <StudioPanelHeader
            title="Generate"
            description="Create slides with AI or import from TikTok"
          />
        ) : null}
        <StudioSegmentedTabs tabs={SOURCE_TABS} value={mode} onChange={setMode} size="sm" />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-background">
        {mode === 'ai' ? <SlideshowGeneratorPanel embedded /> : <SlideshowTikTokImportPanel embedded />}
      </div>
    </div>
  )
}
