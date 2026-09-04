'use client'

import { CollapseAppSidebarOnMount } from '@/components/sidebars/collapse-app-sidebar-on-mount'
import { UgcConfigSidebar } from '@/components/studio/ugc/ugc-config-sidebar'
import { UgcSceneCanvas } from '@/components/studio/ugc/ugc-scene-canvas'
import { UgcStudioTopbar } from '@/components/studio/ugc/ugc-studio-topbar'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
import { useGenerationRun } from '@/hooks/use-generation-run'
import { parseGenerationStatus } from '@/lib/image-generation/run-utils'
import {
  readGenerationAccessToken,
  storeGenerationAccessToken,
} from '@/lib/image-generation/session'
import {
  assembleUgcProject,
  createUgcClip,
  deleteUgcClip,
  generateUgcScript,
  generateUgcStills,
  generateUgcVideos,
  getUgcProject,
  openUgcProjectEditor,
  regenerateUgcStill,
  regenerateUgcVideo,
  updateUgcClip,
  updateUgcProject,
} from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcClipType, UgcProject, UpdateUgcProjectPayload } from '@socialista/types'
import { UGC_DEFAULT_CLIP_TYPE, UGC_STARTER_SCENE_TYPES } from '@socialista/types'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import { toast } from 'sonner'

type UgcProjectWorkspaceProps = {
  workspaceId: string
  initialProject: UgcProject
}

type Pipeline = 'stills' | 'video' | 'assemble'

type ActiveRun = {
  key: string
  clipId?: string
  runId: string
  accessToken: string
  pipeline: Pipeline
  progress: number
  progressLabel: string
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

const CLIP_RUN_STORAGE_PREFIX = 'ugc-clip-run:'
const STILLS_RUN_STORAGE_KEY = 'ugc-stills-run:'
const ASSEMBLE_RUN_STORAGE_KEY = 'ugc-assemble-run:'

function rememberClipRun(clipId: string, runId: string, token: string) {
  storeGenerationAccessToken(runId, token)
  sessionStorage.setItem(`${CLIP_RUN_STORAGE_PREFIX}${clipId}`, runId)
}

function restoreClipRuns(project: UgcProject): ActiveRun[] {
  const next: ActiveRun[] = []
  const stillsStored = sessionStorage.getItem(`${STILLS_RUN_STORAGE_KEY}${project.id}`)
  if (stillsStored) {
    const token = readGenerationAccessToken(stillsStored)
    if (token && project.clips.some(clip => clip.status === 'generating')) {
      next.push({
        key: `stills:${stillsStored}`,
        runId: stillsStored,
        accessToken: token,
        pipeline: 'stills',
        progress: 8,
        progressLabel: 'Generating photos…',
      })
    }
  }
  for (const clip of project.clips) {
    if (clip.status !== 'generating') continue
    const storedRunId = sessionStorage.getItem(`${CLIP_RUN_STORAGE_PREFIX}${clip.id}`)
    const candidates = [storedRunId, clip.videoRunId, clip.stillsRunId].filter(
      (id): id is string => Boolean(id),
    )
    for (const id of candidates) {
      if (next.some(run => run.runId === id)) break
      const token = readGenerationAccessToken(id)
      if (!token) continue
      const pipeline: Pipeline = clip.videoRunId === id ? 'video' : 'stills'
      next.push({
        key: `${clip.id}:${id}`,
        clipId: clip.id,
        runId: id,
        accessToken: token,
        pipeline,
        progress: 8,
        progressLabel: pipeline === 'video' ? 'Rendering…' : 'Generating photos…',
      })
      break
    }
  }
  if (project.assembledRunId && project.status === 'generating') {
    const stored = sessionStorage.getItem(`${ASSEMBLE_RUN_STORAGE_KEY}${project.id}`)
    const runId = stored ?? project.assembledRunId
    const accessToken = readGenerationAccessToken(runId)
    if (accessToken) {
      next.push({
        key: `assemble:${runId}`,
        runId,
        accessToken,
        pipeline: 'assemble',
        progress: 8,
        progressLabel: 'Stitching…',
      })
    }
  }
  return next
}

export function UgcProjectWorkspace(props: UgcProjectWorkspaceProps) {
  return (
    <Suspense fallback={<div className="flex-1 bg-background" />}>
      <UgcProjectWorkspaceInner {...props} />
    </Suspense>
  )
}

function UgcProjectWorkspaceInner({ workspaceId, initialProject }: UgcProjectWorkspaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrate = useUgcProjectStore(s => s.hydrate)
  const setProject = useUgcProjectStore(s => s.setProject)
  const patchProjectLocal = useUgcProjectStore(s => s.patchProjectLocal)
  const patchClipLocal = useUgcProjectStore(s => s.patchClipLocal)
  const storeProject = useUgcProjectStore(s => s.project)
  const ensureModels = useUgcProjectStore(s => s.ensureModels)
  const ensureInfluencer = useUgcProjectStore(s => s.ensureInfluencer)
  const hydratedIdRef = useRef<string | null>(null)
  const influencerImportRef = useRef<string | null>(null)
  const assembleWhenReadyRef = useRef(false)

  const project = storeProject?.id === initialProject.id ? storeProject : initialProject
  const [selectedClipId, setSelectedClipId] = useState(initialProject.clips[0]?.id)
  const [activeRuns, setActiveRuns] = useState<ActiveRun[]>([])
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [writingScript, startWriteScript] = useTransition()
  const [creatingScenes, startCreateScenes] = useTransition()
  const [openingProjectEditor, startOpenProjectEditor] = useTransition()
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    void ensureModels()
  }, [ensureModels])

  useLayoutEffect(() => {
    if (hydratedIdRef.current === initialProject.id) return
    hydratedIdRef.current = initialProject.id
    hydrate(initialProject)
    setSelectedClipId(initialProject.clips[0]?.id)
    setActiveRuns(restoreClipRuns(initialProject))
  }, [hydrate, initialProject])

  const anyGenerating =
    project.clips.some(clip => clip.status === 'generating') ||
    activeRuns.some(run => run.pipeline === 'assemble' || !run.clipId)
  const readyVideoCount = project.clips.filter(clip => Boolean(clip.videoUrl)).length

  useEffect(() => {
    const ids = [project.influencerId, ...project.clips.map(clip => clip.influencerId)].filter(
      (id): id is string => Boolean(id),
    )
    for (const id of new Set(ids)) {
      void ensureInfluencer(id)
    }
  }, [ensureInfluencer, project.clips, project.influencerId])

  const refreshProject = useCallback(async () => {
    const response = await getUgcProject(project.id)
    if (response.success && response.data?.project) {
      setProject(response.data.project)
      return response.data.project
    }
    return null
  }, [project.id, setProject])

  useEffect(() => {
    if (!anyGenerating) return
    const interval = window.setInterval(() => {
      void refreshProject()
    }, 2500)
    return () => window.clearInterval(interval)
  }, [anyGenerating, refreshProject])

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

  const influencerParam = searchParams.get('influencer')
  useEffect(() => {
    if (!influencerParam || influencerImportRef.current === influencerParam) return
    influencerImportRef.current = influencerParam
    void patchProject({ influencerId: influencerParam })
    setCreatorOpen(true)
    router.replace(DASHBOARD_ROUTES.STUDIO.ugcProject(project.id))
  }, [influencerParam, patchProject, project.id, router])

  const startRun = useCallback(
    (
      handle: { project: UgcProject; runId: string; publicAccessToken: string },
      pipeline: Pipeline,
      clipId?: string,
    ) => {
      storeGenerationAccessToken(handle.runId, handle.publicAccessToken)
      if (clipId) rememberClipRun(clipId, handle.runId, handle.publicAccessToken)
      else if (pipeline === 'assemble') {
        sessionStorage.setItem(`${ASSEMBLE_RUN_STORAGE_KEY}${handle.project.id}`, handle.runId)
      } else if (pipeline === 'stills') {
        sessionStorage.setItem(`${STILLS_RUN_STORAGE_KEY}${handle.project.id}`, handle.runId)
      }
      setProject(handle.project)
      setActiveRuns(current => {
        const without = clipId
          ? current.filter(run => run.clipId !== clipId)
          : current.filter(run => run.pipeline !== pipeline || Boolean(run.clipId) !== !clipId)
        return [
          ...without.filter(run => run.runId !== handle.runId),
          {
            key: `${clipId ?? pipeline}:${handle.runId}`,
            clipId,
            runId: handle.runId,
            accessToken: handle.publicAccessToken,
            pipeline,
            progress: 8,
            progressLabel: 'Starting…',
          },
        ]
      })
    },
    [setProject],
  )

  const handleCreateClip = async (type: UgcClipType = UGC_DEFAULT_CLIP_TYPE) => {
    const response = await createUgcClip(project.id, { type })
    if (!response.success || !response.data?.project) {
      toast.error(response.message ?? 'Could not add scene')
      return
    }
    const created = response.data.project.clips.at(-1)
    setProject(response.data.project)
    if (created) setSelectedClipId(created.id)
  }

  const handleStarterSequence = () => {
    startCreateScenes(async () => {
      for (const type of UGC_STARTER_SCENE_TYPES) {
        const response = await createUgcClip(project.id, { type })
        if (!response.success || !response.data?.project) {
          toast.error(response.message ?? 'Could not add scenes')
          return
        }
        setProject(response.data.project)
        const created = response.data.project.clips.at(-1)
        if (created) setSelectedClipId(created.id)
      }
    })
  }

  const handleNameChange = (name: string) => {
    patchProjectLocal({ name })
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void patchProject({ name })
    }, 400)
  }

  const handleAssemble = useCallback(() => {
    void assembleUgcProject(project.id).then(response => {
      if (!response.success || !response.data) {
        toast.error(response.message ?? 'Could not stitch the ad')
        return
      }
      assembleWhenReadyRef.current = false
      startRun(response.data, 'assemble')
    })
  }, [project.id, startRun])

  const tryAssembleIfReady = useCallback(
    (latest: UgcProject | null) => {
      if (!assembleWhenReadyRef.current || !latest) return
      const approved = latest.clips.filter(
        clip => clip.approved && clip.stills.some(still => still.imageUrl),
      )
      if (approved.length === 0) return
      if (approved.some(clip => !clip.videoUrl || clip.status === 'generating')) return
      assembleWhenReadyRef.current = false
      handleAssemble()
    },
    [handleAssemble],
  )

  const handleOpenEditor = useCallback(() => {
    startOpenProjectEditor(async () => {
      const response = await openUgcProjectEditor(project.id)
      if (!response.success || !response.data?.videoId) {
        toast.error(response.message ?? 'Could not open editor')
        return
      }
      router.push(DASHBOARD_ROUTES.STUDIO.video(response.data.videoId))
    })
  }, [project.id, router])

  const handleRenderAd = useCallback(() => {
    assembleWhenReadyRef.current = true
    const missing = project.clips.filter(
      clip => clip.approved && clip.stills.some(still => still.imageUrl) && !clip.videoUrl,
    )
    if (missing.length === 0) {
      handleAssemble()
      return
    }
    void (async () => {
      for (const clip of missing) {
        const response = await generateUgcVideos(project.id, { clipId: clip.id })
        if (!response.success || !response.data) {
          toast.error(response.message ?? 'Could not render video')
          assembleWhenReadyRef.current = false
          return
        }
        startRun(response.data, 'video', clip.id)
      }
    })()
  }, [handleAssemble, project.clips, project.id, startRun])

  const runsByClipId = useMemo(() => {
    const map: Record<string, { progress: number; label: string }> = {}
    const projectStills = activeRuns.find(run => run.pipeline === 'stills' && !run.clipId)
    for (const clip of project.clips) {
      if (projectStills) {
        map[clip.id] = { progress: projectStills.progress, label: projectStills.progressLabel }
      }
    }
    for (const run of activeRuns) {
      if (!run.clipId) continue
      map[run.clipId] = { progress: run.progress, label: run.progressLabel }
    }
    return map
  }, [activeRuns, project.clips])

  const stillsRun = activeRuns.find(run => run.pipeline === 'stills')
  const videoBusy = activeRuns.some(run => run.pipeline === 'video')
  const assembling = activeRuns.some(run => run.pipeline === 'assemble')

  const createHref = `${DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE}?returnTo=${encodeURIComponent(
    DASHBOARD_ROUTES.STUDIO.ugcProject(project.id),
  )}`

  return (
    <div className="ugc-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <CollapseAppSidebarOnMount />
      {activeRuns.map(run => (
        <UgcRunWatcher
          key={run.key}
          runId={run.runId}
          accessToken={run.accessToken}
          onProgress={(progress, label) => {
            setActiveRuns(current =>
              current.map(item => (item.key === run.key ? { ...item, progress, progressLabel: label } : item)),
            )
          }}
          onSettled={() => {
            setActiveRuns(current => current.filter(item => item.key !== run.key))
            void refreshProject().then(tryAssembleIfReady)
          }}
        />
      ))}

      <UgcStudioTopbar
        name={project.name}
        assembling={assembling}
        canAssemble={readyVideoCount >= 1 && !videoBusy}
        assembledVideoUrl={project.assembledVideoUrl}
        openingProjectEditor={openingProjectEditor}
        onNameChange={handleNameChange}
        onAssemble={handleAssemble}
        onOpenAssembledEditor={handleOpenEditor}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        <UgcConfigSidebar
          workspaceId={workspaceId}
          project={project}
          selectedClipId={selectedClipId}
          creatingScenes={creatingScenes}
          writingScript={writingScript}
          createHref={createHref}
          creatorOpen={creatorOpen}
          onCreatorOpenChange={setCreatorOpen}
          onSelectClip={setSelectedClipId}
          onAddClip={type => void handleCreateClip(type)}
          onUseStarter={handleStarterSequence}
          onDeleteClip={id => {
            void deleteUgcClip(project.id, id).then(response => {
              if (!response.success || !response.data?.project) {
                toast.error(response.message ?? 'Could not remove scene')
                return
              }
              setProject(response.data.project)
              setSelectedClipId(response.data.project.clips[0]?.id)
            })
          }}
          onReorder={clipOrder => {
            patchProjectLocal({
              clips: clipOrder.flatMap(id => project.clips.filter(clip => clip.id === id)),
            })
            void patchProject({ clipOrder })
          }}
          onProductChange={next => {
            patchProjectLocal({
              productImageUrls: next.imageUrls,
              productName: next.productName,
              productId: next.productId ?? undefined,
              productDescription: next.productDescription,
              productUrl: next.productUrl ?? undefined,
              productKind: next.productKind ?? undefined,
            })
            if (saveTimer.current) window.clearTimeout(saveTimer.current)
            saveTimer.current = window.setTimeout(() => {
              void patchProject({
                productImageUrls: next.imageUrls,
                productName: next.productName,
                productId: next.productId,
                productDescription: next.productDescription ?? null,
                productUrl: next.productUrl ?? null,
                productKind: next.productKind ?? null,
              })
            }, 400)
          }}
          onInfluencerChange={ids => {
            void patchProject({ influencerId: ids[0] ?? null })
          }}
          onScriptChange={(clipId, text) => {
            patchClipLocal(clipId, { script: { text, source: 'user' } })
            scheduleClipPatch(clipId, { script: { text, source: 'user' } })
          }}
          onWriteAll={modelValue => {
            startWriteScript(async () => {
              const response = await generateUgcScript(project.id, {
                model: modelValue ?? project.models.script,
              })
              if (!response.success || !response.data?.project) {
                toast.error(response.message ?? 'Could not write a script')
                return
              }
              setProject(response.data.project)
            })
          }}
          onModelsChange={(key, value) => {
            void patchProject({ models: { [key]: value } })
          }}
          onDurationChange={seconds => {
            for (const clip of project.clips) {
              void patchClip(clip.id, { durationSec: seconds })
            }
          }}
          onAspectRatioChange={ratio => {
            void patchProject({ aspectRatio: ratio })
          }}
        />
        <UgcSceneCanvas
          project={project}
          selectedClipId={selectedClipId}
          creatingScenes={creatingScenes}
          writingScript={writingScript}
          generatingStills={Boolean(stillsRun) || project.clips.some(clip => clip.status === 'generating' && !clip.videoRunId)}
          generatingVideo={videoBusy}
          assembling={assembling}
          openingEditor={openingProjectEditor}
          stillsProgress={stillsRun?.progress}
          stillsProgressLabel={stillsRun?.progressLabel}
          videoProgressLabel={activeRuns.find(run => run.pipeline === 'video')?.progressLabel}
          runsByClipId={runsByClipId}
          onSelectClip={setSelectedClipId}
          onAddClip={type => void handleCreateClip(type)}
          onUseStarter={handleStarterSequence}
          onWriteScript={() => {
            startWriteScript(async () => {
              const response = await generateUgcScript(project.id, { model: project.models.script })
              if (!response.success || !response.data?.project) {
                toast.error(response.message ?? 'Could not write a script')
                return
              }
              setProject(response.data.project)
            })
          }}
          onGenerateStills={() => {
            void generateUgcStills(project.id, {}).then(response => {
              if (!response.success || !response.data) {
                toast.error(response.message ?? 'Could not generate photos')
                return
              }
              startRun(response.data, 'stills')
            })
          }}
          onToggleApproved={(clipId, approved) => {
            void patchClip(clipId, { approved })
          }}
          onApproveAll={() => {
            for (const clip of project.clips) {
              if (clip.stills.some(still => still.imageUrl) && !clip.approved) {
                void patchClip(clip.id, { approved: true })
              }
            }
          }}
          onRegenerateStill={clipId => {
            void regenerateUgcStill(project.id, clipId, 0).then(response => {
              if (!response.success || !response.data) {
                toast.error(response.message ?? 'Could not regenerate photo')
                return
              }
              startRun(response.data, 'stills', clipId)
            })
          }}
          onRegenerateVideo={clipId => {
            void regenerateUgcVideo(project.id, clipId).then(response => {
              if (!response.success || !response.data) {
                toast.error(response.message ?? 'Could not redo this scene')
                return
              }
              assembleWhenReadyRef.current = true
              startRun(response.data, 'video', clipId)
            })
          }}
          onRenderAd={handleRenderAd}
          onStitch={handleAssemble}
          onOpenEditor={handleOpenEditor}
        />
      </div>
    </div>
  )
}
