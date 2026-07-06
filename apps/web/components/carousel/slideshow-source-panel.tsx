'use client'

import { useState } from 'react'
import { SparklesIcon } from 'lucide-react'
import { TikTokIcon } from '@/components/icons/tiktok-icon'
import { SlideshowGeneratorPanel } from '@/components/carousel/slideshow-generator-panel'
import { SlideshowTikTokImportPanel } from '@/components/carousel/slideshow-tiktok-import-panel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SourceMode = 'ai' | 'tiktok'

export function SlideshowSourcePanel({ embedded = false }: { embedded?: boolean }) {
  const [mode, setMode] = useState<SourceMode>('ai')

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {embedded ? (
        <div className="shrink-0 space-y-2 border-b px-3 py-2.5">
          <div>
            <p className="text-xs font-semibold tracking-tight">Generate</p>
            <p className="text-[11px] text-muted-foreground">Create slides with AI or import from TikTok</p>
          </div>
        </div>
      ) : null}
      <div className={cn('shrink-0 border-b px-3 py-2.5', embedded ? 'bg-transparent' : 'bg-muted/15')}>
        <div className="flex gap-0.5 rounded-lg border border-border/50 bg-muted/40 p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 flex-1 gap-1.5 rounded-md text-xs font-medium',
              mode === 'ai'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
            )}
            onClick={() => setMode('ai')}
            aria-pressed={mode === 'ai'}
          >
            <SparklesIcon className="size-3.5" />
            AI generate
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 flex-1 gap-1.5 rounded-md text-xs font-medium',
              mode === 'tiktok'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
            )}
            onClick={() => setMode('tiktok')}
            aria-pressed={mode === 'tiktok'}
          >
            <TikTokIcon className="size-3.5" />
            TikTok import
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {mode === 'ai' ? <SlideshowGeneratorPanel embedded /> : <SlideshowTikTokImportPanel embedded />}
      </div>
    </div>
  )
}
