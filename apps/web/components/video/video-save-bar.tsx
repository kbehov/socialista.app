'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { persistVideoAssets } from '@/lib/video/persist-video-assets'
import { useVideoEditorStore } from '@/lib/video/store'
import { isMediaAssetAvailable, type MediaAsset } from '@/lib/video/types'
import { createVideo, updateVideo } from '@/services/video.service'
import { useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import { Loader2Icon, SaveIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  return workspace?.id ?? workspace?._id
}

function applyUsedStorage(
  workspace: NonNullable<ReturnType<typeof useWorkspaceStore.getState>['currentWorkspace']>,
  usedBytes: number,
) {
  return {
    ...workspace,
    usage: {
      ...workspace.usage,
      storage: workspace.usage.storage + usedBytes,
    },
  }
}

export function VideoSaveBar({ className, showLabel = true }: { className?: string; showLabel?: boolean }) {
  const router = useRouter()
  const workspace = useWorkspaceStore(s => s.currentWorkspace)
  const { updateWorkspace } = useWorkspaceStoreActions()
  const workspaceId = getWorkspaceId(workspace)
  const project = useVideoEditorStore(s => s.project)
  const assets = useVideoEditorStore(s => s.assets)
  const setProjectName = useVideoEditorStore(s => s.setProjectName)
  const getProjectPayload = useVideoEditorStore(s => s.getProjectPayload)
  const loadProject = useVideoEditorStore(s => s.loadProject)
  const hydrateRuntimeAssets = useVideoEditorStore(s => s.hydrateRuntimeAssets)
  const applyPersistedAssets = useVideoEditorStore(s => s.applyPersistedAssets)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!workspaceId || isSaving) return
    setIsSaving(true)
    const payload = getProjectPayload()
    try {
      const { assets: persistedAssets, uploadedBytes } = await persistVideoAssets(
        workspaceId,
        payload.assets,
        assets,
      )

      if (uploadedBytes > 0 && workspace) {
        updateWorkspace(applyUsedStorage(workspace, uploadedBytes))
      }

      const savePayload = { ...payload, assets: persistedAssets }

      if (project.id && !project.id.startsWith('project_')) {
        const response = await updateVideo(project.id, {
          name: savePayload.name,
          resolution: savePayload.resolution,
          fps: savePayload.fps,
          duration: savePayload.duration,
          tracks: savePayload.tracks,
          clips: savePayload.clips,
          textOverlays: savePayload.textOverlays,
          assets: savePayload.assets,
          status: 'draft',
        })
        if (!response.success) {
          toast.error(response.message ?? 'Failed to save video')
          return
        }
        applyPersistedAssets(persistedAssets)
        toast.success('Draft saved')
        return
      }

      const response = await createVideo({
        workspaceId,
        name: savePayload.name,
        resolution: savePayload.resolution,
        fps: savePayload.fps,
        duration: savePayload.duration,
        tracks: savePayload.tracks,
        clips: savePayload.clips,
        textOverlays: savePayload.textOverlays,
        assets: savePayload.assets,
      })

      if (!response.success || !response.data?.video) {
        toast.error(response.message ?? 'Failed to save video')
        return
      }

      const { video } = response.data
      const runtimeSnapshot = Object.values(assets).filter(isMediaAssetAvailable) as MediaAsset[]
      loadProject({
        id: video.id,
        name: video.name,
        project: {
          id: video.id,
          name: video.name,
          duration: video.duration,
          resolution: video.resolution,
          fps: video.fps,
          tracks: video.tracks,
          clips: video.clips,
          textOverlays: video.textOverlays,
          assets: video.assets,
        },
      })
      hydrateRuntimeAssets(
        runtimeSnapshot.map(asset => {
          const persisted = video.assets.find(item => item.id === asset.id)
          return persisted
            ? { ...asset, url: persisted.url, fileId: persisted.fileId }
            : asset
        }),
      )
      router.replace(DASHBOARD_ROUTES.STUDIO.video(video.id))
      toast.success('Draft saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save video')
    } finally {
      setIsSaving(false)
    }
  }, [
    applyPersistedAssets,
    assets,
    getProjectPayload,
    hydrateRuntimeAssets,
    isSaving,
    loadProject,
    project.id,
    router,
    updateWorkspace,
    workspace,
    workspaceId,
  ])

  const isPersisted = Boolean(project.id) && !project.id.startsWith('project_')

  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      {showLabel ? (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Project name</span>
      ) : null}
      <div className="flex min-w-0 items-center gap-1.5">
        <Input
          value={project.name}
          onChange={event => setProjectName(event.target.value)}
          placeholder="Untitled video"
          className="h-8 min-w-0 flex-1 border-transparent bg-muted/50 px-2 py-1 text-xs font-medium shadow-none transition-colors focus-visible:border-input focus-visible:bg-background sm:text-sm"
          aria-label="Video name"
        />
        <Button
          size="sm"
          className="h-8 shrink-0 px-2.5"
          variant={isPersisted ? 'outline' : 'default'}
          onClick={() => void handleSave()}
          disabled={isSaving || !workspaceId}
        >
          {isSaving ? <Loader2Icon className="size-3.5 animate-spin" /> : <SaveIcon className="size-3.5" />}
          <span className="hidden sm:inline">
            {isSaving ? 'Saving…' : isPersisted ? 'Save' : 'Save draft'}
          </span>
        </Button>
      </div>
    </div>
  )
}
