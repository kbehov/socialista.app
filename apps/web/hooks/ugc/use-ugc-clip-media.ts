'use client'

import { buildCampaignVoicePatches, ugcVoiceEquals } from '@/lib/studio/ugc/voices'
import { updateUgcProject } from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcWorkbenchTab } from '@/types/ugc.types'
import {
  assetImageAttachment,
  clipStillsToAttachments,
  stillUrlsToAttachments,
} from '@/utils/ugc/attachments.utils'
import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import type { UpdateUgcClipPayload, UgcClip, UgcClipVoice, UgcProject } from '@socialista/types'
import {
  ugcClipAudioTakeForUrl,
  ugcClipUsesTalkingHeadModel,
  ugcClipVideoTakeForUrl,
  ugcResolvedClipVoice,
  ugcScriptMaxChars,
} from '@socialista/types'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export function useUgcClipMedia({
  project,
  selectedClip,
  patchClip,
  patchClipLocal,
  patchProjectLocal,
  flushDebounced,
  onTabChange,
}: {
  project: UgcProject
  selectedClip: UgcClip | undefined
  patchClip: (clipId: string, payload: UpdateUgcClipPayload) => Promise<void>
  patchClipLocal: (clipId: string, patch: Partial<UgcClip>) => void
  patchProjectLocal: (patch: Partial<UgcProject>) => void
  flushDebounced: () => void
  onTabChange: (tab: UgcWorkbenchTab) => void
}) {
  const setProject = useUgcProjectStore(s => s.setProject)
  const [pickedVideoAttachments, setPickedVideoAttachments] = useState<{
    clipId: string
    items: AttachedMedia[]
  } | null>(null)

  const rawVideoAttachments =
    selectedClip && pickedVideoAttachments?.clipId === selectedClip.id
      ? pickedVideoAttachments.items
      : clipStillsToAttachments(selectedClip, project.productImageUrls)
  const videoAttachments =
    selectedClip && ugcClipUsesTalkingHeadModel(selectedClip.type)
      ? rawVideoAttachments.slice(0, 1)
      : rawVideoAttachments

  const applyClipAudio = useCallback(
    (url: string) => {
      if (!selectedClip) return
      const take = ugcClipAudioTakeForUrl([selectedClip, ...project.clips], url)
      const text = take?.scriptText?.trim()
      const script = text
        ? { text: text.slice(0, ugcScriptMaxChars(selectedClip.type)), source: 'user' as const }
        : undefined
      const audioDurationSec =
        typeof take?.durationSec === 'number' && take.durationSec > 0
          ? take.durationSec
          : undefined
      flushDebounced()
      patchClipLocal(selectedClip.id, {
        audioUrl: url,
        ...(audioDurationSec != null ? { audioDurationSec } : {}),
        ...(script ? { script } : {}),
      })
      void patchClip(selectedClip.id, {
        audioUrl: url,
        ...(script ? { script } : {}),
      })
      onTabChange('audio')
    },
    [flushDebounced, onTabChange, patchClip, patchClipLocal, project.clips, selectedClip],
  )

  const applyClipVideo = useCallback(
    (url: string) => {
      if (!selectedClip) return
      const take = ugcClipVideoTakeForUrl([selectedClip], url)
      flushDebounced()
      patchClipLocal(selectedClip.id, {
        videoUrl: url,
        ...(take?.thumbnailUrl ? { thumbnailUrl: take.thumbnailUrl } : {}),
      })
      void patchClip(selectedClip.id, { videoUrl: url })
      onTabChange('video')
    },
    [flushDebounced, onTabChange, patchClip, patchClipLocal, selectedClip],
  )

  const persistCampaignVoice = useCallback(
    async (voice: UgcClipVoice, clipId?: string) => {
      const patches = buildCampaignVoicePatches(project, voice, clipId)
      if (patches.skip) return

      patchProjectLocal({ voice: patches.campaignVoice })
      if (clipId && patches.localClipPatch)
        patchClipLocal(clipId, patches.localClipPatch)

      const response = await updateUgcProject(project.id, {
        voice: patches.campaignVoice,
      })
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not save')
        return
      }

      setProject({
        ...response.data.project,
        voice: patches.campaignVoice,
        clips: clipId
          ? response.data.project.clips.map(item =>
              item.id === clipId
                ? {
                    ...item,
                    voice: patches.disableClip
                      ? voice
                      : patches.clearClipOverride
                        ? undefined
                        : item.voice,
                  }
                : item,
            )
          : response.data.project.clips,
      })

      if (clipId && patches.clipPatch) await patchClip(clipId, patches.clipPatch)
    },
    [patchClip, patchClipLocal, patchProjectLocal, project, setProject],
  )

  const applyStillUrls = useCallback(
    (urls: string[]) => {
      if (!selectedClip || urls.length === 0) return
      const nextUrls = ugcClipUsesTalkingHeadModel(selectedClip.type)
        ? urls.slice(0, 1)
        : urls
      const selectedSet = new Set(nextUrls)
      const leading = selectedClip.stills.flatMap(still =>
        still.imageUrl ? [still.imageUrl] : [],
      )
      const alreadyOrdered = nextUrls.every((url, index) => leading[index] === url)
      if (!alreadyOrdered) {
        const picked = nextUrls.map((url, index) => {
          const existing = selectedClip.stills.find(still => still.imageUrl === url)
          return {
            index,
            imageUrl: url,
            generationId: existing?.generationId,
            enhancedPrompt: existing?.enhancedPrompt,
          }
        })
        const rest = selectedClip.stills.filter(
          still => still.imageUrl && !selectedSet.has(still.imageUrl),
        )
        void patchClip(selectedClip.id, {
          stills: [
            ...picked,
            ...rest.map((still, index) => ({
              ...still,
              index: picked.length + index,
            })),
          ],
        })
      }
      setPickedVideoAttachments({
        clipId: selectedClip.id,
        items: stillUrlsToAttachments(nextUrls),
      })
      onTabChange('video')
    },
    [onTabChange, patchClip, selectedClip],
  )

  const applyAssetImage = useCallback(
    (url: string) => {
      if (!selectedClip) return
      setPickedVideoAttachments({
        clipId: selectedClip.id,
        items: [assetImageAttachment(url)],
      })
      onTabChange('video')
    },
    [onTabChange, selectedClip],
  )

  const primeVideoAttachments = useCallback((clipId: string, urls: string[]) => {
    if (urls.length === 0) return
    setPickedVideoAttachments({
      clipId,
      items: stillUrlsToAttachments(urls),
    })
  }, [])

  const handleVoiceChange = useCallback(
    (voice: UgcClipVoice) => {
      if (!selectedClip) return
      if (ugcVoiceEquals(ugcResolvedClipVoice(project, selectedClip), voice)) return
      void persistCampaignVoice(voice, selectedClip.id)
    },
    [persistCampaignVoice, project, selectedClip],
  )

  return {
    videoAttachments,
    applyClipAudio,
    applyClipVideo,
    applyStillUrls,
    applyAssetImage,
    primeVideoAttachments,
    persistCampaignVoice,
    handleVoiceChange,
  }
}
