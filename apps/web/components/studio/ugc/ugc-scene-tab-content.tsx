'use client'

import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import { ErrorState } from '@/components/common/error-state'
import { UgcAudioTakes } from '@/components/studio/ugc/ugc-audio-player'
import { UgcClipDownloadButton } from '@/components/studio/ugc/ugc-clip-download-button'
import { UgcGenerationStatus } from '@/components/studio/ugc/ugc-generation-status'
import { UgcPhonePreview } from '@/components/studio/ugc/ugc-phone-preview'
import { UgcVideoTakes } from '@/components/studio/ugc/ugc-video-takes'
import {
  UgcAudioEmptyHint,
  UgcStillsEmptyHint,
  UgcStillsGrid,
  UgcVideoEmptyHint,
} from '@/components/studio/ugc/ugc-stills-grid'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { UgcWorkbenchTab } from '@/types/ugc.types'
import { ugcSceneWorkbenchConfig } from '@/utils/ugc/scene.utils'
import type { UgcClip, UgcProject } from '@socialista/types'
import {
  ugcClipAudioTakes,
  ugcClipShowsScript,
  ugcClipVideoTakes,
} from '@socialista/types'
import { UnfoldHorizontalIcon } from 'lucide-react'
import Image from 'next/image'

type UgcSceneTabContentProps = {
  project: UgcProject
  clip: UgcClip
  tab: UgcWorkbenchTab
  generatedStills: ReturnType<
    typeof import('@/lib/studio/ugc/ugc-stage').ugcClipGeneratedStills
  >
  stillUrls: string[]
  selectedStillUrls: string[]
  videoAttachments: AttachedMedia[]
  generatingStill?: boolean
  generatingAudio?: boolean
  generatingVideo?: boolean
  stillsProgress?: number
  stillsProgressLabel?: string
  videoProgress?: number
  videoProgressLabel?: string
  busy?: boolean
  onToggleStill: (url: string) => void
  onUseStills: (urls: string[]) => void
  onSelectAudio?: (url: string) => void
  onSelectVideo?: (url: string) => void
  onExtend?: () => void
  extending?: boolean
}

export function UgcSceneTabContent({
  project,
  clip,
  tab,
  generatedStills,
  stillUrls,
  selectedStillUrls,
  videoAttachments,
  generatingStill,
  generatingAudio,
  generatingVideo,
  stillsProgress,
  stillsProgressLabel,
  videoProgress,
  videoProgressLabel,
  busy,
  onToggleStill,
  onUseStills,
  onSelectAudio,
  onSelectVideo,
  onExtend,
  extending,
}: UgcSceneTabContentProps) {
  const hasStills = stillUrls.length > 0
  const hasVideo = Boolean(clip.videoUrl)
  const config = ugcSceneWorkbenchConfig(clip.type)
  const showsScript = config.tabs.includes('audio') && ugcClipShowsScript(clip.type)
  const audioTakes = ugcClipAudioTakes(clip)
  const videoTakes = ugcClipVideoTakes(clip)
  const hasAudio = Boolean(clip.audioUrl)
  const imageStep = workbenchStepHint('image', config.tabs)
  const audioStep = workbenchStepHint('audio', config.tabs)
  const videoStep = workbenchStepHint('video', config.tabs)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-5 pb-10 lg:px-6 lg:pt-6 lg:pb-12">
      {tab === 'image' ? (
        <>
          {generatingStill ? (
            <UgcGenerationStatus
              kind="still"
              generating
              progress={stillsProgress}
              progressLabel={stillsProgressLabel}
            />
          ) : clip.error ? (
            <ErrorState title="Generation failed" description={clip.error} />
          ) : null}
          {hasStills ? (
            <UgcStillsGrid
              stills={generatedStills}
              selectedUrls={selectedStillUrls}
              generating={generatingStill}
              aspectRatio={project.aspectRatio}
              onToggle={onToggleStill}
              onUseSelected={() => onUseStills(selectedStillUrls)}
            />
          ) : !generatingStill && !clip.error ? (
            <UgcStillsEmptyHint step={imageStep.step} next={imageStep.next} />
          ) : null}
        </>
      ) : null}

      {tab === 'audio' && showsScript ? (
        <>
          {generatingAudio ? (
            <UgcGenerationStatus
              kind="audio"
              generating
              progressLabel="Generating voiceover…"
            />
          ) : null}
          {audioTakes.length > 0 ? (
            <UgcAudioTakes
              takes={audioTakes}
              selectedUrl={clip.audioUrl}
              disabled={busy}
              onSelect={onSelectAudio}
            />
          ) : !generatingAudio ? (
            <UgcAudioEmptyHint
              step={audioStep.step}
              next={audioStep.next}
              title={
                config.voiceoverOnly ? 'Optional voiceover' : 'Write a line of dialogue'
              }
              description={
                config.voiceoverOnly
                  ? 'Add a line to mix over the product clip, or skip and generate video only.'
                  : 'One short line they would say on camera. Generate the voiceover below.'
              }
            />
          ) : null}
        </>
      ) : null}

      {tab === 'video' ? (
        <>
          {generatingVideo ? (
            <UgcGenerationStatus
              kind="video"
              generating
              progress={videoProgress}
              progressLabel={videoProgressLabel}
            />
          ) : clip.error ? (
            <ErrorState title="Generation failed" description={clip.error} />
          ) : null}
          {hasVideo && clip.videoUrl ? (
            <div className="flex min-h-[36svh] flex-col items-center justify-center gap-3">
              <UgcPhonePreview
                key={clip.videoUrl}
                src={clip.videoUrl}
                poster={clip.thumbnailUrl ?? stillUrls[0]}
                aspectRatio={project.aspectRatio}
              />
              <div className="flex items-center justify-center gap-2">
                <UgcClipDownloadButton url={clip.videoUrl} name={clip.name} />
                {onExtend ? (
                  <Button
                    className="h-8 gap-1.5 px-3 text-[12px]"
                    disabled={extending || busy}
                    onClick={onExtend}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {extending ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <UnfoldHorizontalIcon className="size-3.5" />
                    )}
                    Extend
                  </Button>
                ) : null}
              </div>
            </div>
          ) : !generatingVideo && !clip.error ? (
            <>
              <UgcVideoEmptyHint
                step={videoStep.step}
                next={videoStep.next}
                title={
                  config.audioRequiredForVideo && !hasAudio
                    ? 'Voiceover first'
                    : config.talkingHead
                      ? 'Animate the talking head'
                      : 'Describe the motion'
                }
                description={
                  config.audioRequiredForVideo && !hasAudio
                    ? 'Generate the voiceover first, then render the clip.'
                    : config.talkingHead
                      ? 'Use the start-frame photo and voiceover. Attach a creator photo if none is generated yet.'
                      : 'A turn, smile, or product reveal from the start frame. Preview appears here when ready.'
                }
              />
              {hasStills && videoAttachments.length > 0 ? (
                <div className="flex items-center justify-center gap-2">
                  {videoAttachments.slice(0, 1).map(item => (
                    <div
                      key={item.id}
                      className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted"
                    >
                      <Image
                        alt={item.label ?? ''}
                        src={item.url}
                        fill
                        className="object-cover"
                        sizes="44px"
                        unoptimized
                      />
                    </div>
                  ))}
                  <p className="text-[12px] text-muted-foreground">Start frame ready</p>
                </div>
              ) : null}
            </>
          ) : null}
          {videoTakes.length > 1 && !generatingVideo ? (
            <UgcVideoTakes
              takes={videoTakes}
              selectedUrl={clip.videoUrl}
              disabled={busy || generatingVideo}
              aspectRatio={project.aspectRatio}
              onSelect={onSelectVideo}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function workbenchStepHint(tab: UgcWorkbenchTab, tabs: UgcWorkbenchTab[]) {
  const index = tabs.indexOf(tab)
  const step = index >= 0 ? `Step ${index + 1} of ${tabs.length}` : undefined
  const nextTab = index >= 0 ? tabs[index + 1] : undefined
  let next: string | undefined
  if (nextTab === 'audio') next = 'add a voiceover in the Audio tab.'
  else if (nextTab === 'video') next = 'animate the clip in the Video tab.'
  else if (tab === 'video') next = 'when every scene has a video, use Finish up top.'
  return { step, next }
}
