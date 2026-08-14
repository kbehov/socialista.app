'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import type { UgcClip } from '@socialista/types'
import { DownloadIcon, Loader2Icon, PencilIcon, RefreshCwIcon, SendIcon, VideoIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type UgcVideoStageProps = {
  clip?: UgcClip
  generating?: boolean
  openingEditor?: boolean
  onPlannedPromptChange: (value: string) => void
  onRegenerateVideo: (plannedPrompt?: string) => void
  onOpenEditor: () => void
}

export function UgcVideoStage({
  clip,
  generating,
  openingEditor,
  onPlannedPromptChange,
  onRegenerateVideo,
  onOpenEditor,
}: UgcVideoStageProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const videoUrl = clip?.videoUrl
  const planned = clip?.plannedPrompt ?? ''

  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'px-4 py-3')}>
        <h2 className={dashboardSurface.sectionTitle}>Video</h2>
        <p className={dashboardSurface.sectionDescription}>Preview updates as scenes and video finish.</p>
      </div>

      <div className="space-y-3 p-4">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-2xl bg-black shadow-sm ring-1 ring-border/60 sm:max-w-[320px]">
          {videoUrl ? (
            <video className="size-full object-cover" controls playsInline src={videoUrl} poster={clip?.thumbnailUrl} />
          ) : generating ? (
            <div className="flex size-full items-center justify-center text-white/70">
              <Loader2Icon className="size-6 animate-spin" />
            </div>
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1.5 text-white/55">
              <VideoIcon className="size-7" strokeWidth={1.5} />
              <span className="text-[11px]">Your clip will appear here</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
          onClick={() => setShowPrompt(open => !open)}
        >
          {showPrompt ? 'Hide planned prompt' : 'Show planned prompt'}
        </button>

        {showPrompt ? (
          <Textarea
            value={planned}
            onChange={event => onPlannedPromptChange(event.target.value)}
            placeholder="The planner writes this after you generate video. Edit and regenerate to send your version."
            className="min-h-28 text-[12px]"
            disabled={generating}
          />
        ) : null}

        <div className="flex flex-wrap gap-2">
          {videoUrl ? (
            <>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href={videoUrl} download>
                  <DownloadIcon className="size-3.5" />
                  Download
                </a>
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={openingEditor} onClick={onOpenEditor}>
                {openingEditor ? <Loader2Icon className="size-3.5 animate-spin" /> : <PencilIcon className="size-3.5" />}
                Open in editor
              </Button>
              {clip?.generationId ? (
                <Button type="button" size="sm" variant="outline" asChild>
                  <Link href={DASHBOARD_ROUTES.createPost({ generationId: clip.generationId })}>
                    <SendIcon className="size-3.5" />
                    Post
                  </Link>
                </Button>
              ) : null}
            </>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={generating || !clip?.stills.some(still => still.imageUrl)}
            onClick={() => onRegenerateVideo(showPrompt && planned.trim() ? planned : undefined)}
          >
            <RefreshCwIcon className="size-3.5" />
            Redo video
          </Button>
        </div>
      </div>
    </section>
  )
}
