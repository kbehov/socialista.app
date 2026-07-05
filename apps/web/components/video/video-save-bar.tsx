'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useVideoEditorStore } from '@/lib/video/store'
import { createVideo, updateVideo } from '@/services/video.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import { Loader2Icon, SaveIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  return workspace?.id ?? workspace?._id
}

export function VideoSaveBar({ className, showLabel = true }: { className?: string; showLabel?: boolean }) {
  const router = useRouter()
  const workspace = useWorkspaceStore(s => s.currentWorkspace)
  const workspaceId = getWorkspaceId(workspace)
  const project = useVideoEditorStore(s => s.project)
  const setProjectName = useVideoEditorStore(s => s.setProjectName)
  const getProjectPayload = useVideoEditorStore(s => s.getProjectPayload)
  const loadProject = useVideoEditorStore(s => s.loadProject)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!workspaceId || isSaving) return
    setIsSaving(true)
    const payload = getProjectPayload()
    try {
      if (project.id && !project.id.startsWith('project_')) {
        const response = await updateVideo(project.id, {
          name: payload.name,
          resolution: payload.resolution,
          fps: payload.fps,
          duration: payload.duration,
          tracks: payload.tracks,
          clips: payload.clips,
          textOverlays: payload.textOverlays,
          assets: payload.assets,
          status: 'draft',
        })
        if (!response.success) {
          toast.error(response.message ?? 'Failed to save video')
          return
        }
        toast.success('Draft saved')
        return
      }

      const response = await createVideo({
        workspaceId,
        name: payload.name,
        resolution: payload.resolution,
        fps: payload.fps,
        duration: payload.duration,
        tracks: payload.tracks,
        clips: payload.clips,
        textOverlays: payload.textOverlays,
        assets: payload.assets,
      })

      if (!response.success || !response.data?.video) {
        toast.error(response.message ?? 'Failed to save video')
        return
      }

      const { video } = response.data
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
      router.replace(`/dashboard/studio/videos/${video.id}`)
      toast.success('Draft saved')
    } catch {
      toast.error('Failed to save video')
    } finally {
      setIsSaving(false)
    }
  }, [getProjectPayload, isSaving, loadProject, project.id, router, workspaceId])

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
