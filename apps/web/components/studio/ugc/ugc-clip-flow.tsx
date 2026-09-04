'use client'

import { UgcCampaignStrip } from '@/components/studio/ugc/ugc-campaign-strip'
import { UgcFlowStep } from '@/components/studio/ugc/ugc-flow-step'
import { UgcPhotosComposer } from '@/components/studio/ugc/ugc-photos-composer'
import { UgcScriptComposer } from '@/components/studio/ugc/ugc-script-composer'
import { UgcVideoComposer } from '@/components/studio/ugc/ugc-video-composer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  AspectRatio,
  UgcClip,
  UgcClipType,
  UgcProject,
} from '@socialista/types'
import { UGC_CLIP_TYPE_LABELS, UGC_CLIP_TYPES, ugcClipShowsScript } from '@socialista/types'

export type ClipRunProgress = {
  pipeline: 'stills' | 'video'
  progress: number
  progressLabel: string
}

type UgcClipFlowProps = {
  workspaceId: string
  project: UgcProject
  clip: UgcClip
  writingScript?: boolean
  openingEditor?: boolean
  run?: ClipRunProgress
  onSelectType: (type: UgcClipType) => void
  onProductChange: (next: {
    imageUrls: string[]
    productName?: string
    productId?: string | null
  }) => void
  onInfluencerChange: (ids: string[]) => void
  onGenerateStills: (input: {
    prompt: string
    imageUrls: string[]
    modelValue: string
    aspectRatio: AspectRatio
  }) => void
  onRegenerateStill: (index: number) => void
  onScriptChange: (text: string) => void
  onWriteWithAi: (modelValue?: string) => void
  onGenerateVideo: (input: {
    prompt: string
    durationSec: number
    modelValue: string
    skipPlanner: boolean
  }) => void
  onOpenEditor: () => void
}

export function UgcClipFlow({
  workspaceId,
  project,
  clip,
  writingScript,
  openingEditor,
  run,
  onSelectType,
  onProductChange,
  onInfluencerChange,
  onGenerateStills,
  onRegenerateStill,
  onScriptChange,
  onWriteWithAi,
  onGenerateVideo,
  onOpenEditor,
}: UgcClipFlowProps) {
  const hasStills = clip.stills.some(still => still.imageUrl)
  const hasScript = Boolean(clip.script?.text.trim())
  const hasVideo = Boolean(clip.videoUrl)
  const showsScript = ugcClipShowsScript(clip.type)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={clip.type} onValueChange={value => onSelectType(value as UgcClipType)}>
          <SelectTrigger className="h-8 w-[220px] rounded-xl text-[13px]">
            <SelectValue placeholder="Scene type" />
          </SelectTrigger>
          <SelectContent>
            {UGC_CLIP_TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {UGC_CLIP_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <UgcCampaignStrip
        workspaceId={workspaceId}
        project={project}
        disabled={clip.status === 'generating'}
        onProductChange={onProductChange}
        onInfluencerChange={onInfluencerChange}
      />

      <UgcFlowStep title="Photos" description="One photo per scene." done={hasStills} defaultOpen>
        <UgcPhotosComposer
          key={`${clip.id}-photos`}
          workspaceId={workspaceId}
          project={project}
          clip={clip}
          generating={run?.pipeline === 'stills'}
          progress={run?.pipeline === 'stills' ? run.progress : undefined}
          progressLabel={run?.pipeline === 'stills' ? run.progressLabel : undefined}
          onGenerate={onGenerateStills}
          onRegenerateStill={onRegenerateStill}
        />
      </UgcFlowStep>

      {showsScript ? (
        <UgcFlowStep
          title="Script"
          description="Write the line. We’ll use it for motion."
          done={hasScript}
          defaultOpen={!hasScript}
        >
          <UgcScriptComposer
            key={`${clip.id}-script`}
            project={project}
            clip={clip}
            writing={writingScript}
            onScriptChange={onScriptChange}
            onWriteWithAi={onWriteWithAi}
          />
        </UgcFlowStep>
      ) : null}

      <UgcFlowStep
        title="Video"
        description="Animate the photo. Leave the prompt blank to plan motion."
        done={hasVideo}
        defaultOpen={hasStills || hasVideo}
      >
        <UgcVideoComposer
          key={`${clip.id}-video`}
          workspaceId={workspaceId}
          project={project}
          clip={clip}
          generating={run?.pipeline === 'video'}
          openingEditor={openingEditor}
          progress={run?.pipeline === 'video' ? run.progress : undefined}
          progressLabel={run?.pipeline === 'video' ? run.progressLabel : undefined}
          onGenerate={onGenerateVideo}
          onOpenEditor={onOpenEditor}
        />
      </UgcFlowStep>
    </div>
  )
}
