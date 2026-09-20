'use client'

import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import type { ImagePromptSubmitResult } from '@/components/studio/images/prompt-input'
import { UgcProjectEmptyState } from '@/components/studio/ugc/ugc-project-empty-state'
import { UgcSceneHeader } from '@/components/studio/ugc/ugc-scene-header'
import { UgcScenePromptTabs } from '@/components/studio/ugc/ugc-scene-prompt-tabs'
import { UgcSceneTabContent } from '@/components/studio/ugc/ugc-scene-tab-content'
import type { VideoPromptSubmitResult } from '@/components/studio/videos/video-prompt-input'
import { ugcClipGeneratedStills } from '@/lib/studio/ugc/ugc-stage'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcWorkbenchTab } from '@/types/ugc.types'
import { stillUrlsToAttachments, ugcCampaignAttachments } from '@/utils/ugc/attachments.utils'
import { ugcSceneWorkbenchConfig } from '@/utils/ugc/scene.utils'
import type { UgcClip, UgcClipType, UgcClipVoice, UgcProject } from '@socialista/types'
import { useMemo, useState } from 'react'

export type { UgcWorkbenchTab }

type UgcSceneWorkbenchProps = {
  project: UgcProject
  clip?: UgcClip
  tab: UgcWorkbenchTab
  videoAttachments: AttachedMedia[]
  creatingScenes?: boolean
  writingScript?: boolean
  generatingAudio?: boolean
  generatingStill?: boolean
  generatingVideo?: boolean
  stillsProgress?: number
  stillsProgressLabel?: string
  videoProgressLabel?: string
  videoProgress?: number
  busy?: boolean
  onTabChange: (tab: UgcWorkbenchTab) => void
  onTypeChange: (type: UgcClipType) => void
  onAddClip: (type: UgcClipType) => void
  onUseStarter: () => void
  onImageSubmit: (result: ImagePromptSubmitResult) => void
  onVideoSubmit: (result: VideoPromptSubmitResult) => void
  onScriptChange: (text: string) => void
  onWriteScript: () => void
  onVoiceChange: (voice: UgcClipVoice) => void
  onGenerateAudio: (script?: string) => void
  onUseStills: (urls: string[]) => void
  onSelectAudio?: (url: string) => void
  onSelectVideo?: (url: string) => void
  onExtend?: () => void
  extending?: boolean
  onPlan?: () => void
}

export function UgcSceneWorkbench({
  project,
  clip,
  tab,
  videoAttachments,
  creatingScenes,
  writingScript,
  generatingAudio,
  generatingStill,
  generatingVideo,
  stillsProgress,
  stillsProgressLabel,
  videoProgressLabel,
  videoProgress,
  busy,
  onTabChange,
  onTypeChange,
  onAddClip,
  onUseStarter,
  onImageSubmit,
  onVideoSubmit,
  onScriptChange,
  onWriteScript,
  onVoiceChange,
  onGenerateAudio,
  onUseStills,
  onSelectAudio,
  onSelectVideo,
  onExtend,
  extending,
  onPlan,
}: UgcSceneWorkbenchProps) {
  const influencersById = useUgcProjectStore(s => s.influencersById)
  const [selectedStillUrlsState, setSelectedStillUrls] = useState<string[]>([])

  const imageAttachments = useMemo(() => {
    if (!clip) return []
    return ugcCampaignAttachments(project, clip, influencersById)
  }, [clip, influencersById, project])

  const generatedStills = useMemo(
    () => (clip ? ugcClipGeneratedStills(clip, project.productImageUrls) : []),
    [clip, project.productImageUrls],
  )

  const stillUrls = useMemo(
    () =>
      generatedStills.flatMap(still => (still.imageUrl ? [still.imageUrl] : [])),
    [generatedStills],
  )

  const selectedStillUrls = useMemo(() => {
    const kept = selectedStillUrlsState.filter(url => stillUrls.includes(url))
    if (kept.length > 0) return kept
    const newest = stillUrls[0]
    return newest ? [newest] : []
  }, [selectedStillUrlsState, stillUrls])

  const startFrameAttachments = useMemo(() => {
    if (!clip) return videoAttachments
    const stillSet = new Set(stillUrls)
    const hasNonStill = videoAttachments.some(item => !stillSet.has(item.url))
    if (hasNonStill) return videoAttachments
    const selected = ugcSceneWorkbenchConfig(clip.type).talkingHead
      ? selectedStillUrls.slice(0, 1)
      : selectedStillUrls
    if (selected.length === 0) return videoAttachments
    return stillUrlsToAttachments(selected)
  }, [clip, selectedStillUrls, stillUrls, videoAttachments])

  if (!clip) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <UgcProjectEmptyState
          clips={project.clips}
          creating={creatingScenes}
          onPlan={onPlan}
          onUseStarter={onUseStarter}
          onAddClip={onAddClip}
        />
      </div>
    )
  }

  const hasStills = stillUrls.length > 0
  const hasVideo = Boolean(clip.videoUrl)
  const clipIndex = project.clips.findIndex(item => item.id === clip.id)

  const toggleStill = (url: string) => {
    setSelectedStillUrls([url])
  }

  const handleTabChange = (next: UgcWorkbenchTab) => {
    if (next === 'video' && selectedStillUrls.length > 0) {
      onUseStills(selectedStillUrls)
      return
    }
    onTabChange(next)
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <UgcSceneHeader clip={clip} clipIndex={clipIndex} onTypeChange={onTypeChange} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <UgcSceneTabContent
          project={project}
          clip={clip}
          tab={tab}
          generatedStills={generatedStills}
          stillUrls={stillUrls}
          selectedStillUrls={selectedStillUrls}
          videoAttachments={startFrameAttachments}
          generatingStill={generatingStill}
          generatingAudio={generatingAudio}
          generatingVideo={generatingVideo}
          stillsProgress={stillsProgress}
          stillsProgressLabel={stillsProgressLabel}
          videoProgress={videoProgress}
          videoProgressLabel={videoProgressLabel}
          busy={busy}
          onToggleStill={toggleStill}
          onUseStills={onUseStills}
          onSelectAudio={onSelectAudio}
          onSelectVideo={onSelectVideo}
          onExtend={onExtend}
          extending={extending}
        />
      </div>

      <UgcScenePromptTabs
        project={project}
        clip={clip}
        tab={tab}
        imageAttachments={imageAttachments}
        videoAttachments={startFrameAttachments}
        hasStills={hasStills}
        hasVideo={hasVideo}
        writingScript={writingScript}
        generatingAudio={generatingAudio}
        generatingStill={generatingStill}
        generatingVideo={generatingVideo}
        busy={busy}
        onTabChange={handleTabChange}
        onImageSubmit={onImageSubmit}
        onVideoSubmit={onVideoSubmit}
        onScriptChange={onScriptChange}
        onWriteScript={onWriteScript}
        onVoiceChange={onVoiceChange}
        onGenerateAudio={onGenerateAudio}
      />
    </div>
  )
}
