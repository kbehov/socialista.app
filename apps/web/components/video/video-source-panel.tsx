'use client'

import { useState } from 'react'
import { LinkIcon, UploadIcon } from 'lucide-react'
import { TikTokIcon } from '@/components/icons/tiktok-icon'
import { MediaPool } from '@/components/video/media-pool'
import { VideoUrlImportPanel } from '@/components/video/video-url-import-panel'
import { VideoTikTokImportPanel } from '@/components/video/video-tiktok-import-panel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SourceMode = 'files' | 'url' | 'tiktok'

export function VideoSourcePanel() {
  const [mode, setMode] = useState<SourceMode>('files')

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b bg-muted/15 px-3 py-2.5">
        <div className="flex gap-0.5 rounded-lg border border-border/50 bg-muted/40 p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 flex-1 gap-1 rounded-md px-1.5 text-xs font-medium',
              mode === 'files'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
            )}
            onClick={() => setMode('files')}
            aria-pressed={mode === 'files'}
          >
            <UploadIcon className="size-3.5 shrink-0" />
            Files
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 flex-1 gap-1 rounded-md px-1.5 text-xs font-medium',
              mode === 'url'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
            )}
            onClick={() => setMode('url')}
            aria-pressed={mode === 'url'}
          >
            <LinkIcon className="size-3.5 shrink-0" />
            URL
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 flex-1 gap-1 rounded-md px-1.5 text-xs font-medium',
              mode === 'tiktok'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
            )}
            onClick={() => setMode('tiktok')}
            aria-pressed={mode === 'tiktok'}
          >
            <TikTokIcon className="size-3.5 shrink-0" />
            TikTok
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {mode === 'files' ? (
          <MediaPool embedded />
        ) : mode === 'url' ? (
          <VideoUrlImportPanel embedded />
        ) : (
          <VideoTikTokImportPanel embedded />
        )}
      </div>
    </div>
  )
}
