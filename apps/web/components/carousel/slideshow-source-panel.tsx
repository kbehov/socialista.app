'use client'

import { useState } from 'react'
import { SparklesIcon } from 'lucide-react'
import { TikTokIcon } from '@/components/icons/tiktok-icon'
import { SlideshowGeneratorPanel } from '@/components/carousel/slideshow-generator-panel'
import { SlideshowTikTokImportPanel } from '@/components/carousel/slideshow-tiktok-import-panel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SourceMode = 'ai' | 'tiktok'

export function SlideshowSourcePanel() {
  const [mode, setMode] = useState<SourceMode>('ai')

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <div className="flex shrink-0 gap-1 rounded-lg border bg-muted/30 p-1">
        <Button
          type="button"
          variant={mode === 'ai' ? 'secondary' : 'ghost'}
          size="sm"
          className={cn('h-8 flex-1 gap-1.5 text-xs', mode === 'ai' && 'shadow-sm')}
          onClick={() => setMode('ai')}
        >
          <SparklesIcon className="size-3.5" />
          AI generate
        </Button>
        <Button
          type="button"
          variant={mode === 'tiktok' ? 'secondary' : 'ghost'}
          size="sm"
          className={cn('h-8 flex-1 gap-1.5 text-xs', mode === 'tiktok' && 'shadow-sm')}
          onClick={() => setMode('tiktok')}
        >
          <TikTokIcon className="size-3.5" />
          TikTok import
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {mode === 'ai' ? <SlideshowGeneratorPanel /> : <SlideshowTikTokImportPanel />}
      </div>
    </div>
  )
}
