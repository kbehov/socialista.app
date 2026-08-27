'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { flushAllBackgroundTransforms } from '@/lib/carousel/background-transform-flush'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import { createSlideshow, updateSlideshow } from '@/services/slideshow.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { useWorkspaceStore } from '@/store/workspace.store'
import { Loader2Icon, SaveIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  return workspace?.id ?? workspace?._id
}

type PersistSlideshowResult = {
  id: string
  isNew: boolean
}

type BusyAction = 'save' | 'create-video' | 'post-now' | 'autosave' | null

function formatSavedAt(timestamp: number | null): string | null {
  if (!timestamp) return null
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(timestamp))
  } catch {
    return null
  }
}

const AUTOSAVE_DELAY_MS = 2000

export function SlideshowSaveBar({
  className,
  showLabel = true,
  compact = false,
}: {
  className?: string
  showLabel?: boolean
  compact?: boolean
}) {
  const router = useRouter()
  const workspace = useWorkspaceStore(s => s.currentWorkspace)
  const workspaceId = getWorkspaceId(workspace)
  const studioProjectId = useProjectStore(s => getProjectId(s.currentProject))
  const slideshowId = useEditorStore(s => s.slideshowId)
  const slideshowName = useEditorStore(s => s.slideshowName)
  const setSlideshowName = useEditorStore(s => s.setSlideshowName)
  const getProjectPayload = useEditorStore(s => s.getProjectPayload)
  const loadProject = useEditorStore(s => s.loadProject)
  const markClean = useEditorStore(s => s.markClean)
  const isDirty = useEditorStore(s => s.isDirty)
  const lastSavedAt = useEditorStore(s => s.lastSavedAt)
  const [busyAction, setBusyAction] = useState<BusyAction>(null)
  const isBusy = busyAction !== null && busyAction !== 'autosave'
  const savedLabel = formatSavedAt(lastSavedAt)
  const autosaveTimerRef = useRef<number | null>(null)
  const persistRef = useRef<() => Promise<PersistSlideshowResult | null>>(async () => null)

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!useEditorStore.getState().isDirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

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

        markClean()
        return { id: slideshowId, isNew: false }
      }

      const response = await createSlideshow({
        workspaceId,
        projectId: studioProjectId,
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
  }, [getProjectPayload, loadProject, markClean, slideshowId, studioProjectId, workspaceId])

  useEffect(() => {
    persistRef.current = persistSlideshowDraft
  }, [persistSlideshowDraft])

  const handleSave = useCallback(async () => {
    if (!workspaceId || isBusy) return
    setBusyAction('save')

    try {
      const result = await persistSlideshowDraft()
      if (!result) return

      if (result.isNew) {
        router.replace(DASHBOARD_ROUTES.STUDIO.slideshow(result.id))
      }

      toast.success('Draft saved')
    } finally {
      setBusyAction(null)
    }
  }, [isBusy, persistSlideshowDraft, router, workspaceId])

  const handleCreateVideo = useCallback(async () => {
    if (!workspaceId || isBusy) return
    setBusyAction('create-video')

    try {
      const result = await persistSlideshowDraft()
      if (!result) return

      router.push(`${DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE}?slideshowId=${result.id}`)
    } finally {
      setBusyAction(null)
    }
  }, [isBusy, persistSlideshowDraft, router, workspaceId])

  const handlePostNow = useCallback(async () => {
    if (!workspaceId || isBusy) return
    setBusyAction('post-now')

    try {
      const result = await persistSlideshowDraft()
      if (!result) return

      router.push(DASHBOARD_ROUTES.createPost({ slideshowId: result.id }))
    } finally {
      setBusyAction(null)
    }
  }, [isBusy, persistSlideshowDraft, router, workspaceId])

  useEffect(() => {
    const onSave = () => {
      void handleSave()
    }
    const onCreateVideo = () => {
      void handleCreateVideo()
    }
    const onPostNow = () => {
      void handlePostNow()
    }
    window.addEventListener('slideshow:save', onSave)
    window.addEventListener('slideshow:create-video', onCreateVideo)
    window.addEventListener('slideshow:post-now', onPostNow)
    return () => {
      window.removeEventListener('slideshow:save', onSave)
      window.removeEventListener('slideshow:create-video', onCreateVideo)
      window.removeEventListener('slideshow:post-now', onPostNow)
    }
  }, [handleCreateVideo, handlePostNow, handleSave])

  // Autosave only after the project already exists (first save needs an explicit action / name)
  useEffect(() => {
    if (!workspaceId || !slideshowId || !isDirty) return
    if (busyAction === 'save' || busyAction === 'create-video' || busyAction === 'post-now') return

    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = window.setTimeout(() => {
      void (async () => {
        setBusyAction('autosave')
        try {
          await persistRef.current()
        } finally {
          setBusyAction(null)
        }
      })()
    }, AUTOSAVE_DELAY_MS)

    return () => {
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current)
    }
  }, [busyAction, isDirty, slideshowId, workspaceId])

  const statusText = !workspaceId
    ? 'Select a workspace to save'
    : busyAction === 'save' || busyAction === 'autosave'
      ? 'Saving…'
      : isDirty
        ? 'Unsaved changes'
        : savedLabel
          ? `Saved ${savedLabel}`
          : slideshowId
            ? 'Saved'
            : 'Not saved yet'

  const saveVariant = !slideshowId ? 'default' : isDirty ? 'outline' : 'ghost'

  return (
    <div className={cn('flex min-w-0 items-center gap-1', className)}>
      {showLabel && !compact ? (
        <span className="sr-only">Project name</span>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0">
        <Input
          value={slideshowName}
          onChange={event => setSlideshowName(event.target.value)}
          placeholder="Untitled slideshow"
          className={cn(
            'h-7 min-w-0 w-full border-transparent bg-transparent px-1.5 py-0 text-xs font-medium tracking-tight shadow-none',
            'transition-colors hover:bg-foreground/[0.04] focus-visible:border-input focus-visible:bg-background',
            compact && 'max-w-40 sm:max-w-none',
          )}
          aria-label="Slideshow name"
        />
        <p className="sr-only" aria-live="polite">
          {statusText}
        </p>
      </div>
      {!compact ? (
        <span className="hidden truncate text-[11px] leading-none text-muted-foreground sm:inline">
          {statusText}
        </span>
      ) : (
        <span
          className={cn(
            'hidden size-1.5 shrink-0 rounded-full sm:block',
            !workspaceId || isDirty || busyAction === 'save' || busyAction === 'autosave'
              ? 'bg-foreground'
              : 'bg-foreground/25',
          )}
          aria-hidden
          title={statusText}
        />
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={compact ? 'icon-sm' : 'sm'}
            className={cn('shrink-0', compact ? 'size-7' : 'h-7 px-2')}
            variant={saveVariant}
            onClick={() => void handleSave()}
            disabled={isBusy || !workspaceId}
            aria-label={slideshowId ? 'Save' : 'Save draft'}
          >
            {busyAction === 'save' ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <SaveIcon className="size-3.5" strokeWidth={1.75} />
            )}
            {showLabel && !compact ? (
              <span className="hidden sm:inline">
                {busyAction === 'save' ? 'Saving…' : slideshowId ? 'Save' : 'Save draft'}
              </span>
            ) : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {statusText} <Kbd className="ml-1">⌘S</Kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
