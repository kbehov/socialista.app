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
import { ugcResolvedClipModels, ugcClipRenderDurationSec } from '@socialista/types'

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
  const lipSyncModels = useUgcProjectStore(s => s.lipSyncModels)
  const resolvedModels = ugcResolvedClipModels(project, clip)
  const config = ugcSceneWorkbenchConfig(clip.type)
  const hasAudio = Boolean(clip.audioUrl)
  const audioLockedSec = ugcClipRenderDurationSec(clip, clip.type)

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
                initialModel={resolvedModels.image}
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
                  {config.talkingHead
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
                models={config.talkingHead ? lipSyncModels : videoModels}
                hideExtras
                embedded
                pending={generatingVideo}
                submitDisabled={
                  (config.audioRequiredForVideo && !hasAudio) ||
                  (config.talkingHead && audioLockedSec == null)
                }
                hideDuration={config.talkingHead && audioLockedSec == null}
                hideCost={config.talkingHead && audioLockedSec == null}
                attachSources={config.talkingHead ? ['influencer'] : undefined}
                influencerMediaType={config.talkingHead ? 'image' : undefined}
                maxAttachments={config.talkingHead ? 1 : undefined}
                minAttachments={config.talkingHead ? 1 : undefined}
                costMultiplier={audioLockedSec}
                initialPrompt={clip.directions ?? clip.plannedPrompt}
                initialAttachments={
                  config.talkingHead
                    ? videoAttachments.slice(0, 1)
                    : videoAttachments
                }
                initialModel={
                  config.talkingHead ? clip.models?.video : resolvedModels.video
                }
                initialAspectRatio={project.aspectRatio as VideoAspectRatio}
                initialDuration={audioLockedSec ?? clip.durationSec}
                lockedDurationSec={audioLockedSec}
                initialResolution={project.videoResolution}
                initialGenerateAudio={!clip.audioUrl}
                audioLocked={Boolean(clip.audioUrl) || config.talkingHead}
                placeholder={
                  config.talkingHead
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
