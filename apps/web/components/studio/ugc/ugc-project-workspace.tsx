'use client'

import { CollapseAppSidebarOnMount } from '@/components/sidebars/collapse-app-sidebar-on-mount'
import { UgcClipFlow, type ClipRunProgress } from '@/components/studio/ugc/ugc-clip-flow'
import { UgcClipRail } from '@/components/studio/ugc/ugc-clip-rail'
import { UgcStudioTopbar } from '@/components/studio/ugc/ugc-studio-topbar'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  COMPLETED_STATUSES,
  FAILED_STATUSES,
} from '@/constants/generation.const'
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
  duplicateUgcClip,
  generateUgcImageAd,
  generateUgcScript,
  generateUgcStills,
  generateUgcVideos,
  getUgcProject,
  openUgcClipEditor,
  openUgcProjectEditor,
  regenerateUgcStill,
  updateUgcClip,
  updateUgcProject,
} from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type {
  UgcClipType,
  UgcClipVoice,
  UgcProject,
  UpdateUgcProjectPayload,
} from '@socialista/types'
import { UGC_DEFAULT_CLIP_TYPE } from '@socialista/types'
import { useRouter } from 'next/navigation'
import {
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

type Pipeline = 'stills' | 'video' | 'image-ad' | 'assemble'

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
const ASSEMBLE_RUN_STORAGE_KEY = 'ugc-assemble-run:'

function rememberClipRun(clipId: string, runId: string, token: string) {
  storeGenerationAccessToken(runId, token)
  sessionStorage.setItem(`${CLIP_RUN_STORAGE_PREFIX}${clipId}`, runId)
}

function restoreClipRuns(project: UgcProject): ActiveRun[] {
  const next: ActiveRun[] = []
  for (const clip of project.clips) {
    if (clip.status !== 'generating') continue
    const storedRunId = sessionStorage.getItem(`${CLIP_RUN_STORAGE_PREFIX}${clip.id}`)
    const candidates = [storedRunId, clip.videoRunId, clip.imageAdRunId, clip.stillsRunId].filter(
      (id): id is string => Boolean(id),
    )
    for (const id of candidates) {
      const token = readGenerationAccessToken(id)
      if (!token) continue
      const pipeline: Pipeline =
        clip.videoRunId === id ? 'video' : clip.imageAdRunId === id ? 'image-ad' : 'stills'
      next.push({
        key: `${clip.id}:${id}`,
        clipId: clip.id,
        runId: id,
        accessToken: token,
        pipeline,
        progress: 8,
        progressLabel: 'Generating…',
      })
      break
    }
  }
  if (project.assembledRunId && project.status === 'generating') {
    const token = readGenerationAccessToken(project.assembledRunId)
    const stored = sessionStorage.getItem(`${ASSEMBLE_RUN_STORAGE_KEY}${project.id}`)
    const runId = stored && token ? stored : project.assembledRunId
    const accessToken = readGenerationAccessToken(runId)
    if (accessToken) {
      next.push({
        key: `assemble:${runId}`,
        runId,
        accessToken,
        pipeline: 'assemble',
        progress: 8,
        progressLabel: 'Assembling…',
      })
    }
  }
  return next
}

export function UgcProjectWorkspace({
  workspaceId,
  initialProject,
}: UgcProjectWorkspaceProps) {
  const router = useRouter()
  const hydrate = useUgcProjectStore(s => s.hydrate)
  const setProject = useUgcProjectStore(s => s.setProject)
  const patchProjectLocal = useUgcProjectStore(s => s.patchProjectLocal)
  const patchClipLocal = useUgcProjectStore(s => s.patchClipLocal)
  const storeProject = useUgcProjectStore(s => s.project)
  const influencersById = useUgcProjectStore(s => s.influencersById)
  const ensureModels = useUgcProjectStore(s => s.ensureModels)
  const ensureInfluencer = useUgcProjectStore(s => s.ensureInfluencer)
  const hydratedIdRef = useRef<string | null>(null)

  const project =
    storeProject?.id === initialProject.id ? storeProject : initialProject
  const [selectedClipId, setSelectedClipId] = useState(initialProject.clips[0]?.id)
  const [activeRuns, setActiveRuns] = useState<ActiveRun[]>([])
  const [writingScript, startWriteScript] = useTransition()
  const [openingEditor, startOpenEditor] = useTransition()
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

  const selectedClip =
    project.clips.find(clip => clip.id === selectedClipId) ?? project.clips[0]
  const anyGenerating = project.clips.some(clip => clip.status === 'generating') ||
    activeRuns.some(run => run.pipeline === 'assemble')
  const readyVideoCount = project.clips.filter(clip => Boolean(clip.videoUrl)).length

  useEffect(() => {
    const ids = [
      project.influencerId,
      ...project.clips.map(clip => clip.influencerId),
    ].filter((id): id is string => Boolean(id))
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

  const startRun = useCallback(
    (
      handle: { project: UgcProject; runId: string; publicAccessToken: string },
      pipeline: Pipeline,
      clipId?: string,
    ) => {
      if (clipId) rememberClipRun(clipId, handle.runId, handle.publicAccessToken)
      else {
        storeGenerationAccessToken(handle.runId, handle.publicAccessToken)
        sessionStorage.setItem(`${ASSEMBLE_RUN_STORAGE_KEY}${handle.project.id}`, handle.runId)
      }
      setProject(handle.project)
      setActiveRuns(current => {
        const without = clipId
          ? current.filter(run => run.clipId !== clipId)
          : current.filter(run => run.pipeline !== 'assemble')
        return [
          ...without,
          {
            key: `${clipId ?? 'assemble'}:${handle.runId}`,
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
      toast.error(response.message ?? 'Could not add clip')
      return
    }
    const created = response.data.project.clips.at(-1)
    setProject(response.data.project)
    if (created) setSelectedClipId(created.id)
  }

  const handleNameChange = (name: string) => {
    patchProjectLocal({ name })
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void patchProject({ name })
    }, 400)
  }

  const influencerNames = useMemo(
    () =>
      Object.fromEntries(
        Object.values(influencersById).map(influencer => [influencer._id, influencer.name]),
      ) as Record<string, string>,
    [influencersById],
  )

  const selectedRun = activeRuns.find(run => run.clipId === selectedClip?.id)
  const selectedProgress: ClipRunProgress | undefined =
    selectedRun && selectedRun.pipeline !== 'assemble'
      ? {
          pipeline: selectedRun.pipeline,
          progress: selectedRun.progress,
          progressLabel: selectedRun.progressLabel,
        }
      : undefined

  const runsByClipId = useMemo(() => {
    const map: Record<string, { progress: number; label: string }> = {}
    for (const run of activeRuns) {
      if (!run.clipId) continue
      map[run.clipId] = { progress: run.progress, label: run.progressLabel }
    }
    return map
  }, [activeRuns])

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
              current.map(item =>
                item.key === run.key ? { ...item, progress, progressLabel: label } : item,
              ),
            )
          }}
          onSettled={() => {
            setActiveRuns(current => current.filter(item => item.key !== run.key))
            void refreshProject()
          }}
        />
      ))}

      <UgcStudioTopbar
        name={project.name}
        assembling={activeRuns.some(run => run.pipeline === 'assemble')}
        canAssemble={readyVideoCount >= 2}
        assembledVideoUrl={project.assembledVideoUrl}
        openingProjectEditor={openingProjectEditor}
        onNameChange={handleNameChange}
        onAssemble={() => {
          void assembleUgcProject(project.id).then(response => {
            if (!response.success || !response.data) {
              toast.error(response.message ?? 'Could not assemble clips')
              return
            }
            startRun(response.data, 'assemble')
          })
        }}
        onOpenAssembledEditor={() => {
          startOpenProjectEditor(async () => {
            const response = await openUgcProjectEditor(project.id)
            if (!response.success || !response.data?.videoId) {
              toast.error(response.message ?? 'Could not open editor')
              return
            }
            router.push(DASHBOARD_ROUTES.STUDIO.video(response.data.videoId))
          })
        }}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <UgcClipRail
          project={project}
          clips={project.clips}
          selectedId={selectedClip?.id}
          creatorNames={influencerNames}
          runsByClipId={runsByClipId}
          onSelect={setSelectedClipId}
          onCreate={() => void handleCreateClip()}
          onReorder={clipOrder => {
            patchProjectLocal({ clips: clipOrder.flatMap(id => project.clips.filter(clip => clip.id === id)) })
            void patchProject({ clipOrder })
          }}
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
              setSelectedClipId(response.data.project.clips[0]?.id)
            })
          }}
        />

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-muted/10">
          {selectedClip ? (
            <UgcClipFlow
              workspaceId={workspaceId}
              project={project}
              clip={selectedClip}
              writingScript={writingScript}
              openingEditor={openingEditor}
              run={selectedProgress}
              onSelectType={type => {
                void patchClip(selectedClip.id, { type })
              }}
              onProductChange={next => {
                void patchProject({
                  productImageUrls: next.imageUrls,
                  productName: next.productName,
                  productId: next.productId,
                })
              }}
              onInfluencerChange={ids => {
                void patchProject({ influencerId: ids[0] ?? null })
              }}
              onGenerateStills={async input => {
                await patchClip(selectedClip.id, {
                  scenePrompt: input.prompt,
                  sceneCount: input.sceneCount,
                  referenceImageUrls: input.imageUrls,
                  models: { image: input.modelValue },
                })
                if (input.aspectRatio !== project.aspectRatio) {
                  await patchProject({ aspectRatio: input.aspectRatio })
                }
                const response = await generateUgcStills(project.id, { clipId: selectedClip.id })
                if (!response.success || !response.data) {
                  toast.error(response.message ?? 'Could not generate photos')
                  return
                }
                startRun(response.data, 'stills', selectedClip.id)
              }}
              onRegenerateStill={index => {
                void regenerateUgcStill(project.id, selectedClip.id, index).then(response => {
                  if (!response.success || !response.data) {
                    toast.error(response.message ?? 'Could not regenerate photo')
                    return
                  }
                  startRun(response.data, 'stills', selectedClip.id)
                })
              }}
              onUseAsStartFrame={index => {
                void patchClip(selectedClip.id, { startFrameIndex: index })
              }}
              onScriptChange={text => {
                patchClipLocal(selectedClip.id, { script: { text, source: 'user' } })
                scheduleClipPatch(selectedClip.id, { script: { text, source: 'user' } })
              }}
              onWriteWithAi={modelValue => {
                startWriteScript(async () => {
                  const response = await generateUgcScript(project.id, selectedClip.id, {
                    model: modelValue ?? project.models.script,
                  })
                  if (!response.success || !response.data?.project) {
                    toast.error(response.message ?? 'Could not write a script')
                    return
                  }
                  setProject(response.data.project)
                })
              }}
              onVoiceChange={(voice: UgcClipVoice) => {
                patchClipLocal(selectedClip.id, { voice })
                scheduleClipPatch(selectedClip.id, { voice })
              }}
              onGenerateVideo={async input => {
                await patchClip(selectedClip.id, {
                  durationSec: input.durationSec,
                  plannedPrompt: input.prompt || null,
                  models: { video: input.modelValue },
                })
                const response = await generateUgcVideos(project.id, {
                  clipId: selectedClip.id,
                  ...(input.skipPlanner
                    ? { plannedPrompt: input.prompt, skipPlanner: true }
                    : {}),
                })
                if (!response.success || !response.data) {
                  toast.error(response.message ?? 'Could not generate video')
                  return
                }
                startRun(response.data, 'video', selectedClip.id)
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
              onGenerateImageAd={async input => {
                const response = await generateUgcImageAd(project.id, {
                  clipId: selectedClip.id,
                  prompt: input.prompt,
                  language: input.language,
                  aspectRatio: input.aspectRatio,
                  productImage: input.productImage,
                })
                if (!response.success || !response.data) {
                  toast.error(response.message ?? 'Could not generate image ad')
                  return
                }
                startRun(response.data, 'image-ad', selectedClip.id)
              }}
            />
          ) : (
            <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
              <p className="text-lg font-semibold tracking-tight">Add your first clip</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Generate photos, a script, then a video — or skip any step. Add another clip while one is rendering.
              </p>
              <button
                type="button"
                className="mt-5 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition active:scale-[0.98]"
                onClick={() => void handleCreateClip()}
              >
                Add clip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
