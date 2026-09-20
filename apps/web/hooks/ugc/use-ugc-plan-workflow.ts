'use client'

import { generateUgcAdPlan } from '@/actions/ugc-plan.actions'
import type { UgcPlanDraft } from '@/types/ugc.types'
import {
  createUgcClip,
  updateUgcClip,
  updateUgcProject,
} from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcAdPlan, UgcProject } from '@socialista/types'
import { UGC_MAX_CLIPS } from '@socialista/types'
import { useCallback, useState, useTransition } from 'react'
import { toast } from 'sonner'

export function useUgcPlanWorkflow({
  project,
  onSelectClip,
}: {
  project: UgcProject
  onSelectClip: (clipId: string) => void
}) {
  const setProject = useUgcProjectStore(s => s.setProject)
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [planSheetOpen, setPlanSheetOpen] = useState(false)
  const [plan, setPlan] = useState<UgcAdPlan | null>(null)
  const [planError, setPlanError] = useState<string | null>(null)
  const [planDraft, setPlanDraft] = useState<UgcPlanDraft | null>(null)
  const [planning, startPlanning] = useTransition()
  const [buildingPlan, startBuildPlan] = useTransition()

  const openPlanDialog = useCallback(() => {
    setPlanDialogOpen(true)
  }, [])

  const handlePlanSubmit = useCallback(
    (draft: UgcPlanDraft) => {
      setPlanDraft(draft)
      setPlan(null)
      setPlanError(null)
      setPlanDialogOpen(false)
      setPlanSheetOpen(true)
      startPlanning(async () => {
        const result = await generateUgcAdPlan({
          influencerId: draft.influencerId,
          description: draft.description,
          product: draft.product,
        })
        if (!result.success) {
          setPlanError(result.error)
          return
        }
        setPlan(result.plan)
      })
    },
    [],
  )

  const handleBuildPlan = useCallback(() => {
    if (!plan || !planDraft) return
    const remaining = UGC_MAX_CLIPS - project.clips.length
    if (plan.scenes.length > remaining) {
      toast.error(
        remaining === 0
          ? 'This ad already has the maximum number of scenes'
          : `Only ${remaining} scene slot${remaining === 1 ? '' : 's'} left`,
      )
      return
    }

    startBuildPlan(async () => {
      const product = planDraft.product
      const campaignRes = await updateUgcProject(project.id, {
        influencerId: planDraft.influencerId,
        productImageUrls: product.imageUrls,
        productName: product.productName,
        productId: product.productId,
        productDescription: product.productDescription ?? null,
        productUrl: product.productUrl ?? null,
        productKind: product.productKind ?? null,
      })
      if (!campaignRes.success || !campaignRes.data?.project) {
        toast.error(campaignRes.message ?? 'Could not save campaign')
        return
      }

      let latest = campaignRes.data.project
      setProject(latest)
      let firstNewId: string | undefined

      for (const scene of plan.scenes) {
        const createdRes = await createUgcClip(latest.id, {
          type: scene.type,
          name: scene.name,
          durationSec: scene.durationSec,
          influencerId: planDraft.influencerId,
        })
        if (!createdRes.success || !createdRes.data?.project) {
          toast.error(createdRes.message ?? 'Could not create scene')
          setProject(latest)
          return
        }
        latest = createdRes.data.project
        const created = latest.clips.at(-1)
        if (!created) continue
        firstNewId ??= created.id

        const updatedRes = await updateUgcClip(latest.id, created.id, {
          script: { text: scene.script, source: 'ai' },
          directions: scene.videoPrompt,
          plannedPrompt: scene.videoPrompt,
          imagePrompt: scene.imagePrompt,
          scenePrompt: scene.imagePrompt,
          durationSec: scene.durationSec,
        })
        if (!updatedRes.success || !updatedRes.data?.project) {
          toast.error(updatedRes.message ?? 'Could not apply the plan')
          setProject(latest)
          return
        }
        latest = updatedRes.data.project
      }

      setProject(latest)
      if (firstNewId) onSelectClip(firstNewId)
      setPlanSheetOpen(false)
      setPlan(null)
      toast.success('Scenes are ready. Generate photos when they look right.')
    })
  }, [onSelectClip, plan, planDraft, project.clips.length, project.id, setProject])

  return {
    planDialogOpen,
    setPlanDialogOpen,
    planSheetOpen,
    setPlanSheetOpen,
    plan,
    planError,
    planDraft,
    planning,
    buildingPlan,
    openPlanDialog,
    handlePlanSubmit,
    handleBuildPlan,
  }
}
