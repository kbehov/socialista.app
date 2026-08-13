'use client'

import { PageHeader } from '@/components/headers/page-header'
import { UgcGenerateBar } from '@/components/studio/ugc/ugc-generate-bar'
import { UgcInfluencerPicker } from '@/components/studio/ugc/ugc-influencer-picker'
import { UgcModelChips } from '@/components/studio/ugc/ugc-model-chips'
import { UgcProductInput } from '@/components/studio/ugc/ugc-product-input'
import { UgcSceneStrip } from '@/components/studio/ugc/ugc-scene-strip'
import { UgcScriptPanel } from '@/components/studio/ugc/ugc-script-panel'
import { UgcVideoStage } from '@/components/studio/ugc/ugc-video-stage'
import { Input } from '@/components/ui/input'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
import { useGenerationRun } from '@/hooks/use-generation-run'
import { parseGenerationStatus } from '@/lib/image-generation/run-utils'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { getInfluencer } from '@/services/influencer.service'
import {
  generateUgcScript,
  generateUgcStills,
  generateUgcVideos,
  getUgcProject,
  openUgcVariantEditor,
  regenerateUgcStill,
  regenerateUgcVideo,
  updateUgcProject,
} from '@/services/ugc-project.service'
import type { Influencer, Model, Product, UgcProject, UgcSceneCount, UpdateUgcProjectPayload } from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

type UgcProjectWorkspaceProps = {
  workspaceId: string
  initialProject: UgcProject
  imageModels: Model[]
  scriptModels: Model[]
  videoModels: Model[]
  products: Product[]
  productsTruncated?: boolean
}

function UgcRunWatcher({
  runId,
  accessToken,
  onProgress,
  onSettled,
}: {
  runId: string
  accessToken: string
  onProgress: (progress: number, label: string) => void
  onSettled: () => void
}) {
  const { run } = useGenerationRun({ runId, accessToken })
  const settledRef = useRef(false)

  useEffect(() => {
    const status = parseGenerationStatus(run?.metadata)
    onProgress(status.progress, status.label)
  }, [onProgress, run?.metadata])

  useEffect(() => {
    const status = run?.status
    if (!status || settledRef.current) return
    if (COMPLETED_STATUSES.has(status) || FAILED_STATUSES.has(status)) {
      settledRef.current = true
      onSettled()
    }
  }, [onSettled, run?.status])

  return null
}

export function UgcProjectWorkspace({
  workspaceId,
  initialProject,
  imageModels,
  scriptModels,
  videoModels,
  products,
  productsTruncated,
}: UgcProjectWorkspaceProps) {
  const router = useRouter()
  const [project, setProject] = useState(initialProject)
  const [influencersById, setInfluencersById] = useState<Record<string, Influencer>>({})
  const [runId, setRunId] = useState<string | null>(project.stillsRunId ?? project.videoRunId ?? null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('Generating…')
  const [writingScript, startWriteScript] = useTransition()
  const [openingEditor, startOpenEditor] = useTransition()
  const [plannedPromptDraft, setPlannedPromptDraft] = useState(project.variants[0]?.plannedPrompt ?? '')
  const saveTimer = useRef<number | null>(null)

  const generating = project.status === 'generating'
  const activeVariant = project.variants[0]

  useEffect(() => {
    let cancelled = false
    void Promise.all(project.influencerIds.map(id => getInfluencer(id))).then(results => {
      if (cancelled) return
      setInfluencersById(current => {
        const next = { ...current }
        for (const result of results) {
          const influencer = result.data?.influencer
          if (influencer) next[influencer._id] = influencer
        }
        return next
      })
    })
    return () => {
      cancelled = true
    }
  }, [project.influencerIds])

  const refreshProject = useCallback(async () => {
    const response = await getUgcProject(project.id)
    if (response.success && response.data?.project) {
      setProject(response.data.project)
      const planned = response.data.project.variants[0]?.plannedPrompt
      if (planned) setPlannedPromptDraft(planned)
    }
  }, [project.id])

  useEffect(() => {
    if (project.status !== 'generating') return
    const interval = window.setInterval(() => {
      void refreshProject()
    }, 2500)
    return () => window.clearInterval(interval)
  }, [project.status, refreshProject])

  const patch = useCallback(
    async (payload: UpdateUgcProjectPayload) => {
      const response = await updateUgcProject(project.id, payload)
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not save')
        return
      }
      setProject(response.data.project)
    },
    [project.id],
  )

  const schedulePatch = useCallback(
    (payload: UpdateUgcProjectPayload) => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(() => {
        void patch(payload)
      }, 400)
    },
    [patch],
  )

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [])

  const startRun = useCallback(
    (handle: { project: UgcProject; runId: string; publicAccessToken: string }) => {
      storeGenerationAccessToken(handle.runId, handle.publicAccessToken)
      setProject(handle.project)
      setRunId(handle.runId)
      setAccessToken(handle.publicAccessToken)
      setProgress(8)
      setProgressLabel('Starting…')
    },
    [],
  )

  const handleGenerateStills = async () => {
    const response = await generateUgcStills(project.id)
    if (!response.success || !response.data) {
      toast.error(response.message ?? 'Could not generate scenes')
      return
    }
    startRun(response.data)
  }

  const handleGenerateVideo = async () => {
    const edited = plannedPromptDraft.trim()
    const response = await generateUgcVideos(
      project.id,
      edited && edited !== (activeVariant?.plannedPrompt ?? '')
        ? { plannedPrompt: edited, skipPlanner: true }
        : {},
    )
    if (!response.success || !response.data) {
      toast.error(response.message ?? 'Could not generate video')
      return
    }
    startRun(response.data)
  }

  const influencerNames = useMemo(
    () =>
      Object.fromEntries(
        Object.values(influencersById).map(influencer => [influencer._id, influencer.name]),
      ) as Record<string, string>,
    [influencersById],
  )

  const canGenerateStills = project.productImageUrls.length > 0 && project.influencerIds.length > 0
  const canGenerateVideo = project.variants.some(variant => variant.stills.some(still => Boolean(still.imageUrl)))

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-8">
      {runId && accessToken ? (
        <UgcRunWatcher
          runId={runId}
          accessToken={accessToken}
          onProgress={(nextProgress, label) => {
            setProgress(nextProgress)
            setProgressLabel(label)
          }}
          onSettled={() => {
            setRunId(null)
            setAccessToken(null)
            void refreshProject()
          }}
        />
      ) : null}

      <PageHeader
        title={
          <Input
            value={project.name}
            disabled={generating}
            onChange={event => {
              const name = event.target.value
              setProject(current => ({ ...current, name }))
              schedulePatch({ name })
            }}
            className="h-9 border-transparent bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
          />
        }
        description="Product, creator, scenes, script — then generate."
        backHref={DASHBOARD_ROUTES.STUDIO.UGC}
      />

      <UgcProductInput
        workspaceId={workspaceId}
        products={products}
        productsTruncated={productsTruncated}
        imageUrls={project.productImageUrls}
        productName={project.productName}
        productId={project.productId}
        disabled={generating}
        onChange={next => {
          void patch({
            productImageUrls: next.imageUrls,
            productName: next.productName,
            productId: next.productId,
          })
        }}
      />

      <UgcInfluencerPicker
        workspaceId={workspaceId}
        selectedIds={project.influencerIds}
        influencersById={influencersById}
        disabled={generating}
        onChange={(ids, influencers) => {
          setInfluencersById(current => {
            const next = { ...current }
            for (const influencer of influencers) next[influencer._id] = influencer
            return next
          })
          void patch({ influencerIds: ids })
        }}
      />

      <UgcModelChips
        imageModels={imageModels}
        scriptModels={scriptModels}
        videoModels={videoModels}
        imageValue={project.models.image}
        scriptValue={project.models.script}
        videoValue={project.models.video}
        scriptEnabled
        disabled={generating}
        onChange={(key, value) => {
          void patch({ models: { [key]: value } })
        }}
      />

      <UgcSceneStrip
        sceneCount={project.sceneCount}
        variants={project.variants}
        influencerNames={influencerNames}
        generating={generating && Boolean(project.stillsRunId)}
        disabled={generating}
        onSceneCountChange={count => {
          void patch({ sceneCount: count as UgcSceneCount })
        }}
        onRegenerateStill={(variantId, index) => {
          void regenerateUgcStill(project.id, variantId, index).then(response => {
            if (!response.success || !response.data) {
              toast.error(response.message ?? 'Could not regenerate scene')
              return
            }
            startRun(response.data)
          })
        }}
      />

      <UgcScriptPanel
        script={project.script.text}
        directions={project.directions}
        disabled={generating}
        writing={writingScript}
        scriptModelEnabled={Boolean(project.models.script) || scriptModels.length > 0}
        onScriptChange={text => {
          setProject(current => ({ ...current, script: { ...current.script, text, source: 'user' } }))
          schedulePatch({ script: { text, source: 'user' } })
        }}
        onDirectionsChange={directions => {
          setProject(current => ({ ...current, directions }))
          schedulePatch({ directions })
        }}
        onWriteWithAi={() => {
          startWriteScript(async () => {
            const response = await generateUgcScript(project.id, {
              model: project.models.script,
            })
            if (!response.success || !response.data?.project) {
              toast.error(response.message ?? 'Could not write a script')
              return
            }
            setProject(response.data.project)
          })
        }}
      />

      <UgcVideoStage
        variant={
          activeVariant
            ? { ...activeVariant, plannedPrompt: plannedPromptDraft || activeVariant.plannedPrompt }
            : undefined
        }
        generating={generating && Boolean(project.videoRunId)}
        openingEditor={openingEditor}
        onPlannedPromptChange={setPlannedPromptDraft}
        onRegenerateVideo={plannedPrompt => {
          if (!activeVariant) return
          void regenerateUgcVideo(
            project.id,
            activeVariant.id,
            plannedPrompt ? { plannedPrompt, skipPlanner: true } : {},
          ).then(response => {
            if (!response.success || !response.data) {
              toast.error(response.message ?? 'Could not regenerate video')
              return
            }
            startRun(response.data)
          })
        }}
        onOpenEditor={() => {
          if (!activeVariant) return
          startOpenEditor(async () => {
            const response = await openUgcVariantEditor(project.id, activeVariant.id)
            if (!response.success || !response.data?.videoId) {
              toast.error(response.message ?? 'Could not open editor')
              return
            }
            router.push(DASHBOARD_ROUTES.STUDIO.video(response.data.videoId))
          })
        }}
      />

      <UgcGenerateBar
        sceneCount={project.sceneCount}
        variantCount={Math.max(project.influencerIds.length, 1)}
        imageModels={imageModels}
        scriptModels={scriptModels}
        videoModels={videoModels}
        imageValue={project.models.image}
        scriptValue={project.models.script}
        videoValue={project.models.video}
        plannerValue={project.models.planner}
        canGenerateStills={canGenerateStills}
        canGenerateVideo={canGenerateVideo}
        generating={generating}
        progress={progress}
        progressLabel={progressLabel}
        onGenerateStills={() => void handleGenerateStills()}
        onGenerateVideo={() => void handleGenerateVideo()}
      />
    </div>
  )
}
