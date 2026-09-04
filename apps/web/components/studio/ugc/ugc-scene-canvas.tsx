'use client'

import { UgcAddSceneMenu } from '@/components/studio/ugc/ugc-add-scene-menu'
import { UgcSceneCard } from '@/components/studio/ugc/ugc-scene-card'
import { UgcStageActionBar } from '@/components/studio/ugc/ugc-stage-action-bar'
import { deriveUgcStage, ugcStageHint } from '@/lib/studio/ugc/ugc-stage'
import { UGC_MAX_CLIPS, type UgcClipType, type UgcProject } from '@socialista/types'
import { PlusIcon } from 'lucide-react'

type UgcSceneCanvasProps = {
  project: UgcProject
  selectedClipId?: string
  creatingScenes?: boolean
  writingScript?: boolean
  generatingStills?: boolean
  generatingVideo?: boolean
  assembling?: boolean
  openingEditor?: boolean
  stillsProgress?: number
  stillsProgressLabel?: string
  videoProgressLabel?: string
  runsByClipId?: Record<string, { progress: number; label: string }>
  onSelectClip: (clipId: string) => void
  onAddClip: (type: UgcClipType) => void
  onUseStarter: () => void
  onWriteScript: () => void
  onGenerateStills: () => void
  onToggleApproved: (clipId: string, approved: boolean) => void
  onApproveAll: () => void
  onRegenerateStill: (clipId: string) => void
  onRegenerateVideo: (clipId: string) => void
  onRenderAd: () => void
  onStitch: () => void
  onOpenEditor: () => void
}

export function UgcSceneCanvas({
  project,
  selectedClipId,
  creatingScenes,
  writingScript,
  generatingStills,
  generatingVideo,
  assembling,
  openingEditor,
  stillsProgress,
  stillsProgressLabel,
  videoProgressLabel,
  runsByClipId,
  onSelectClip,
  onAddClip,
  onUseStarter,
  onWriteScript,
  onGenerateStills,
  onToggleApproved,
  onApproveAll,
  onRegenerateStill,
  onRegenerateVideo,
  onRenderAd,
  onStitch,
  onOpenEditor,
}: UgcSceneCanvasProps) {
  const stage = deriveUgcStage(project)
  const hint = ugcStageHint(project)
  const atLimit = project.clips.length >= UGC_MAX_CLIPS
  const busy = generatingStills || generatingVideo || assembling

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <UgcStageActionBar
          project={project}
          stage={stage}
          hint={hint}
          writingScript={writingScript}
          generatingStills={generatingStills}
          generatingVideo={generatingVideo}
          assembling={assembling}
          openingEditor={openingEditor}
          stillsProgress={stillsProgress}
          stillsProgressLabel={stillsProgressLabel}
          videoProgressLabel={videoProgressLabel}
          onWriteScript={onWriteScript}
          onGenerateStills={onGenerateStills}
          onApproveAll={onApproveAll}
          onRenderAd={onRenderAd}
          onStitch={onStitch}
          onOpenEditor={onOpenEditor}
        />

        {project.clips.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
            <p className="text-[15px] font-medium tracking-tight">Your scenes will appear here</p>
            <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
              Start with a simple three-beat ad, or add scenes one at a time.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={creatingScenes}
                onClick={onUseStarter}
                className="rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition active:scale-[0.98] disabled:opacity-60"
              >
                Use a simple 3-scene ad
              </button>
              <UgcAddSceneMenu
                clips={project.clips}
                creating={creatingScenes}
                align="center"
                onAdd={onAddClip}
                onUseStarter={onUseStarter}
              >
                <button
                  type="button"
                  disabled={creatingScenes}
                  className="rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground ring-1 ring-border/70 transition hover:text-foreground"
                >
                  Add a scene
                </button>
              </UgcAddSceneMenu>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4 sm:p-6 lg:grid-cols-3">
            {project.clips.map((clip, index) => {
              const run = runsByClipId?.[clip.id]
              return (
                <UgcSceneCard
                  key={clip.id}
                  clip={clip}
                  index={index}
                  selected={clip.id === selectedClipId}
                  generating={Boolean(run) || clip.status === 'generating'}
                  busy={busy}
                  run={run}
                  onSelect={() => onSelectClip(clip.id)}
                  onToggleApproved={approved => onToggleApproved(clip.id, approved)}
                  onRegenerateStill={() => onRegenerateStill(clip.id)}
                  onRegenerateVideo={() => onRegenerateVideo(clip.id)}
                />
              )
            })}
            {atLimit ? null : (
              <UgcAddSceneMenu
                clips={project.clips}
                creating={creatingScenes}
                onAdd={onAddClip}
                onUseStarter={onUseStarter}
              >
                <button
                  type="button"
                  disabled={creatingScenes}
                  className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border/70 text-[12px] text-muted-foreground transition hover:border-foreground/30 hover:text-foreground disabled:opacity-40"
                >
                  <PlusIcon className="size-4" strokeWidth={1.5} />
                  Add scene
                </button>
              </UgcAddSceneMenu>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
