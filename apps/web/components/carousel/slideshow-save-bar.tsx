'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorStore } from '@/lib/carousel/store'
import { flushAllBackgroundTransforms } from '@/lib/carousel/background-transform-flush'
import { createSlideshow, updateSlideshow } from '@/services/slideshow.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import { Loader2Icon, SaveIcon, VideoIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  return workspace?.id ?? workspace?._id
}

type PersistSlideshowResult = {
  id: string
  isNew: boolean
}

export function SlideshowSaveBar({
  className,
  showLabel = true,
}: {
  className?: string
  showLabel?: boolean
}) {
  const router = useRouter()
  const workspace = useWorkspaceStore(s => s.currentWorkspace)
  const workspaceId = getWorkspaceId(workspace)
  const slideshowId = useEditorStore(s => s.slideshowId)
  const slideshowName = useEditorStore(s => s.slideshowName)
  const setSlideshowName = useEditorStore(s => s.setSlideshowName)
  const getProjectPayload = useEditorStore(s => s.getProjectPayload)
  const loadProject = useEditorStore(s => s.loadProject)
  const [isBusy, setIsBusy] = useState(false)

  const persistSlideshowDraft = useCallback(async (): Promise<PersistSlideshowResult | null> => {
    if (!workspaceId) return null

    flushAllBackgroundTransforms()
    const payload = getProjectPayload()
    const isNew = !slideshowId

    try {
      if (slideshowId) {
        const response = await updateSlideshow(slideshowId, {
          name: payload.name,
          canvas: payload.canvas,
          aspectRatioId: payload.aspectRatioId,
          slides: payload.slides,
          status: 'draft',
        })

        if (!response.success) {
          toast.error(response.message ?? 'Failed to save slideshow')
          return null
        }

        return { id: slideshowId, isNew: false }
      }

      const response = await createSlideshow({
        workspaceId,
        name: payload.name,
        canvas: payload.canvas,
        aspectRatioId: payload.aspectRatioId,
        slides: payload.slides,
      })

      if (!response.success || !response.data?.slideshow) {
        toast.error(response.message ?? 'Failed to save slideshow')
        return null
      }

      const { slideshow } = response.data
      loadProject({
        id: slideshow.id,
        name: slideshow.name,
        canvas: slideshow.canvas,
        aspectRatioId: slideshow.aspectRatioId,
        slides: slideshow.slides,
      })

      return { id: slideshow.id, isNew }
    } catch {
      toast.error('Failed to save slideshow')
      return null
    }
  }, [getProjectPayload, loadProject, slideshowId, workspaceId])

  const handleSave = useCallback(async () => {
    if (!workspaceId || isBusy) return
    setIsBusy(true)

    try {
      const result = await persistSlideshowDraft()
      if (!result) return

      if (result.isNew) {
        router.replace(`/dashboard/studio/slideshows/${result.id}`)
      }

      toast.success('Draft saved')
    } finally {
      setIsBusy(false)
    }
  }, [isBusy, persistSlideshowDraft, router, workspaceId])

  const handleCreateVideo = useCallback(async () => {
    if (!workspaceId || isBusy) return
    setIsBusy(true)

    try {
      const result = await persistSlideshowDraft()
      if (!result) return

      router.push(`/dashboard/studio/videos/create?slideshowId=${result.id}`)
    } finally {
      setIsBusy(false)
    }
  }, [isBusy, persistSlideshowDraft, router, workspaceId])

  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      {showLabel ? (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Project name</span>
      ) : null}
      <div className="flex min-w-0 items-center gap-1.5">
        <Input
          value={slideshowName}
          onChange={event => setSlideshowName(event.target.value)}
          placeholder="Untitled slideshow"
          className="h-8 min-w-0 flex-1 border-transparent bg-muted/50 px-2 py-1 text-xs font-medium shadow-none transition-colors focus-visible:border-input focus-visible:bg-background sm:text-sm"
          aria-label="Slideshow name"
        />
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="h-8 shrink-0 px-2.5"
                variant="outline"
                onClick={() => void handleCreateVideo()}
                disabled={isBusy || !workspaceId}
                aria-label="Create video"
              >
                {isBusy ? <Loader2Icon className="size-3.5 animate-spin" /> : <VideoIcon className="size-3.5" />}
                {showLabel ? (
                  <span className="hidden sm:inline">{isBusy ? 'Saving…' : 'Create video'}</span>
                ) : null}
              </Button>
            </TooltipTrigger>
            {!showLabel ? <TooltipContent>Create video</TooltipContent> : null}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="h-8 shrink-0 px-2.5"
                variant={slideshowId ? 'outline' : 'default'}
                onClick={() => void handleSave()}
                disabled={isBusy || !workspaceId}
                aria-label={slideshowId ? 'Save' : 'Save draft'}
              >
                {isBusy ? <Loader2Icon className="size-3.5 animate-spin" /> : <SaveIcon className="size-3.5" />}
                {showLabel ? (
                  <span className="hidden sm:inline">
                    {isBusy ? 'Saving…' : slideshowId ? 'Save' : 'Save draft'}
                  </span>
                ) : null}
              </Button>
            </TooltipTrigger>
            {!showLabel ? (
              <TooltipContent>{slideshowId ? 'Save' : 'Save draft'}</TooltipContent>
            ) : null}
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
