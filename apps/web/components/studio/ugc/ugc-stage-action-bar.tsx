'use client'

import { Button } from '@/components/ui/button'
import { clipHasStill, type UgcStage } from '@/lib/studio/ugc/ugc-stage'
import type { UgcProject } from '@socialista/types'
import { CheckIcon, DownloadIcon, Loader2Icon, PencilIcon, RefreshCwIcon, SparklesIcon } from 'lucide-react'

type UgcStageActionBarProps = {
  project: UgcProject
  stage: UgcStage
  hint?: string
  writingScript?: boolean
  generatingStills?: boolean
  generatingVideo?: boolean
  assembling?: boolean
  openingEditor?: boolean
  stillsProgress?: number
  stillsProgressLabel?: string
  videoProgressLabel?: string
  onWriteScript: () => void
  onGenerateStills: () => void
  onApproveAll: () => void
  onRenderAd: () => void
  onStitch: () => void
  onOpenEditor: () => void
}

export function UgcStageActionBar({
  project,
  stage,
  hint,
  writingScript,
  generatingStills,
  generatingVideo,
  assembling,
  openingEditor,
  stillsProgress,
  stillsProgressLabel,
  videoProgressLabel,
  onWriteScript,
  onGenerateStills,
  onApproveAll,
  onRenderAd,
  onStitch,
  onOpenEditor,
}: UgcStageActionBarProps) {
  const readyCount = project.clips.filter(clipHasStill).length
  const missingVideos = project.clips.filter(clip => clip.approved && clipHasStill(clip) && !clip.videoUrl)
  const busy = generatingStills || generatingVideo || assembling
  const blocksGenerate = Boolean(hint) && (stage === 'stills' || stage === 'video' || stage === 'setup')
  const subtitle =
    hint && (stage === 'setup' || stage === 'stills' || stage === 'video')
      ? hint
      : stageDescription(stage, stillsProgressLabel, videoProgressLabel, assembling)

  return (
    <div className="sticky top-0 z-10 border-b border-border/40 bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium tracking-tight">{stageTitle(stage)}</p>
          <p className="text-[12px] text-muted-foreground">
            {subtitle}
            {generatingStills && stillsProgress ? ` · ${Math.round(stillsProgress)}%` : ''}
          </p>
        </div>
        {stage === 'setup' ? null : stage === 'script' ? (
          <Button type="button" size="sm" disabled={writingScript} onClick={onWriteScript}>
            {writingScript ? <Loader2Icon className="size-3.5 animate-spin" /> : <SparklesIcon className="size-3.5" />}
            Write script
          </Button>
        ) : stage === 'stills' ? (
          <Button
            type="button"
            size="sm"
            disabled={blocksGenerate || generatingStills || project.clips.length === 0}
            onClick={onGenerateStills}
          >
            {generatingStills ? <Loader2Icon className="size-3.5 animate-spin" /> : <SparklesIcon className="size-3.5" />}
            {readyCount > 0 ? 'Regenerate all photos' : 'Generate photos'}
          </Button>
        ) : stage === 'review' ? (
          <Button type="button" size="sm" variant="outline" onClick={onApproveAll}>
            <CheckIcon className="size-3.5" />
            Approve all
          </Button>
        ) : stage === 'video' ? (
          <Button type="button" size="sm" disabled={busy || blocksGenerate} onClick={onRenderAd}>
            {busy ? <Loader2Icon className="size-3.5 animate-spin" /> : <SparklesIcon className="size-3.5" />}
            {generatingVideo
              ? (videoProgressLabel ?? 'Rendering…')
              : assembling
                ? 'Stitching…'
                : missingVideos.length > 0
                  ? 'Render ad'
                  : 'Stitch into one video'}
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            {project.assembledVideoUrl ? (
              <Button type="button" size="sm" variant="outline" asChild>
                <a href={project.assembledVideoUrl} download>
                  <DownloadIcon className="size-3.5" />
                  Download
                </a>
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="outline" disabled={openingEditor} onClick={onOpenEditor}>
              {openingEditor ? <Loader2Icon className="size-3.5 animate-spin" /> : <PencilIcon className="size-3.5" />}
              Edit ad
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onStitch}>
              {assembling ? <Loader2Icon className="size-3.5 animate-spin" /> : <RefreshCwIcon className="size-3.5" />}
              Stitch again
            </Button>
          </div>
        )}
      </div>
      {stage === 'done' && project.assembledVideoUrl ? (
        <div className="relative mx-auto mt-4 aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-2xl bg-black ring-1 ring-border/50">
          <video className="size-full object-cover" controls playsInline src={project.assembledVideoUrl} />
        </div>
      ) : null}
    </div>
  )
}

function stageTitle(stage: UgcStage): string {
  switch (stage) {
    case 'setup':
      return 'Set up the ad'
    case 'script':
      return 'Write the lines'
    case 'stills':
      return 'Make the photos'
    case 'review':
      return 'Approve the photos'
    case 'video':
      return 'Render the ad'
    case 'done':
      return 'Ad ready'
  }
}

function stageDescription(
  stage: UgcStage,
  stillsProgressLabel?: string,
  videoProgressLabel?: string,
  assembling?: boolean,
): string {
  switch (stage) {
    case 'setup':
      return 'Add a product and scenes to begin.'
    case 'script':
      return 'One line per talking scene, or write them all at once.'
    case 'stills':
      return stillsProgressLabel ?? 'One photo per scene. We keep the look consistent.'
    case 'review':
      return 'Tap the check on a scene to keep it.'
    case 'video':
      if (assembling) return 'Stitching scenes into one video…'
      return videoProgressLabel ?? 'We’ll animate each approved photo, then stitch them.'
    case 'done':
      return 'Download it, or open it in the editor.'
  }
}
