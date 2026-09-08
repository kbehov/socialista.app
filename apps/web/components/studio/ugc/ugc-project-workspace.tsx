'use client'

import { CollapseAppSidebarOnMount } from '@/components/sidebars/collapse-app-sidebar-on-mount'
import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import type { ImagePromptSubmitResult } from '@/components/studio/images/prompt-input'
import { UgcClipRail } from '@/components/studio/ugc/ugc-clip-rail'
import { UgcSceneWorkbench, type UgcWorkbenchTab } from '@/components/studio/ugc/ugc-scene-workbench'
import { UgcSettingsSidebar } from '@/components/studio/ugc/ugc-settings-sidebar'
import { UgcStudioTopbar } from '@/components/studio/ugc/ugc-studio-topbar'
import type { VideoPromptSubmitResult } from '@/components/studio/videos/video-prompt-input'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
import { useGenerationRun } from '@/hooks/use-generation-run'
import { parseGenerationStatus } from '@/lib/image-generation/run-utils'
import { hasUgcProduct, ugcClipGeneratedStills, ugcNeedsCreator } from '@/lib/studio/ugc/ugc-stage'
import { ugcVoiceEquals } from '@/lib/studio/ugc/voices'
import { cn } from '@/lib/utils'
import {
  readGenerationAccessToken,
  storeGenerationAccessToken,
} from '@/lib/image-generation/session'
import {
  applyUgcCampaignPreset,
  assembleUgcProject,
  createUgcClip,
  deleteUgcClip,
  duplicateUgcClip,
  generateUgcClipAudio,
  generateUgcClipScript,
  generateUgcProjectAudio,
  generateUgcStills,
  generateUgcVideos,
  getUgcProject,
  openUgcProjectEditor,
  updateUgcClip,
  updateUgcProject,
} from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type {
  UgcCampaignPresetId,
  UgcClip,
  UgcClipType,
  UgcClipVoice,
  UgcProject,
  UpdateUgcProjectPayload,
} from '@socialista/types'
import { UGC_DEFAULT_CLIP_TYPE, UGC_SCRIPT_MAX_CHARS, UGC_STARTER_SCENE_TYPES, ugcClipAudioTakeForUrl, ugcResolvedClipVoice } from '@socialista/types'
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

type Pipeline = 'stills' | 'video' | 'assemble' | 'audio'

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
  const onProgressRef = useRef(onProgress)
  const onSettledRef = useRef(onSettled)
  onProgressRef.current = onProgress
  onSettledRef.current = onSettled

  useEffect(() => {
    const status = parseGenerationStatus(run?.metadata)
    onProgressRef.current(status.progress, status.label)
  }, [run?.metadata])

  useEffect(() => {
    const status = run?.status
    if (!status || settledRef.current) return
    if (COMPLETED_STATUSES.has(status) || FAILED_STATUSES.has(status)) {
      settledRef.current = true
      onSettledRef.current()
    }
  }, [run?.status])

  return null
}

function stillsToAttachments(clip?: UgcClip, productImageUrls: string[] = []): AttachedMedia[] {
  if (!clip) return []
  return ugcClipGeneratedStills(clip, productImageUrls)
    .flatMap(still => (still.imageUrl ? [still.imageUrl] : []))
    .slice(0, 3)
    .map((url, index) => ({
      id: `still-${index}-${url}`,
      url,
      kind: 'image' as const,
      source: 'library' as const,
      label: index === 0 ? 'Start frame' : `Still ${index + 1}`,
      name: 'Scene still',
    }))
}

const CLIP_RUN_STORAGE_PREFIX = 'ugc-clip-run:'
const CLIP_AUDIO_RUN_STORAGE_PREFIX = 'ugc-clip-audio-run:'
const STILLS_RUN_STORAGE_KEY = 'ugc-stills-run:'
const ASSEMBLE_RUN_STORAGE_KEY = 'ugc-assemble-run:'
const AUDIO_RUN_STORAGE_KEY = 'ugc-audio-run:'

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
  const audioStored = sessionStorage.getItem(`${AUDIO_RUN_STORAGE_KEY}${project.id}`)
  if (audioStored) {
    const token = readGenerationAccessToken(audioStored)
    if (token) {
      next.push({
        key: `audio:${audioStored}`,
        runId: audioStored,
        accessToken: token,
        pipeline: 'audio',
        progress: 8,
        progressLabel: 'Generating voiceover…',
      })
    }
  }
  for (const clip of project.clips) {
    const storedAudioRunId = sessionStorage.getItem(`${CLIP_AUDIO_RUN_STORAGE_PREFIX}${clip.id}`)
    if (storedAudioRunId && !next.some(run => run.runId === storedAudioRunId)) {
      const token = readGenerationAccessToken(storedAudioRunId)
      if (token) {
        next.push({
          key: `${clip.id}:${storedAudioRunId}`,
          clipId: clip.id,
          runId: storedAudioRunId,
          accessToken: token,
          pipeline: 'audio',
          progress: 8,
          progressLabel: 'Generating voiceover…',
        })
      }
    }
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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<UgcWorkbenchTab>('image')
  const [pickedVideoAttachments, setPickedVideoAttachments] = useState<{
    clipId: string
    items: AttachedMedia[]
  } | null>(null)
  const [writingScript, startWriteScript] = useTransition()
  const [creatingScenes, startCreateScenes] = useTransition()
  const [applyingPreset, startApplyPreset] = useTransition()
  const [generatingAudio, startGenerateAudio] = useTransition()
  const [openingProjectEditor, startOpenProjectEditor] = useTransition()
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    void ensureModels()
  }, [ensureModels])

  useEffect(() => {
    if (!settingsOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [settingsOpen])

  useLayoutEffect(() => {
    if (hydratedIdRef.current === initialProject.id) return
    hydratedIdRef.current = initialProject.id
    hydrate(initialProject)
    setSelectedClipId(initialProject.clips[0]?.id)
    setActiveRuns(restoreClipRuns(initialProject))
  }, [hydrate, initialProject])

  const anyGenerating =
    project.clips.some(clip => clip.status === 'generating') || activeRuns.length > 0
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
      if (pipeline === 'audio') {
        if (clipId) sessionStorage.setItem(`${CLIP_AUDIO_RUN_STORAGE_PREFIX}${clipId}`, handle.runId)
        else sessionStorage.setItem(`${AUDIO_RUN_STORAGE_KEY}${handle.project.id}`, handle.runId)
      } else if (clipId) rememberClipRun(clipId, handle.runId, handle.publicAccessToken)
      else if (pipeline === 'assemble') {
        sessionStorage.setItem(`${ASSEMBLE_RUN_STORAGE_KEY}${handle.project.id}`, handle.runId)
      } else if (pipeline === 'stills') {
        sessionStorage.setItem(`${STILLS_RUN_STORAGE_KEY}${handle.project.id}`, handle.runId)
      }
      setProject(handle.project)
      setActiveRuns(current => {
        const without = current.filter(run => {
          if (run.runId === handle.runId) return false
          if (pipeline === 'audio') {
            if (clipId) return !(run.pipeline === 'audio' && run.clipId === clipId)
            return !(run.pipeline === 'audio' && !run.clipId)
          }
          if (clipId) return run.clipId !== clipId
          return run.pipeline !== pipeline || Boolean(run.clipId) !== !clipId
        })
        return [
          ...without,
          {
            key: `${clipId ?? pipeline}:${handle.runId}`,
            clipId,
            runId: handle.runId,
            accessToken: handle.publicAccessToken,
            pipeline,
            progress: 8,
            progressLabel:
              pipeline === 'audio'
                ? 'Generating voiceover…'
                : pipeline === 'video'
                  ? 'Rendering…'
                  : pipeline === 'assemble'
                    ? 'Stitching…'
                    : 'Starting…',
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

  const handleApplyPreset = (presetId: UgcCampaignPresetId) => {
    startApplyPreset(async () => {
      const response = await applyUgcCampaignPreset(project.id, { presetId })
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not apply template')
        return
      }
      setProject(response.data.project)
      const created = response.data.project.clips.at(-1)
      if (created) setSelectedClipId(created.id)
    })
  }

  const selectedClip = project.clips.find(clip => clip.id === selectedClipId) ?? project.clips[0]
  const videoAttachments =
    selectedClip && pickedVideoAttachments?.clipId === selectedClip.id
      ? pickedVideoAttachments.items
      : stillsToAttachments(selectedClip, project.productImageUrls)

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
    const projectAudio = activeRuns.find(run => run.pipeline === 'audio' && !run.clipId)
    for (const clip of project.clips) {
      if (projectStills) {
        map[clip.id] = { progress: projectStills.progress, label: projectStills.progressLabel }
      } else if (projectAudio) {
        map[clip.id] = { progress: projectAudio.progress, label: projectAudio.progressLabel }
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
  const totalDurationSec = project.clips.reduce((sum, clip) => sum + (clip.durationSec || 0), 0)
  const clipRun = selectedClip ? runsByClipId[selectedClip.id] : undefined
  const generatingStill =
    Boolean(stillsRun && (!stillsRun.clipId || stillsRun.clipId === selectedClip?.id)) ||
    (selectedClip?.status === 'generating' && !selectedClip.videoRunId)
  const generatingVideo =
    Boolean(activeRuns.some(run => run.pipeline === 'video' && run.clipId === selectedClip?.id)) ||
    Boolean(selectedClip?.videoRunId && selectedClip.status === 'generating')
  const audioBusy =
    generatingAudio ||
    activeRuns.some(run => run.pipeline === 'audio' && (!run.clipId || run.clipId === selectedClip?.id))
  const settingsIncomplete = !hasUgcProduct(project) || (ugcNeedsCreator(project) && !project.influencerId)

  const applyClipAudio = useCallback(
    (url: string) => {
      if (!selectedClip) return
      const take = ugcClipAudioTakeForUrl([selectedClip, ...project.clips], url)
      const text = take?.scriptText?.trim()
      const script = text
        ? { text: text.slice(0, UGC_SCRIPT_MAX_CHARS), source: 'user' as const }
        : undefined
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
      patchClipLocal(selectedClip.id, {
        audioUrl: url,
        ...(script ? { script } : {}),
      })
      void patchClip(selectedClip.id, {
        audioUrl: url,
        ...(script ? { script } : {}),
      })
      setActiveTab('audio')
    },
    [patchClip, patchClipLocal, project.clips, selectedClip],
  )

  const persistCampaignVoice = useCallback(
    async (voice: UgcClipVoice, clipId?: string) => {
      const campaignVoice = { ...voice, enabled: true }
      const clipVoice = clipId ? project.clips.find(item => item.id === clipId)?.voice : undefined
      const disableClip = Boolean(clipId) && voice.enabled === false
      const clearClipOverride =
        Boolean(clipId) && voice.enabled !== false && clipVoice != null && clipVoice.enabled !== false

      if (ugcVoiceEquals(project.voice, campaignVoice) && !disableClip && !clearClipOverride) return

      patchProjectLocal({ voice: campaignVoice })
      if (clipId && disableClip) patchClipLocal(clipId, { voice })
      else if (clipId && clearClipOverride) patchClipLocal(clipId, { voice: undefined })

      const response = await updateUgcProject(project.id, { voice: campaignVoice })
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not save')
        return
      }

      setProject({
        ...response.data.project,
        voice: campaignVoice,
        clips: clipId
          ? response.data.project.clips.map(item =>
              item.id === clipId
                ? {
                    ...item,
                    voice: disableClip ? voice : clearClipOverride ? undefined : item.voice,
                  }
                : item,
            )
          : response.data.project.clips,
      })

      if (!clipId) return
      if (disableClip) await patchClip(clipId, { voice })
      else if (clearClipOverride) await patchClip(clipId, { voice: null })
    },
    [patchClip, patchClipLocal, patchProjectLocal, project.clips, project.id, project.voice, setProject],
  )

  const startClipStills = (clipId: string, extra?: { prompt?: string; model?: string; referenceImageUrls?: string[]; count?: number }) => {
    void generateUgcStills(project.id, { clipId, ...extra }).then(response => {
      if (!response.success || !response.data) {
        toast.error(response.message ?? 'Could not generate photos')
        return
      }
      startRun(response.data, 'stills', clipId)
    })
  }

  const startClipVideo = (clipId: string, extra?: { plannedPrompt?: string }) => {
    void generateUgcVideos(project.id, { clipId, ...extra }).then(response => {
      if (!response.success || !response.data) {
        toast.error(response.message ?? 'Could not generate video')
        return
      }
      startRun(response.data, 'video', clipId)
    })
  }

  const handleImageSubmit = (result: ImagePromptSubmitResult) => {
    if (!selectedClip) return
    void (async () => {
      if (result.aspectRatio !== project.aspectRatio) {
        patchProjectLocal({ aspectRatio: result.aspectRatio })
        await patchProject({ aspectRatio: result.aspectRatio })
      }
      startClipStills(selectedClip.id, {
        prompt: result.prompt,
        model: result.model,
        referenceImageUrls: result.imageUrls,
        count: Math.min(result.numImages, 3),
      })
    })()
  }

  const handleVideoSubmit = (result: VideoPromptSubmitResult) => {
    if (!selectedClip) return
    void (async () => {
      if (result.aspectRatio !== project.aspectRatio) {
        patchProjectLocal({ aspectRatio: result.aspectRatio })
        await patchProject({ aspectRatio: result.aspectRatio })
      }
      await patchClip(selectedClip.id, { directions: result.prompt, plannedPrompt: result.prompt })
      startClipVideo(selectedClip.id, { plannedPrompt: result.prompt })
    })()
  }

  const applyStillUrls = (urls: string[]) => {
    if (!selectedClip || urls.length === 0) return
    const selectedSet = new Set(urls)
    const picked = urls.map((url, index) => {
      const existing = selectedClip.stills.find(still => still.imageUrl === url)
      return { index, imageUrl: url, generationId: existing?.generationId, enhancedPrompt: existing?.enhancedPrompt }
    })
    const rest = selectedClip.stills.filter(still => still.imageUrl && !selectedSet.has(still.imageUrl))
    void patchClip(selectedClip.id, {
      stills: [...picked, ...rest.map((still, index) => ({ ...still, index: picked.length + index }))],
    })
    setPickedVideoAttachments({
      clipId: selectedClip.id,
      items: urls.slice(0, 3).map((url, index) => ({
        id: `still-${index}-${url}`,
        url,
        kind: 'image' as const,
        source: 'library' as const,
        label: index === 0 ? 'Start frame' : `Still ${index + 1}`,
        name: 'Scene still',
      })),
    })
    setActiveTab('video')
  }

  return (
    <div className="ugc-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <CollapseAppSidebarOnMount />
      {activeRuns.map(run => (
        <UgcRunWatcher
          key={run.key}
          runId={run.runId}
          accessToken={run.accessToken}
          onProgress={(progress, label) => {
            setActiveRuns(current => {
              const item = current.find(entry => entry.key === run.key)
              if (!item || (item.progress === progress && item.progressLabel === label)) return current
              return current.map(entry =>
                entry.key === run.key ? { ...entry, progress, progressLabel: label } : entry,
              )
            })
          }}
          onSettled={() => {
            if (run.pipeline === 'audio') {
              if (run.clipId) sessionStorage.removeItem(`${CLIP_AUDIO_RUN_STORAGE_PREFIX}${run.clipId}`)
              else sessionStorage.removeItem(`${AUDIO_RUN_STORAGE_KEY}${project.id}`)
            }
            setActiveRuns(current => current.filter(item => item.key !== run.key))
            void refreshProject().then(tryAssembleIfReady)
          }}
        />
      ))}

      <UgcStudioTopbar
        name={project.name}
        status={project.status}
        aspectRatio={project.aspectRatio}
        sceneCount={project.clips.length}
        totalDurationSec={totalDurationSec}
        assembling={assembling}
        canAssemble={readyVideoCount >= 1 && !videoBusy}
        assembledVideoUrl={project.assembledVideoUrl}
        openingProjectEditor={openingProjectEditor}
        generating={anyGenerating || generatingAudio || writingScript}
        settingsIncomplete={settingsIncomplete}
        onNameChange={handleNameChange}
        onAssemble={handleAssemble}
        onOpenAssembledEditor={handleOpenEditor}
        onOpenSettings={() => setSettingsOpen(true)}
        onGenerateAllPhotos={() => {
          void generateUgcStills(project.id, {}).then(response => {
            if (!response.success || !response.data) {
              toast.error(response.message ?? 'Could not generate photos')
              return
            }
            startRun(response.data, 'stills')
          })
        }}
        onGenerateAllAudio={() => {
          startGenerateAudio(async () => {
            try {
              const response = await generateUgcProjectAudio(project.id)
              if (!response.success || !response.data) {
                toast.error(response.message ?? 'Could not generate audio')
                return
              }
              startRun(response.data, 'audio')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Could not generate audio')
            }
          })
        }}
        onGenerateAllVideos={handleRenderAd}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        <UgcClipRail
          project={project}
          selectedId={selectedClip?.id}
          creating={creatingScenes}
          applyingPreset={applyingPreset}
          runsByClipId={runsByClipId}
          onSelect={setSelectedClipId}
          onAdd={type => void handleCreateClip(type)}
          onUseStarter={handleStarterSequence}
          onDuplicate={clipId => {
            void duplicateUgcClip(project.id, clipId).then(response => {
              if (!response.success || !response.data?.project) {
                toast.error(response.message ?? 'Could not duplicate scene')
                return
              }
              setProject(response.data.project)
              const created = response.data.project.clips.at(-1)
              if (created) setSelectedClipId(created.id)
            })
          }}
          onDelete={id => {
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
          onApplyPreset={handleApplyPreset}
        />
        <UgcSceneWorkbench
          project={project}
          clip={selectedClip}
          tab={activeTab}
          videoAttachments={videoAttachments}
          creatingScenes={creatingScenes}
          writingScript={writingScript}
          generatingAudio={audioBusy}
          generatingStill={generatingStill}
          generatingVideo={generatingVideo}
          stillsProgress={clipRun?.progress ?? stillsRun?.progress}
          stillsProgressLabel={clipRun?.label ?? stillsRun?.progressLabel}
          videoProgress={
            activeRuns.find(run => run.pipeline === 'video' && run.clipId === selectedClip?.id)?.progress
          }
          videoProgressLabel={
            activeRuns.find(run => run.pipeline === 'video' && run.clipId === selectedClip?.id)?.progressLabel
          }
          busy={assembling}
          onTabChange={setActiveTab}
          onTypeChange={type => {
            if (!selectedClip) return
            void patchClip(selectedClip.id, { type })
          }}
          onAddClip={type => void handleCreateClip(type)}
          onUseStarter={handleStarterSequence}
          onImageSubmit={handleImageSubmit}
          onVideoSubmit={handleVideoSubmit}
          onUseStills={applyStillUrls}
          onSelectAudio={applyClipAudio}
          onScriptChange={text => {
            if (!selectedClip) return
            patchClipLocal(selectedClip.id, { script: { text, source: 'user' } })
            scheduleClipPatch(selectedClip.id, { script: { text, source: 'user' } })
          }}
          onWriteScript={() => {
            if (!selectedClip) return
            startWriteScript(async () => {
              const response = await generateUgcClipScript(project.id, selectedClip.id, {
                model: project.models.script,
              })
              if (!response.success || !response.data?.project) {
                toast.error(response.message ?? 'Could not write a script')
                return
              }
              setProject(response.data.project)
            })
          }}
          onVoiceChange={voice => {
            if (!selectedClip) return
            if (ugcVoiceEquals(ugcResolvedClipVoice(project, selectedClip), voice)) return
            void persistCampaignVoice(voice, selectedClip.id)
          }}
          onGenerateAudio={script => {
            if (!selectedClip) return
            startGenerateAudio(async () => {
              try {
                if (saveTimer.current) window.clearTimeout(saveTimer.current)
                const response = await generateUgcClipAudio(project.id, selectedClip.id, {
                  ...(script ? { script: script.slice(0, UGC_SCRIPT_MAX_CHARS) } : {}),
                })
                if (!response.success || !response.data) {
                  toast.error(response.message ?? 'Could not generate audio')
                  return
                }
                startRun(response.data, 'audio', selectedClip.id)
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Could not generate audio')
              }
            })
          }}
        />
        {settingsOpen ? (
          <button
            type="button"
            aria-label="Close campaign settings"
            className="fixed inset-0 z-40 bg-black/25 lg:hidden dark:bg-black/45"
            onClick={() => setSettingsOpen(false)}
          />
        ) : null}
        <UgcSettingsSidebar
          workspaceId={workspaceId}
          project={project}
          clip={selectedClip}
          createHref={createHref}
          creatorOpen={creatorOpen}
          applyingPreset={applyingPreset}
          busy={assembling || generatingStill || generatingVideo}
          className={cn(
            'max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-[min(100%,20rem)] max-lg:border-t-0 max-lg:border-l max-lg:shadow-xl',
            !settingsOpen && 'max-lg:hidden',
          )}
          onClose={() => setSettingsOpen(false)}
          onCreatorOpenChange={setCreatorOpen}
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
          onCampaignInfluencerChange={ids => {
            void patchProject({ influencerId: ids[0] ?? null })
          }}
          onCampaignVoiceChange={voice => {
            void persistCampaignVoice(voice, selectedClip?.id)
          }}
          onAspectRatioChange={ratio => {
            void patchProject({ aspectRatio: ratio })
          }}
          onApplyPreset={handleApplyPreset}
          onApplyAssetImage={url => {
            if (!selectedClip) return
            setPickedVideoAttachments({
              clipId: selectedClip.id,
              items: [
                {
                  id: `asset-${url}`,
                  url,
                  kind: 'image',
                  source: 'library',
                  label: 'Reused still',
                  name: 'Scene still',
                },
              ],
            })
            setActiveTab('video')
          }}
          onApplyAssetAudio={applyClipAudio}
        />
      </div>

    </div>
  )
}
