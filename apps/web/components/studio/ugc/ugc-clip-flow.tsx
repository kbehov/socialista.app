'use client'

import { UgcCampaignStrip } from '@/components/studio/ugc/ugc-campaign-strip'
import { UgcFlowStep } from '@/components/studio/ugc/ugc-flow-step'
import { UgcImageAdComposer } from '@/components/studio/ugc/ugc-image-ad-composer'
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
  UgcClipVoice,
  UgcProject,
  UgcSceneCount,
} from '@socialista/types'
import { UGC_CLIP_TYPE_LABELS, UGC_CLIP_TYPES, ugcClipShowsScript } from '@socialista/types'

export type ClipRunProgress = {
  pipeline: 'stills' | 'video' | 'image-ad'
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
    sceneCount: UgcSceneCount
    imageUrls: string[]
    modelValue: string
    aspectRatio: AspectRatio
  }) => void
  onRegenerateStill: (index: number) => void
  onUseAsStartFrame: (index: number) => void
  onScriptChange: (text: string) => void
  onWriteWithAi: (modelValue?: string) => void
  onVoiceChange: (voice: UgcClipVoice) => void
  onGenerateVideo: (input: {
    prompt: string
    durationSec: number
    modelValue: string
    skipPlanner: boolean
  }) => void
  onOpenEditor: () => void
  onGenerateImageAd: (input: {
    prompt?: string
    language: string
    aspectRatio: AspectRatio
    productImage: string
  }) => void
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
  onUseAsStartFrame,
  onScriptChange,
  onWriteWithAi,
  onVoiceChange,
  onGenerateVideo,
  onOpenEditor,
  onGenerateImageAd,
}: UgcClipFlowProps) {
  const hasStills = clip.stills.some(still => still.imageUrl)
  const hasScript = Boolean(clip.script?.text.trim())
  const hasVideo = Boolean(clip.videoUrl)
  const hasImageAd = Boolean(clip.imageAdUrl)
  const showsScript = ugcClipShowsScript(clip.type)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={clip.type} onValueChange={value => onSelectType(value as UgcClipType)}>
          <SelectTrigger className="h-8 w-[220px] rounded-xl text-[13px]">
            <SelectValue placeholder="Clip type" />
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

      <UgcFlowStep
        title="Photos"
        description="Generate scene stills. Photo 1 is the video start frame."
        done={hasStills}
        defaultOpen
      >
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
          onUseAsStartFrame={onUseAsStartFrame}
        />
      </UgcFlowStep>

      {showsScript ? (
        <UgcFlowStep
          title="Script"
          description="Write the line, then pick a voice."
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
            onVoiceChange={onVoiceChange}
          />
        </UgcFlowStep>
      ) : null}

      <UgcFlowStep
        title="Video"
        description="Animate the start frame. Leave the prompt blank to auto-plan motion."
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

      <UgcFlowStep
        title="Image ad"
        description="Optional static companion for the same product and creator."
        done={hasImageAd}
        defaultOpen={false}
      >
        <UgcImageAdComposer
          key={`${clip.id}-image-ad`}
          workspaceId={workspaceId}
          project={project}
          clip={clip}
          generating={run?.pipeline === 'image-ad'}
          progress={run?.pipeline === 'image-ad' ? run.progress : undefined}
          progressLabel={run?.pipeline === 'image-ad' ? run.progressLabel : undefined}
          onGenerate={onGenerateImageAd}
        />
      </UgcFlowStep>
    </div>
  )
}
