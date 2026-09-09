'use client'

import { CollapseAppSidebarOnMount } from '@/components/sidebars/collapse-app-sidebar-on-mount'
import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import {
  restoreUgcActiveRuns,
  useUgcActiveRuns,
} from '@/components/studio/ugc/_hooks/use-ugc-active-runs'
import { useUgcGeneration } from '@/components/studio/ugc/_hooks/use-ugc-generation'
import { useUgcPersistence } from '@/components/studio/ugc/_hooks/use-ugc-persistence'
import { UgcRunWatcher } from '@/components/studio/ugc/_hooks/use-ugc-run-watcher'
import { UgcClipRail } from '@/components/studio/ugc/ugc-clip-rail'
import { UgcSceneWorkbench, type UgcWorkbenchTab } from '@/components/studio/ugc/ugc-scene-workbench'
import { UgcSettingsSidebar } from '@/components/studio/ugc/ugc-settings-sidebar'
import { UgcStudioTopbar } from '@/components/studio/ugc/ugc-studio-topbar'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { hasUgcProduct, ugcClipGeneratedStills, ugcNeedsCreator } from '@/lib/studio/ugc/ugc-stage'
import { buildCampaignVoicePatches, ugcVoiceEquals } from '@/lib/studio/ugc/voices'
import { cn } from '@/lib/utils'
import {
  applyUgcCampaignPreset,
  createUgcClip,
  deleteUgcClip,
  duplicateUgcClip,
  generateUgcClipScript,
  getUgcProject,
  openUgcProjectEditor,
  updateUgcProject,
} from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type {
  UgcCampaignPresetId,
  UgcClip,
  UgcClipType,
  UgcClipVoice,
  UgcProject,
} from '@socialista/types'
import {
  UGC_DEFAULT_CLIP_TYPE,
  UGC_SCRIPT_MAX_CHARS,
  UGC_STARTER_SCENE_TYPES,
  ugcClipAudioTakeForUrl,
  ugcResolvedClipVoice,
} from '@socialista/types'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import { toast } from 'sonner'

type UgcProjectWorkspaceProps = {
  workspaceId: string
  initialProject: UgcProject
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
  const storeProject = useUgcProjectStore(s => s.project)
  const ensureModels = useUgcProjectStore(s => s.ensureModels)
  const ensureInfluencer = useUgcProjectStore(s => s.ensureInfluencer)
  const hydratedIdRef = useRef<string | null>(null)
  const influencerImportRef = useRef<string | null>(null)

  const project = storeProject?.id === initialProject.id ? storeProject : initialProject
  const [selectedClipId, setSelectedClipId] = useState(initialProject.clips[0]?.id)
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
    videoBusy,
    assembling,
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
    handleAssemble,
    tryAssembleIfReady,
    handleRenderAd,
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

  const readyVideoCount = project.clips.filter(clip => Boolean(clip.videoUrl)).length
  const hasActiveWatchers = activeRuns.length > 0

  useEffect(() => {
    const ids = [project.influencerId, ...project.clips.map(clip => clip.influencerId)].filter(
      (id): id is string => Boolean(id),
    )
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
    scheduleProjectPatch('name', { name })
  }

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
  const videoRun = activeRuns.find(run => run.pipeline === 'video' && run.clipId === selectedClip?.id)
  const generatingStill =
    Boolean(stillsRun && (!stillsRun.clipId || stillsRun.clipId === selectedClip?.id)) ||
    (selectedClip?.status === 'generating' && !selectedClip.videoRunId)
  const generatingVideo =
    Boolean(videoRun) || Boolean(selectedClip?.videoRunId && selectedClip.status === 'generating')
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
      flushDebounced()
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
    [flushDebounced, patchClip, patchClipLocal, project.clips, selectedClip],
  )

  const persistCampaignVoice = useCallback(
    async (voice: UgcClipVoice, clipId?: string) => {
      const patches = buildCampaignVoicePatches(project, voice, clipId)
      if (patches.skip) return

      patchProjectLocal({ voice: patches.campaignVoice })
      if (clipId && patches.localClipPatch) patchClipLocal(clipId, patches.localClipPatch)

      const response = await updateUgcProject(project.id, { voice: patches.campaignVoice })
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not save')
        return
      }

      setProject({
        ...response.data.project,
        voice: patches.campaignVoice,
        clips: clipId
          ? response.data.project.clips.map(item =>
              item.id === clipId
                ? {
                    ...item,
                    voice: patches.disableClip
                      ? voice
                      : patches.clearClipOverride
                        ? undefined
                        : item.voice,
                  }
                : item,
            )
          : response.data.project.clips,
      })

      if (clipId && patches.clipPatch) await patchClip(clipId, patches.clipPatch)
    },
    [patchClip, patchClipLocal, patchProjectLocal, project, setProject],
  )

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

  const createHref = `${DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE}?returnTo=${encodeURIComponent(
    DASHBOARD_ROUTES.STUDIO.ugcProject(project.id),
  )}`
  const totalDurationSec = project.clips.reduce((sum, clip) => sum + (clip.durationSec || 0), 0)

  return (
    <div className="ugc-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <CollapseAppSidebarOnMount />
      {activeRuns.map(run => (
        <UgcRunWatcher
          key={run.key}
          runId={run.runId}
          accessToken={run.accessToken}
          onProgress={(progress, label) => updateRunProgress(run.key, progress, label)}
          onSettled={() => {
            settleRun(run)
            void refreshProject().then(latest => {
              tryAssembleIfReady(latest)
              if (!latest) return
              const message = run.clipId
                ? latest.clips.find(clip => clip.id === run.clipId)?.error
                : latest.error
              if (message) {
                toast.error(message)
                return
              }
              if (run.pipeline === 'assemble') {
                handleOpenEditor()
              }
            })
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
        onGenerateAllPhotos={generateAllPhotos}
        onGenerateAllAudio={() => {
          startGenerateAudio(async () => {
            try {
              await generateAllAudio()
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Could not generate audio')
            }
          })
        }}
        onGenerateAllVideos={() => handleRenderAd(project.clips)}
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
          videoProgress={videoRun?.progress}
          videoProgressLabel={videoRun?.progressLabel}
          busy={assembling}
          onTabChange={setActiveTab}
          onTypeChange={type => {
            if (!selectedClip) return
            void patchClip(selectedClip.id, { type })
          }}
          onAddClip={type => void handleCreateClip(type)}
          onUseStarter={handleStarterSequence}
          onImageSubmit={result => {
            if (!selectedClip) return
            handleImageSubmit(selectedClip, result)
          }}
          onVideoSubmit={result => {
            if (!selectedClip) return
            handleVideoSubmit(selectedClip, result)
          }}
          onUseStills={applyStillUrls}
          onSelectAudio={applyClipAudio}
          onScriptChange={text => {
            if (!selectedClip) return
            patchClipLocal(selectedClip.id, { script: { text, source: 'user' } })
            scheduleClipPatch(selectedClip.id, 'script', { script: { text, source: 'user' } })
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
                flushDebounced()
                await generateClipAudio(selectedClip.id, script)
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
            scheduleProjectPatch('product', {
              productImageUrls: next.imageUrls,
              productName: next.productName,
              productId: next.productId,
              productDescription: next.productDescription ?? null,
              productUrl: next.productUrl ?? null,
              productKind: next.productKind ?? null,
            })
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
