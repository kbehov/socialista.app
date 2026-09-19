'use client'

import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import {
  ImagePromptInput,
  type ImagePromptSubmitResult,
} from '@/components/studio/images/prompt-input'
import { STUDIO_UGC_COMPOSER_SHELL_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { UgcAudioPromptInput } from '@/components/studio/ugc/ugc-audio-prompt-input'
import { UgcPromptModeTabs } from '@/components/studio/ugc/ugc-prompt-mode-tabs'
import {
  VideoPromptInput,
  type VideoPromptSubmitResult,
} from '@/components/studio/videos/video-prompt-input'
import { cn } from '@/lib/utils'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcWorkbenchTab } from '@/types/ugc.types'
import { ugcSceneWorkbenchConfig } from '@/utils/ugc/scene.utils'
import type { AspectRatio, UgcClip, UgcClipVoice, UgcProject, VideoAspectRatio } from '@socialista/types'
import {
  clampUgcDuration,
  ugcResolvedClipModels,
  ugcTalkingHeadModel,
} from '@socialista/types'

const TALKING_HEAD_MODELS = [ugcTalkingHeadModel()]

type UgcScenePromptTabsProps = {
  project: UgcProject
  clip: UgcClip
  tab: UgcWorkbenchTab
  imageAttachments: AttachedMedia[]
  videoAttachments: AttachedMedia[]
  hasStills: boolean
  hasVideo: boolean
  writingScript?: boolean
  generatingAudio?: boolean
  generatingStill?: boolean
  generatingVideo?: boolean
  busy?: boolean
  onTabChange: (tab: UgcWorkbenchTab) => void
  onImageSubmit: (result: ImagePromptSubmitResult) => void
  onVideoSubmit: (result: VideoPromptSubmitResult) => void
  onScriptChange: (text: string) => void
  onWriteScript: () => void
  onVoiceChange: (voice: UgcClipVoice) => void
  onGenerateAudio: (script?: string) => void
}

export function UgcScenePromptTabs({
  project,
  clip,
  tab,
  imageAttachments,
  videoAttachments,
  hasStills,
  hasVideo,
  writingScript,
  generatingAudio,
  generatingStill,
  generatingVideo,
  busy,
  onTabChange,
  onImageSubmit,
  onVideoSubmit,
  onScriptChange,
  onWriteScript,
  onVoiceChange,
  onGenerateAudio,
}: UgcScenePromptTabsProps) {
  const imageModels = useUgcProjectStore(s => s.imageModels)
  const videoModels = useUgcProjectStore(s => s.videoModels)
  const resolvedImageModel = ugcResolvedClipModels(project, clip).image
  const config = ugcSceneWorkbenchConfig(clip.type)
  const hasAudio = Boolean(clip.audioUrl)
  const talkingHeadDuration = clampUgcDuration(
    clip.audioDurationSec ?? clip.durationSec,
  )

  return (
    <div className="relative shrink-0">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-background via-background/90 to-transparent" />
      <div className="border-t border-black/[0.06] bg-background px-4 pt-2.5 pb-3 dark:border-white/[0.08] sm:px-5 lg:px-6 lg:pb-4">
        <div className={cn('mx-auto w-full max-w-3xl', STUDIO_UGC_COMPOSER_SHELL_CLASS)}>
          <div className="border-b border-border/35 bg-muted/8 px-3 py-2 sm:px-3.5">
            <UgcPromptModeTabs value={tab} onChange={onTabChange} tabs={config.tabs} />
          </div>

          <div className="min-w-0 [&_.image-studio-prompt]:contents [&_.video-studio-prompt]:contents">
            <div
              className={cn(tab === 'image' ? 'contents' : 'hidden')}
              aria-hidden={tab !== 'image'}
            >
              <ImagePromptInput
                key={`${clip.id}-image`}
                models={imageModels}
                hideExtras
                embedded
                pending={generatingStill}
                initialPrompt={clip.imagePrompt}
                initialAttachments={imageAttachments}
                initialAspectRatio={project.aspectRatio as AspectRatio}
                initialModel={resolvedImageModel}
                placeholder="Describe the scene photo…"
                onSubmitOverride={onImageSubmit}
              />
            </div>

            {config.tabs.includes('audio') ? (
              <div
                className={cn(tab === 'audio' ? 'contents' : 'hidden')}
                aria-hidden={tab !== 'audio'}
              >
                <UgcAudioPromptInput
                  project={project}
                  clip={clip}
                  embedded
                  writingScript={writingScript}
                  generatingAudio={generatingAudio}
                  busy={busy || generatingStill || generatingVideo}
                  onScriptChange={onScriptChange}
                  onWriteScript={onWriteScript}
                  onVoiceChange={onVoiceChange}
                  onGenerateAudio={onGenerateAudio}
                />
              </div>
            ) : null}

            <div
              className={cn(tab === 'video' ? 'contents' : 'hidden')}
              aria-hidden={tab !== 'video'}
            >
              {!hasStills && !hasVideo ? (
                <div className="border-b border-border/35 bg-muted/12 px-3 py-2 text-[12px] leading-snug text-muted-foreground sm:px-3.5">
                  {config.videoModelLocked
                    ? 'Attach a creator photo or generate one first, then animate it here.'
                    : 'Attach a photo or generate one first, then animate it here.'}
                </div>
              ) : null}
              {config.voiceoverOnly && hasAudio ? (
                <div className="border-b border-border/35 bg-muted/12 px-3 py-2 text-[12px] leading-snug text-muted-foreground sm:px-3.5">
                  Voiceover will be mixed over the clip. The product stays silent on camera.
                </div>
              ) : null}
              <VideoPromptInput
                key={`${clip.id}-video-${clip.audioUrl ? 'vo' : 'gen'}`}
                models={config.videoModelLocked ? TALKING_HEAD_MODELS : videoModels}
                hideExtras
                embedded
                pending={generatingVideo}
                submitDisabled={config.audioRequiredForVideo && !hasAudio}
                modelLocked={config.videoModelLocked}
                hideSettings={config.videoModelLocked}
                attachSources={config.videoModelLocked ? ['influencer'] : undefined}
                maxAttachments={config.videoModelLocked ? 1 : undefined}
                minAttachments={config.videoModelLocked ? 1 : undefined}
                costMultiplier={
                  config.videoModelLocked ? talkingHeadDuration : undefined
                }
                initialPrompt={clip.directions ?? clip.plannedPrompt}
                initialAttachments={
                  config.videoModelLocked
                    ? videoAttachments.slice(0, 1)
                    : videoAttachments
                }
                initialAspectRatio={project.aspectRatio as VideoAspectRatio}
                initialDuration={talkingHeadDuration}
                initialResolution={project.videoResolution}
                initialGenerateAudio={!clip.audioUrl}
                audioLocked={Boolean(clip.audioUrl) || config.videoModelLocked}
                placeholder={
                  config.videoModelLocked
                    ? 'Describe delivery — gaze, emotion, small head movement…'
                    : 'Describe the video motion…'
                }
                onSubmitOverride={onVideoSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
