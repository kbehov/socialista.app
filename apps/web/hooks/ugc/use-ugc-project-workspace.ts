'use client'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  restoreUgcActiveRuns,
  useUgcActiveRuns,
} from '@/hooks/ugc/use-ugc-active-runs'
import { useUgcClipActions } from '@/hooks/ugc/use-ugc-clip-actions'
import { useUgcClipMedia } from '@/hooks/ugc/use-ugc-clip-media'
import { useUgcGeneration } from '@/hooks/ugc/use-ugc-generation'
import { useUgcPersistence } from '@/hooks/ugc/use-ugc-persistence'
import { useUgcPlanWorkflow } from '@/hooks/ugc/use-ugc-plan-workflow'
import { hasUgcProduct, ugcNeedsCreator } from '@/lib/studio/ugc/ugc-stage'
import {
  generateUgcClipScript,
  getUgcProject,
  openUgcProjectEditor,
} from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcWorkbenchTab } from '@/types/ugc.types'
import { ugcSceneWorkbenchConfig } from '@/utils/ugc/scene.utils'
import type { UgcProject } from '@socialista/types'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import { toast } from 'sonner'

export function useUgcProjectWorkspace({
  workspaceId,
  initialProject,
}: {
  workspaceId: string
  initialProject: UgcProject
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrate = useUgcProjectStore(s => s.hydrate)
  const setProject = useUgcProjectStore(s => s.setProject)
  const storeProject = useUgcProjectStore(s => s.project)
  const ensureModels = useUgcProjectStore(s => s.ensureModels)
  const ensureInfluencer = useUgcProjectStore(s => s.ensureInfluencer)
  const hydratedIdRef = useRef<string | null>(null)
  const influencerImportRef = useRef<string | null>(null)

  const project =
    storeProject?.id === initialProject.id ? storeProject : initialProject

  const [selectedClipId, setSelectedClipId] = useState(initialProject.clips[0]?.id)
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<UgcWorkbenchTab>('image')
  const [writingScript, startWriteScript] = useTransition()
  const [generatingAudio, startGenerateAudio] = useTransition()
  const [openingProjectEditor, startOpenProjectEditor] = useTransition()

  const {
    patchProject,
    patchClip,
    patchProjectLocal,
    patchClipLocal,
    scheduleProjectPatch,
    scheduleClipPatch,
    flushDebounced,
  } = useUgcPersistence(project.id)

  const {
    activeRuns,
    setActiveRuns,
    startRun,
    updateRunProgress,
    settleRun,
    runsByClipId,
    stillsRun,
    anyGenerating,
  } = useUgcActiveRuns({ project })

  const refreshProject = useCallback(async () => {
    const response = await getUgcProject(project.id)
    if (response.success && response.data?.project) {
      setProject(response.data.project)
      return response.data.project
    }
    return null
  }, [project.id, setProject])

  const {
    handleRunSettled,
    generateAllVideos,
    handleImageSubmit,
    handleVideoSubmit,
    generateAllPhotos,
    generateAllAudio,
    generateClipAudio,
  } = useUgcGeneration({
    projectId: project.id,
    project,
    patchProject,
    patchProjectLocal,
    patchClip,
    patchClipLocal,
    startRun,
  })

  const plan = useUgcPlanWorkflow({
    project,
    onSelectClip: setSelectedClipId,
  })

  const clipActions = useUgcClipActions({
    project,
    onSelectClip: setSelectedClipId,
    patchProjectLocal,
    patchProject,
  })

  const selectedClip =
    project.clips.find(clip => clip.id === selectedClipId) ?? project.clips[0]

  const sceneTabs = selectedClip
    ? ugcSceneWorkbenchConfig(selectedClip.type).tabs
    : (['image', 'audio', 'video'] as UgcWorkbenchTab[])
  const workbenchTab = sceneTabs.includes(activeTab)
    ? activeTab
    : (sceneTabs[0] ?? 'image')

  const media = useUgcClipMedia({
    project,
    selectedClip,
    patchClip,
    patchClipLocal,
    patchProjectLocal,
    flushDebounced,
    onTabChange: setActiveTab,
  })

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
    setActiveRuns(restoreUgcActiveRuns(initialProject))
  }, [hydrate, initialProject, setActiveRuns])

  const allScenesReady =
    project.clips.length > 0 &&
    project.clips.every(clip => Boolean(clip.videoUrl))
  const hasActiveWatchers = activeRuns.length > 0

  useEffect(() => {
    const ids = [
      project.influencerId,
      ...project.clips.map(clip => clip.influencerId),
    ].filter((id): id is string => Boolean(id))
    for (const id of new Set(ids)) {
      void ensureInfluencer(id)
    }
  }, [ensureInfluencer, project.clips, project.influencerId])

  useEffect(() => {
    if (!anyGenerating || hasActiveWatchers) return
    const interval = window.setInterval(() => {
      void refreshProject()
    }, 2500)
    return () => window.clearInterval(interval)
  }, [anyGenerating, hasActiveWatchers, refreshProject])

  const influencerParam = searchParams.get('influencer')
  useEffect(() => {
    if (!influencerParam || influencerImportRef.current === influencerParam) return
    influencerImportRef.current = influencerParam
    void patchProject({ influencerId: influencerParam })
    setCreatorOpen(true)
    router.replace(DASHBOARD_ROUTES.STUDIO.ugcProject(project.id))
  }, [influencerParam, patchProject, project.id, router])

  const handleNameChange = useCallback(
    (name: string) => {
      patchProjectLocal({ name })
      scheduleProjectPatch('name', { name })
    },
    [patchProjectLocal, scheduleProjectPatch],
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

  const clipRun = selectedClip ? runsByClipId[selectedClip.id] : undefined
  const videoRun = activeRuns.find(
    run => run.pipeline === 'video' && run.clipId === selectedClip?.id,
  )
  const generatingStill =
    Boolean(
      stillsRun && (!stillsRun.clipId || stillsRun.clipId === selectedClip?.id),
    ) ||
    (selectedClip?.status === 'generating' && !selectedClip.videoRunId)
  const generatingVideo =
    Boolean(videoRun) ||
    Boolean(selectedClip?.videoRunId && selectedClip.status === 'generating')
  const audioBusy =
    generatingAudio ||
    activeRuns.some(
      run =>
        run.pipeline === 'audio' &&
        (!run.clipId || run.clipId === selectedClip?.id),
    )
  const settingsIncomplete =
    !hasUgcProduct(project) ||
    (ugcNeedsCreator(project) && !project.influencerId)

  const createHref = `${DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE}?returnTo=${encodeURIComponent(
    DASHBOARD_ROUTES.STUDIO.ugcProject(project.id),
  )}`
  const totalDurationSec = project.clips.reduce(
    (sum, clip) => sum + (clip.durationSec || 0),
    0,
  )

  const handleWriteScript = useCallback(() => {
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
  }, [project.id, project.models.script, selectedClip, setProject])

  const handleScriptChange = useCallback(
    (text: string) => {
      if (!selectedClip) return
      patchClipLocal(selectedClip.id, {
        script: { text, source: 'user' },
      })
      scheduleClipPatch(selectedClip.id, 'script', {
        script: { text, source: 'user' },
      })
    },
    [patchClipLocal, scheduleClipPatch, selectedClip],
  )

  const handleGenerateClipAudio = useCallback(
    (script?: string) => {
      if (!selectedClip) return
      startGenerateAudio(async () => {
        try {
          flushDebounced()
          await generateClipAudio(selectedClip.id, script)
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Could not generate audio',
          )
        }
      })
    },
    [flushDebounced, generateClipAudio, selectedClip],
  )

  const handleGenerateAllAudio = useCallback(() => {
    startGenerateAudio(async () => {
      try {
        await generateAllAudio()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Could not generate audio',
        )
      }
    })
  }, [generateAllAudio])

  const handleRunWatcherSettled = useCallback(
    (run: (typeof activeRuns)[number]) => {
      settleRun(run)
      void refreshProject().then(latest => {
        handleRunSettled(latest)
        if (!latest) return
        const message = run.clipId
          ? latest.clips.find(clip => clip.id === run.clipId)?.error
          : latest.error
        if (message) toast.error(message)
      })
    },
    [handleRunSettled, refreshProject, settleRun],
  )

  return {
    workspaceId,
    project,
    selectedClip,
    selectedClipId: selectedClip?.id,
    setSelectedClipId,
    creatorOpen,
    setCreatorOpen,
    settingsOpen,
    setSettingsOpen,
    activeTab: workbenchTab,
    setActiveTab,
    writingScript,
    generatingAudio: audioBusy,
    generatingStill,
    generatingVideo,
    openingProjectEditor,
    allScenesReady,
    anyGenerating,
    settingsIncomplete,
    createHref,
    totalDurationSec,
    activeRuns,
    runsByClipId,
    clipRun,
    stillsRun,
    videoRun,
    updateRunProgress,
    handleRunWatcherSettled,
    handleNameChange,
    handleOpenEditor,
    handleWriteScript,
    handleScriptChange,
    handleGenerateClipAudio,
    handleGenerateAllAudio,
    generateAllPhotos,
    generateAllVideos,
    handleImageSubmit,
    handleVideoSubmit,
    patchProject,
    patchProjectLocal,
    patchClip,
    scheduleProjectPatch,
    ...plan,
    ...clipActions,
    ...media,
  }
}
