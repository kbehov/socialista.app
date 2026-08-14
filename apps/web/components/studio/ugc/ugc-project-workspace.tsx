'use client'

import { CollapseAppSidebarOnMount } from '@/components/sidebars/collapse-app-sidebar-on-mount'
import { UgcClipInspector } from '@/components/studio/ugc/ugc-clip-inspector'
import { UgcClipRail } from '@/components/studio/ugc/ugc-clip-rail'
import { UgcStagePanel } from '@/components/studio/ugc/ugc-stage-panel'
import { UgcStudioTopbar } from '@/components/studio/ugc/ugc-studio-topbar'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
import { useGenerationRun } from '@/hooks/use-generation-run'
import { parseGenerationStatus } from '@/lib/image-generation/run-utils'
import { readGenerationAccessToken, storeGenerationAccessToken } from '@/lib/image-generation/session'
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
} from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

type UgcProjectWorkspaceProps = {
  workspaceId: string
  initialProject: UgcProject
}

type Pipeline = 'stills' | 'video' | 'stills-to-video' | null

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

const CLIP_RUN_STORAGE_PREFIX = 'ugc-clip-run:'

function rememberClipRun(clipId: string, runId: string, token: string) {
  storeGenerationAccessToken(runId, token)
  sessionStorage.setItem(`${CLIP_RUN_STORAGE_PREFIX}${clipId}`, runId)
}

function restoreClipRun(clip?: UgcClip) {
  if (!clip) return null
  const storedRunId = sessionStorage.getItem(`${CLIP_RUN_STORAGE_PREFIX}${clip.id}`)
  const candidates = [storedRunId, clip.videoRunId, clip.stillsRunId].filter(
    (id): id is string => Boolean(id),
  )
  for (const id of candidates) {
    const token = readGenerationAccessToken(id)
    if (token) return { runId: id, token }
  }
  return null
}

function clipBlockedReason(project: UgcProject, clip?: UgcClip) {
  if (!clip) return 'Pick a clip type to continue'
  const type = clip.type
  if (ugcClipRequiresCreator(type) && !clip.influencerId) return 'Pick a creator to continue'
  if (ugcClipRequiresProduct(type) && project.productImageUrls.length === 0) return 'Add a product photo to continue'
  if (ugcClipRequiresScreenshots(type) && (clip.referenceImageUrls?.length ?? 0) === 0) {
    return 'Upload app screenshots to continue'
  }
  if (ugcClipRequiresScript(type) && !clip.script?.text.trim()) return 'Write a script to continue'
  if (!project.models.image || !project.models.video) return 'Choose image and video models'
  return null
}

export function UgcProjectWorkspace({ workspaceId, initialProject }: UgcProjectWorkspaceProps) {
  const router = useRouter()
  const hydrate = useUgcProjectStore(s => s.hydrate)
  const setProject = useUgcProjectStore(s => s.setProject)
  const patchProjectLocal = useUgcProjectStore(s => s.patchProjectLocal)
  const patchClipLocal = useUgcProjectStore(s => s.patchClipLocal)
  const storeProject = useUgcProjectStore(s => s.project)
  const influencersById = useUgcProjectStore(s => s.influencersById)
  const ensureModels = useUgcProjectStore(s => s.ensureModels)
  const hydratedIdRef = useRef<string | null>(null)

  const project = storeProject?.id === initialProject.id ? storeProject : initialProject
  const [selectedClipId, setSelectedClipId] = useState(initialProject.clips[0]?.id)
  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [runId, setRunId] = useState<string | null>(clipRunId(initialProject.clips[0]))
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('Generating…')
  const [pipeline, setPipeline] = useState<Pipeline>(null)
  const [writingScript, startWriteScript] = useTransition()
  const [openingEditor, startOpenEditor] = useTransition()
  const [plannedPromptDraft, setPlannedPromptDraft] = useState(initialProject.clips[0]?.plannedPrompt ?? '')
  const saveTimer = useRef<number | null>(null)
  const chainVideoRef = useRef(false)

  useEffect(() => {
    void ensureModels()
  }, [ensureModels])

  useLayoutEffect(() => {
    if (hydratedIdRef.current === initialProject.id) return
    hydratedIdRef.current = initialProject.id
    hydrate(initialProject)
    const first = initialProject.clips[0]
    setSelectedClipId(first?.id)
    setPlannedPromptDraft(first?.plannedPrompt ?? '')
    const restored = restoreClipRun(first)
    setRunId(restored?.runId ?? clipRunId(first))
    setAccessToken(restored?.token ?? null)
    setProgress(0)
    setPipeline(first?.status === 'generating' ? (first.videoRunId && restored?.runId === first.videoRunId ? 'video' : 'stills') : null)
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
    (
      handle: { project: UgcProject; runId: string; publicAccessToken: string },
      nextPipeline: Pipeline,
      clipId: string,
    ) => {
      rememberClipRun(clipId, handle.runId, handle.publicAccessToken)
      setProject(handle.project)
      setRunId(handle.runId)
      setAccessToken(handle.publicAccessToken)
      setProgress(8)
      setProgressLabel('Starting…')
      setPipeline(nextPipeline)
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
    setTypeDialogOpen(false)
    if (created) {
      setSelectedClipId(created.id)
      setPlannedPromptDraft(created.plannedPrompt ?? '')
    }
  }

  const handleGenerateStills = async (clip: UgcClip, nextPipeline: Pipeline) => {
    const response = await generateUgcStills(project.id, { clipId: clip.id })
    if (!response.success || !response.data) {
      toast.error(response.message ?? 'Could not generate scenes')
      return false
    }
    startRun(response.data, nextPipeline, clip.id)
    return true
  }

  const handleGenerateVideo = async (clip: UgcClip, nextPipeline: Pipeline) => {
    const edited = plannedPromptDraft.trim()
    const response = await generateUgcVideos(project.id, {
      clipId: clip.id,
      ...(edited && edited !== (clip.plannedPrompt ?? '') ? { plannedPrompt: edited, skipPlanner: true } : {}),
    })
    if (!response.success || !response.data) {
      toast.error(response.message ?? 'Could not generate video')
      return
    }
    startRun(response.data, nextPipeline, clip.id)
  }

  const handleGenerateClip = async () => {
    if (!selectedClip) return
    const hasStills = selectedClip.stills.some(still => still.imageUrl)
    if (!hasStills) {
      chainVideoRef.current = true
      await handleGenerateStills(selectedClip, 'stills-to-video')
      return
    }
    chainVideoRef.current = false
    await handleGenerateVideo(selectedClip, 'video')
  }

  const influencerNames = useMemo(
    () =>
      Object.fromEntries(
        Object.values(influencersById).map(influencer => [influencer._id, influencer.name]),
      ) as Record<string, string>,
    [influencersById],
  )

  const blockedReason = clipBlockedReason(project, selectedClip)
  const canGenerate = Boolean(selectedClip) && !generating && !blockedReason
  const activePhase: 'stills' | 'video' | undefined = generating
    ? selectedClip?.videoRunId && selectedClip.videoRunId === runId
      ? 'video'
      : 'stills'
    : undefined

  const handleNameChange = (name: string) => {
    patchProjectLocal({ name })
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void patchProject({ name })
    }, 400)
  }

  return (
    <div className="ugc-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <CollapseAppSidebarOnMount />
      {runId && accessToken ? (
        <UgcRunWatcher
          key={runId}
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
              if (!chainVideoRef.current) {
                setPipeline(null)
                return
              }
              chainVideoRef.current = false
              const clip = next?.clips.find(item => item.id === selectedClipId) ?? next?.clips[0]
              if (clip?.stills.some(still => still.imageUrl) && !clip.videoUrl) {
                void handleGenerateVideo(clip, 'stills-to-video')
                return
              }
              setPipeline(null)
            })
          }}
        />
      ) : null}

      <UgcStudioTopbar
        name={project.name}
        generating={generating}
        imageValue={project.models.image}
        scriptValue={project.models.script}
        videoValue={project.models.video}
        onNameChange={handleNameChange}
        onModelChange={(key, value) => {
          void patchProject({ models: { [key]: value } })
        }}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <UgcClipRail
          clips={project.clips}
          selectedId={selectedClip?.id}
          creatorNames={influencerNames}
          disabled={generating}
          typeDialogOpen={typeDialogOpen}
          onTypeDialogOpenChange={setTypeDialogOpen}
          onSelect={id => {
            setSelectedClipId(id)
            const clip = project.clips.find(item => item.id === id)
            setPlannedPromptDraft(clip?.plannedPrompt ?? '')
            const restored = restoreClipRun(clip)
            setRunId(restored?.runId ?? clipRunId(clip))
            setAccessToken(restored?.token ?? null)
            setPipeline(
              clip?.status === 'generating'
                ? restored?.runId && clip.videoRunId === restored.runId
                  ? 'video'
                  : 'stills'
                : null,
            )
          }}
          onCreate={type => void handleCreateClip(type)}
          onDuplicate={id => {
            void duplicateUgcClip(project.id, id).then(response => {
              if (!response.success || !response.data?.project) {
                toast.error(response.message ?? 'Could not duplicate')
                return
              }
              const created = response.data.project.clips.at(-1)
              setProject(response.data.project)
              if (created) {
                setSelectedClipId(created.id)
                setPlannedPromptDraft(created.plannedPrompt ?? '')
              }
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
              setPlannedPromptDraft(next?.plannedPrompt ?? '')
            })
          }}
        />

        <UgcStagePanel
          clip={selectedClip}
          empty={project.clips.length === 0}
          hasProduct={project.productImageUrls.length > 0}
          generating={Boolean(generating)}
          openingEditor={openingEditor}
          canGenerate={canGenerate}
          blockedReason={blockedReason}
          sceneCount={selectedClip?.stills.length || (selectedClip ? UGC_CLIP_DEFAULT_SCENE_COUNT[selectedClip.type] : 1)}
          imageValue={project.models.image}
          scriptValue={project.models.script}
          videoValue={project.models.video}
          plannerValue={project.models.planner}
          progress={progress}
          progressLabel={progressLabel}
          activePhase={activePhase}
          pipeline={pipeline}
          plannedPromptDraft={plannedPromptDraft}
          disabled={generating}
          onSelectType={type => void handleCreateClip(type)}
          onPlannedPromptChange={setPlannedPromptDraft}
          onRegenerateVideo={plannedPrompt => {
            if (!selectedClip) return
            void regenerateUgcVideo(
              project.id,
              selectedClip.id,
              plannedPrompt
                ? { clipId: selectedClip.id, plannedPrompt, skipPlanner: true }
                : { clipId: selectedClip.id },
            ).then(response => {
              if (!response.success || !response.data) {
                toast.error(response.message ?? 'Could not regenerate video')
                return
              }
              startRun(response.data, 'video', selectedClip.id)
            })
          }}
          onOpenEditor={() => {
            if (!selectedClip) return
            startOpenEditor(async () => {
              const response = await openUgcClipEditor(project.id, selectedClip.id)
              if (!response.success || !response.data?.videoId) {
                toast.error(response.message ?? 'Could not open editor')
                return
              }
              router.push(DASHBOARD_ROUTES.STUDIO.video(response.data.videoId))
            })
          }}
          onRegenerateStill={(index, skipEnhance) => {
            if (!selectedClip) return
            void regenerateUgcStill(project.id, selectedClip.id, index, { skipEnhance }).then(response => {
              if (!response.success || !response.data) {
                toast.error(response.message ?? 'Could not regenerate scene')
                return
              }
              startRun(response.data, 'stills', selectedClip.id)
            })
          }}
          onEnhancedPromptChange={(index, prompt) => {
            if (!selectedClip) return
            const stills = selectedClip.stills.map((still, stillIndex) =>
              stillIndex === index ? { ...still, enhancedPrompt: prompt } : still,
            )
            patchClipLocal(selectedClip.id, { stills })
          }}
          onGenerate={() => void handleGenerateClip()}
        />

        <UgcClipInspector
          workspaceId={workspaceId}
          project={project}
          clip={selectedClip}
          generating={generating}
          writingScript={writingScript}
          onProductChange={next => {
            void patchProject({
              productImageUrls: next.imageUrls,
              productName: next.productName,
              productId: next.productId,
            })
          }}
          onDurationChange={durationSec => {
            if (!selectedClip) return
            patchClipLocal(selectedClip.id, { durationSec })
            void patchClip(selectedClip.id, { durationSec })
          }}
          onInfluencerChange={ids => {
            if (!selectedClip) return
            void patchClip(selectedClip.id, { influencerId: ids[0] ?? null })
          }}
          onScreenshotsChange={urls => {
            if (!selectedClip) return
            void patchClip(selectedClip.id, { referenceImageUrls: urls })
          }}
          onScriptChange={text => {
            if (!selectedClip) return
            patchClipLocal(selectedClip.id, { script: { text, source: 'user' } })
            scheduleClipPatch(selectedClip.id, { script: { text, source: 'user' } })
          }}
          onWriteWithAi={() => {
            if (!selectedClip) return
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
          onSceneLookChange={scenePrompt => {
            if (!selectedClip) return
            patchClipLocal(selectedClip.id, { scenePrompt })
            scheduleClipPatch(selectedClip.id, { scenePrompt })
          }}
        />
      </div>
    </div>
  )
}
