'use client'

import { VideoEditor } from '@/components/video/video-editor'
import { VideoSourcePanel } from '@/components/video/video-source-panel'
import { VideoFormatSelector } from '@/components/video/video-format-selector'
import { VideoSaveBar } from '@/components/video/video-save-bar'
import { VideoIcon } from 'lucide-react'

export function VideoStudio() {
  return (
    <div className="studio-shell flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="studio-header shrink-0 border-b border-border/70 px-0.5 py-1.5">
        <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <VideoIcon className="size-3.5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold tracking-tight">Video editor</h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Import, trim, overlay, and export reels — all in your browser
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2 lg:shrink-0">
            <VideoFormatSelector showLabel={false} className="w-full shrink-0 sm:w-[min(100%,220px)]" />
            <VideoSaveBar showLabel={false} className="min-w-0 flex-1 lg:max-w-xs lg:flex-initial" />
          </div>
        </div>
      </header>

      <div className="studio-workspace grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]">
        <aside className="studio-source-panel flex max-h-[min(280px,28vh)] min-h-0 flex-col overflow-hidden border-b lg:max-h-none lg:border-b-0 lg:border-r">
          <VideoSourcePanel />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-card">
          <VideoEditor />
        </section>
      </div>
    </div>
  )
}
