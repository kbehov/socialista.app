'use client'

import { PageHeader } from '@/components/headers/page-header'
import { UgcClipGallery } from '@/components/studio/ugc/ugc-clip-gallery'
import { UgcClipScreenshots } from '@/components/studio/ugc/ugc-clip-screenshots'
import { UgcClipTypePicker } from '@/components/studio/ugc/ugc-clip-type-picker'
import { UgcDurationControl } from '@/components/studio/ugc/ugc-duration-control'
import { UgcGenerateBar } from '@/components/studio/ugc/ugc-generate-bar'
import { UgcInfluencerPicker } from '@/components/studio/ugc/ugc-influencer-picker'
import { UgcModelChips } from '@/components/studio/ugc/ugc-model-chips'
import { UgcProductInput } from '@/components/studio/ugc/ugc-product-input'
import { UgcSceneLook } from '@/components/studio/ugc/ugc-scene-look'
import { UgcSceneStrip } from '@/components/studio/ugc/ugc-scene-strip'
import { UgcScriptPanel } from '@/components/studio/ugc/ugc-script-panel'
import { UgcVideoStage } from '@/components/studio/ugc/ugc-video-stage'
import { Input } from '@/components/ui/input'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
import { useGenerationRun } from '@/hooks/use-generation-run'
import { parseGenerationStatus } from '@/lib/image-generation/run-utils'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import {
  createUgcClip,
  deleteUgcClip,
  duplicateUgcClip,
  generateUgcScript,
  generateUgcStills,
  generateUgcVideos,
  getUgcProject,
  openUgcClipEditor,
  regenerateUgcStill,
  regenerateUgcVideo,
  updateUgcClip,
  updateUgcProject,
} from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcClip, UgcClipType, UgcProject, UpdateUgcProjectPayload } from '@socialista/types'
import {
  UGC_CLIP_DEFAULT_SCENE_COUNT,
  ugcClipRequiresCreator,
  ugcClipRequiresProduct,
  ugcClipRequiresScreenshots,
  ugcClipRequiresScript,
  ugcClipShowsScript,
} from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

type UgcProjectWorkspaceProps = {
  workspaceId: string
  initialProject: UgcProject
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

function clipRunId(clip?: UgcClip) {
  return clip?.stillsRunId ?? clip?.videoRunId ?? null
}

export function UgcProjectWorkspace({ workspaceId, initialProject }: UgcProjectWorkspaceProps) {
  const router = useRouter()
  const hydrate = useUgcProjectStore(s => s.hydrate)
  const setProject = useUgcProjectStore(s => s.setProject)
  const patchProjectLocal = useUgcProjectStore(s => s.patchProjectLocal)
  const patchClipLocal = useUgcProjectStore(s => s.patchClipLocal)
  const storeProject = useUgcProjectStore(s => s.project)
  const influencersById = useUgcProjectStore(s => s.influencersById)
  const hydratedIdRef = useRef<string | null>(null)

  const project = storeProject?.id === initialProject.id ? storeProject : initialProject
  const [selectedClipId, setSelectedClipId] = useState(initialProject.clips[0]?.id)
  const [pickingType, setPickingType] = useState(initialProject.clips.length === 0)
  const [runId, setRunId] = useState<string | null>(clipRunId(initialProject.clips[0]))
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('Generating…')
  const [writingScript, startWriteScript] = useTransition()
  const [openingEditor, startOpenEditor] = useTransition()
  const [plannedPromptDraft, setPlannedPromptDraft] = useState(initialProject.clips[0]?.plannedPrompt ?? '')
  const saveTimer = useRef<number | null>(null)
  const chainVideoRef = useRef(false)

  useLayoutEffect(() => {
    if (hydratedIdRef.current === initialProject.id) return
    hydratedIdRef.current = initialProject.id
    hydrate(initialProject)
    setSelectedClipId(initialProject.clips[0]?.id)
    setPickingType(initialProject.clips.length === 0)
    setPlannedPromptDraft(initialProject.clips[0]?.plannedPrompt ?? '')
    setRunId(clipRunId(initialProject.clips[0]))
    setAccessToken(null)
    setProgress(0)
  }, [hydrate, initialProject])

  const selectedClip = project.clips.find(clip => clip.id === selectedClipId) ?? project.clips[0]
  const generating = selectedClip?.status === 'generating'

  const refreshProject = useCallback(async () => {
    const response = await getUgcProject(project.id)
    if (response.success && response.data?.project) {
      setProject(response.data.project)
      const clip =
        response.data.project.clips.find(item => item.id === selectedClipId) ?? response.data.project.clips[0]
      if (clip?.plannedPrompt) setPlannedPromptDraft(clip.plannedPrompt)
      return response.data.project
    }
    return null
  }, [project.id, selectedClipId, setProject])

  useEffect(() => {
    if (!generating) return
    const interval = window.setInterval(() => {
      void refreshProject()
    }, 2500)
    return () => window.clearInterval(interval)
  }, [generating, refreshProject])

  const patchProject = useCallback(
    async (payload: UpdateUgcProjectPayload) => {
      const response = await updateUgcProject(project.id, payload)
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not save')
        return
      }
      setProject(response.data.project)
    },
    [project.id, setProject],
  )

  const patchClip = useCallback(
    async (clipId: string, payload: Parameters<typeof updateUgcClip>[2]) => {
      const response = await updateUgcClip(project.id, clipId, payload)
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not save')
        return
      }
      setProject(response.data.project)
    },
    [project.id, setProject],
  )

  const scheduleClipPatch = useCallback(
    (clipId: string, payload: Parameters<typeof updateUgcClip>[2]) => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(() => {
        void patchClip(clipId, payload)
      }, 400)
    },
    [patchClip],
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
    [setProject],
  )

  const handleCreateClip = async (type: UgcClipType) => {
    const response = await createUgcClip(project.id, { type })
    if (!response.success || !response.data?.project) {
      toast.error(response.message ?? 'Could not add clip')
      return
    }
    const created = response.data.project.clips.at(-1)
    setProject(response.data.project)
    setPickingType(false)
    if (created) setSelectedClipId(created.id)
  }

  const handleGenerateStills = async (clip: UgcClip) => {
    const response = await generateUgcStills(project.id, { clipId: clip.id })
    if (!response.success || !response.data) {
      toast.error(response.message ?? 'Could not generate scenes')
      return false
    }
    startRun(response.data)
    return true
  }

  const handleGenerateVideo = async (clip: UgcClip) => {
    const edited = plannedPromptDraft.trim()
    const response = await generateUgcVideos(project.id, {
      clipId: clip.id,
      ...(edited && edited !== (clip.plannedPrompt ?? '') ? { plannedPrompt: edited, skipPlanner: true } : {}),
    })
    if (!response.success || !response.data) {
      toast.error(response.message ?? 'Could not generate video')
      return
    }
    startRun(response.data)
  }

  const handleGenerateClip = async () => {
    if (!selectedClip) return
    const hasStills = selectedClip.stills.some(still => still.imageUrl)
    if (!hasStills) {
      chainVideoRef.current = true
      await handleGenerateStills(selectedClip)
      return
    }
    chainVideoRef.current = false
    await handleGenerateVideo(selectedClip)
  }

  const influencerNames = useMemo(
    () =>
      Object.fromEntries(
        Object.values(influencersById).map(influencer => [influencer._id, influencer.name]),
      ) as Record<string, string>,
    [influencersById],
  )

  const canGenerate = Boolean(selectedClip) && !generating && Boolean(project.models.image) && Boolean(project.models.video)
  const type = selectedClip?.type
  const needsCreator = type ? ugcClipRequiresCreator(type) : false
  const needsProduct = type ? ugcClipRequiresProduct(type) : false
  const needsScreens = type ? ugcClipRequiresScreenshots(type) : false
  const needsScript = type ? ugcClipRequiresScript(type) : false
  const showsScript = type ? ugcClipShowsScript(type) : false
  const blocked =
    (needsCreator && !selectedClip?.influencerId) ||
    (needsProduct && project.productImageUrls.length === 0) ||
    (needsScreens && (selectedClip?.referenceImageUrls?.length ?? 0) === 0) ||
    (needsScript && !selectedClip?.script?.text.trim())

  const primaryLabel = selectedClip?.stills.some(still => still.imageUrl) ? 'Generate video' : 'Generate clip'

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
            void refreshProject().then(next => {
              if (!chainVideoRef.current) return
              chainVideoRef.current = false
              const clip = next?.clips.find(item => item.id === selectedClipId) ?? next?.clips[0]
              if (clip?.stills.some(still => still.imageUrl) && !clip.videoUrl) {
                void handleGenerateVideo(clip)
              }
            })
          }}
        />
      ) : null}

      <PageHeader
        title={
          <Input
            value={project.name}
            onChange={event => {
              const name = event.target.value
              patchProjectLocal({ name })
              if (saveTimer.current) window.clearTimeout(saveTimer.current)
              saveTimer.current = window.setTimeout(() => {
                void patchProject({ name })
              }, 400)
            }}
            className="h-9 border-transparent bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
          />
        }
        description="Add clips for this product. Each clip is its own video."
        backHref={DASHBOARD_ROUTES.STUDIO.UGC}
      />

      <UgcProductInput
        workspaceId={workspaceId}
        imageUrls={project.productImageUrls}
        productName={project.productName}
        productId={project.productId}
        onChange={next => {
          void patchProject({
            productImageUrls: next.imageUrls,
            productName: next.productName,
            productId: next.productId,
          })
        }}
      />

      <UgcModelChips
        imageValue={project.models.image}
        scriptValue={project.models.script}
        videoValue={project.models.video}
        scriptEnabled
        onChange={(key, value) => {
          void patchProject({ models: { [key]: value } })
        }}
      />

      {project.clips.length > 0 && !pickingType ? (
        <UgcClipGallery
          clips={project.clips}
          selectedId={selectedClip?.id}
          creatorNames={influencerNames}
          disabled={generating}
          onSelect={id => {
            setSelectedClipId(id)
            const clip = project.clips.find(item => item.id === id)
            setPlannedPromptDraft(clip?.plannedPrompt ?? '')
          }}
          onAdd={() => setPickingType(true)}
          onDuplicate={id => {
            void duplicateUgcClip(project.id, id).then(response => {
              if (!response.success || !response.data?.project) {
                toast.error(response.message ?? 'Could not duplicate')
                return
              }
              const created = response.data.project.clips.at(-1)
              setProject(response.data.project)
              if (created) setSelectedClipId(created.id)
            })
          }}
          onDelete={id => {
            void deleteUgcClip(project.id, id).then(response => {
              if (!response.success || !response.data?.project) {
                toast.error(response.message ?? 'Could not delete clip')
                return
              }
              setProject(response.data.project)
              const next = response.data.project.clips[0]
              setSelectedClipId(next?.id)
              setPickingType(response.data.project.clips.length === 0)
            })
          }}
        />
      ) : (
        <UgcClipTypePicker disabled={generating} onSelect={type => void handleCreateClip(type)} />
      )}

      {pickingType && project.clips.length > 0 ? (
        <button
          type="button"
          className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
          onClick={() => setPickingType(false)}
        >
          Cancel
        </button>
      ) : null}

      {selectedClip && !pickingType ? (
        <>
          <UgcDurationControl
            value={selectedClip.durationSec}
            disabled={generating}
            onChange={durationSec => {
              patchClipLocal(selectedClip.id, { durationSec })
              void patchClip(selectedClip.id, { durationSec })
            }}
          />

          {type && type !== 'b-roll' ? (
            <UgcInfluencerPicker
              workspaceId={workspaceId}
              selectedIds={selectedClip.influencerId ? [selectedClip.influencerId] : []}
              disabled={generating}
              max={1}
              onChange={ids => {
                void patchClip(selectedClip.id, { influencerId: ids[0] ?? null })
              }}
            />
          ) : null}

          {type === 'app-showcase' ? (
            <UgcClipScreenshots
              workspaceId={workspaceId}
              imageUrls={selectedClip.referenceImageUrls ?? []}
              disabled={generating}
              onChange={urls => {
                void patchClip(selectedClip.id, { referenceImageUrls: urls })
              }}
            />
          ) : null}

          {showsScript ? (
            <UgcScriptPanel
              script={selectedClip.script?.text ?? ''}
              disabled={generating}
              writing={writingScript}
              scriptModelEnabled={Boolean(project.models.script)}
              onScriptChange={text => {
                patchClipLocal(selectedClip.id, { script: { text, source: 'user' } })
                scheduleClipPatch(selectedClip.id, { script: { text, source: 'user' } })
              }}
              onWriteWithAi={() => {
                startWriteScript(async () => {
                  const response = await generateUgcScript(project.id, selectedClip.id, {
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
          ) : null}

          <UgcSceneLook
            value={selectedClip.scenePrompt}
            disabled={generating}
            onChange={scenePrompt => {
              patchClipLocal(selectedClip.id, { scenePrompt })
              scheduleClipPatch(selectedClip.id, { scenePrompt })
            }}
          />

          <UgcSceneStrip
            clip={selectedClip}
            generating={generating && Boolean(selectedClip.stillsRunId)}
            disabled={generating}
            onRegenerateStill={(index, skipEnhance) => {
              void regenerateUgcStill(project.id, selectedClip.id, index, { skipEnhance }).then(response => {
                if (!response.success || !response.data) {
                  toast.error(response.message ?? 'Could not regenerate scene')
                  return
                }
                startRun(response.data)
              })
            }}
          />

          <UgcVideoStage
            clip={{ ...selectedClip, plannedPrompt: plannedPromptDraft || selectedClip.plannedPrompt }}
            generating={generating && Boolean(selectedClip.videoRunId)}
            openingEditor={openingEditor}
            onPlannedPromptChange={setPlannedPromptDraft}
            onRegenerateVideo={plannedPrompt => {
              void regenerateUgcVideo(
                project.id,
                selectedClip.id,
                plannedPrompt ? { clipId: selectedClip.id, plannedPrompt, skipPlanner: true } : { clipId: selectedClip.id },
              ).then(response => {
                if (!response.success || !response.data) {
                  toast.error(response.message ?? 'Could not regenerate video')
                  return
                }
                startRun(response.data)
              })
            }}
            onOpenEditor={() => {
              startOpenEditor(async () => {
                const response = await openUgcClipEditor(project.id, selectedClip.id)
                if (!response.success || !response.data?.videoId) {
                  toast.error(response.message ?? 'Could not open editor')
                  return
                }
                router.push(DASHBOARD_ROUTES.STUDIO.video(response.data.videoId))
              })
            }}
          />

          <UgcGenerateBar
            sceneCount={selectedClip.stills.length || UGC_CLIP_DEFAULT_SCENE_COUNT[selectedClip.type]}
            imageValue={project.models.image}
            scriptValue={project.models.script}
            videoValue={project.models.video}
            plannerValue={project.models.planner}
            canGenerate={canGenerate && !blocked}
            generating={generating}
            progress={progress}
            progressLabel={progressLabel}
            primaryLabel={primaryLabel}
            onGenerate={() => void handleGenerateClip()}
          />
        </>
      ) : null}
    </div>
  )
}
