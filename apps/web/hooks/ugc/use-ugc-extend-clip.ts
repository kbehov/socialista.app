'use client'

import { captureVideoLastFrame } from '@/lib/studio/ugc/capture-video-frame'
import { uploadToWorkspace } from '@/services/files.service'
import { extendUgcClip } from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcWorkbenchTab } from '@/types/ugc.types'
import { ugcSceneWorkbenchConfig } from '@/utils/ugc/scene.utils'
import type { UgcClip, UgcProject } from '@socialista/types'
import { useCallback, useState, useTransition } from 'react'
import { toast } from 'sonner'

export function useUgcExtendClip({
  workspaceId,
  project,
  onSelectClip,
  onTabChange,
  onPrimeVideoAttachments,
}: {
  workspaceId: string
  project: UgcProject
  onSelectClip: (clipId: string) => void
  onTabChange: (tab: UgcWorkbenchTab) => void
  onPrimeVideoAttachments?: (clipId: string, urls: string[]) => void
}) {
  const setProject = useUgcProjectStore(s => s.setProject)
  const [extendingClipId, setExtendingClipId] = useState<string | null>(null)
  const [, startExtend] = useTransition()

  const handleExtendClip = useCallback(
    (clip: UgcClip) => {
      if (!clip.videoUrl || extendingClipId) return
      setExtendingClipId(clip.id)
      startExtend(async () => {
        try {
          const frame = await captureVideoLastFrame(clip.videoUrl!)
          const formData = new FormData()
          formData.append(
            'file',
            new File([frame], `ugc-extend-${clip.id}.jpg`, { type: 'image/jpeg' }),
          )
          const upload = await uploadToWorkspace(workspaceId, formData)
          if (!upload.success || !upload.data?.url) {
            toast.error(upload.message ?? "Couldn't read the video frame")
            return
          }

          const previousIds = new Set(project.clips.map(item => item.id))
          const response = await extendUgcClip(project.id, clip.id, {
            lastFrameUrl: upload.data.url,
          })
          if (!response.success || !response.data?.project) {
            toast.error(response.message ?? 'Could not extend scene')
            return
          }

          const nextProject = response.data.project
          setProject(nextProject)
          const created = nextProject.clips.find(item => !previousIds.has(item.id))
          if (created) {
            const lastFrameUrl =
              created.stills.find(still => still.imageUrl)?.imageUrl ??
              upload.data.url
            onPrimeVideoAttachments?.(created.id, [lastFrameUrl])
            onSelectClip(created.id)
            const tabs = ugcSceneWorkbenchConfig(created.type).tabs
            onTabChange(tabs.includes('audio') ? 'audio' : 'video')
          }
          toast.success('Continuation scene ready')
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Couldn't read the video frame",
          )
        } finally {
          setExtendingClipId(null)
        }
      })
    },
    [
      extendingClipId,
      onSelectClip,
      onTabChange,
      onPrimeVideoAttachments,
      project.clips,
      project.id,
      setProject,
      workspaceId,
    ],
  )

  return {
    extendingClipId,
    handleExtendClip,
  }
}
