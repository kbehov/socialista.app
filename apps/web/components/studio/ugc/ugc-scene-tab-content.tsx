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
import type { UgcWorkbenchTab } from '@/types/ugc.types'
import { ugcSceneWorkbenchConfig } from '@/utils/ugc/scene.utils'
import type { UgcClip, UgcProject } from '@socialista/types'
import {
  ugcClipAudioTakes,
  ugcClipShowsScript,
  ugcClipVideoTakes,
} from '@socialista/types'
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
}: UgcSceneTabContentProps) {
  const hasStills = stillUrls.length > 0
  const hasVideo = Boolean(clip.videoUrl)
  const config = ugcSceneWorkbenchConfig(clip.type)
  const showsScript = config.tabs.includes('audio') && ugcClipShowsScript(clip.type)
  const audioTakes = ugcClipAudioTakes(clip)
  const videoTakes = ugcClipVideoTakes(clip)
  const hasAudio = Boolean(clip.audioUrl)

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
            <UgcStillsEmptyHint />
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
              <UgcClipDownloadButton url={clip.videoUrl} name={clip.name} />
            </div>
          ) : !generatingVideo && !clip.error ? (
            <>
              <UgcVideoEmptyHint
                title={
                  config.audioRequiredForVideo && !hasAudio
                    ? 'Voiceover first'
                    : config.videoModelLocked
                      ? 'Animate the talking head'
                      : 'Describe the motion'
                }
                description={
                  config.audioRequiredForVideo && !hasAudio
                    ? 'Generate the voiceover first, then render the clip.'
                    : config.videoModelLocked
                      ? 'Use the start-frame photo and voiceover. Attach a creator photo if none is generated yet.'
                      : 'A turn, smile, or product reveal from the start frame. Preview appears here when ready.'
                }
              />
              {hasStills && videoAttachments.length > 0 ? (
                <div className="flex items-center justify-center gap-2">
                  {videoAttachments.map(item => (
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
