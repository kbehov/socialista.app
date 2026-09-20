'use client'

import {
  applyUgcCampaignPreset,
  createUgcClip,
  deleteUgcClip,
  duplicateUgcClip,
} from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcCampaignPresetId, UgcClipType, UgcProject } from '@socialista/types'
import { UGC_DEFAULT_CLIP_TYPE, UGC_STARTER_SCENE_TYPES } from '@socialista/types'
import { useCallback, useTransition } from 'react'
import { toast } from 'sonner'

export function useUgcClipActions({
  project,
  onSelectClip,
  patchProjectLocal,
  patchProject,
}: {
  project: UgcProject
  onSelectClip: (clipId: string | undefined) => void
  patchProjectLocal: (patch: Partial<UgcProject>) => void
  patchProject: (payload: { clipOrder: string[] }) => Promise<void>
}) {
  const setProject = useUgcProjectStore(s => s.setProject)
  const [creatingScenes, startCreateScenes] = useTransition()
  const [applyingPreset, startApplyPreset] = useTransition()

  const handleCreateClip = useCallback(
    async (type: UgcClipType = UGC_DEFAULT_CLIP_TYPE) => {
      const response = await createUgcClip(project.id, { type })
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not add scene')
        return
      }
      const created = response.data.project.clips.at(-1)
      setProject(response.data.project)
      if (created) onSelectClip(created.id)
    },
    [onSelectClip, project.id, setProject],
  )

  const handleStarterSequence = useCallback(() => {
    startCreateScenes(async () => {
      for (const type of UGC_STARTER_SCENE_TYPES) {
        const response = await createUgcClip(project.id, { type })
        if (!response.success || !response.data?.project) {
          toast.error(response.message ?? 'Could not add scenes')
          return
        }
        setProject(response.data.project)
        const created = response.data.project.clips.at(-1)
        if (created) onSelectClip(created.id)
      }
    })
  }, [onSelectClip, project.id, setProject])

  const handleApplyPreset = useCallback(
    (presetId: UgcCampaignPresetId) => {
      startApplyPreset(async () => {
        const response = await applyUgcCampaignPreset(project.id, { presetId })
        if (!response.success || !response.data?.project) {
          toast.error(response.message ?? 'Could not apply template')
          return
        }
        setProject(response.data.project)
        const created = response.data.project.clips.at(-1)
        if (created) onSelectClip(created.id)
      })
    },
    [onSelectClip, project.id, setProject],
  )

  const handleDuplicateClip = useCallback(
    (clipId: string) => {
      void duplicateUgcClip(project.id, clipId).then(response => {
        if (!response.success || !response.data?.project) {
          toast.error(response.message ?? 'Could not duplicate scene')
          return
        }
        setProject(response.data.project)
        const created = response.data.project.clips.at(-1)
        if (created) onSelectClip(created.id)
      })
    },
    [onSelectClip, project.id, setProject],
  )

  const handleDeleteClip = useCallback(
    (clipId: string) => {
      void deleteUgcClip(project.id, clipId).then(response => {
        if (!response.success || !response.data?.project) {
          toast.error(response.message ?? 'Could not remove scene')
          return
        }
        setProject(response.data.project)
        onSelectClip(response.data.project.clips[0]?.id)
      })
    },
    [onSelectClip, project.id, setProject],
  )

  const handleReorderClips = useCallback(
    (clipOrder: string[]) => {
      patchProjectLocal({
        clips: clipOrder.flatMap(id => project.clips.filter(clip => clip.id === id)),
      })
      void patchProject({ clipOrder })
    },
    [patchProject, patchProjectLocal, project.clips],
  )

  return {
    creatingScenes,
    applyingPreset,
    handleCreateClip,
    handleStarterSequence,
    handleApplyPreset,
    handleDuplicateClip,
    handleDeleteClip,
    handleReorderClips,
  }
}
