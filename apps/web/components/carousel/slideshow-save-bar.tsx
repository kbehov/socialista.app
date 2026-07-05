'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEditorStore } from '@/lib/carousel/store'
import { flushAllBackgroundTransforms } from '@/lib/carousel/background-transform-flush'
import { createSlideshow, updateSlideshow } from '@/services/slideshow.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import { Loader2Icon, SaveIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  return workspace?.id ?? workspace?._id
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
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!workspaceId || isSaving) return
    setIsSaving(true)

    flushAllBackgroundTransforms()
    const payload = getProjectPayload()

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
          return
        }

        toast.success('Draft saved')
        return
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
        return
      }

      const { slideshow } = response.data
      loadProject({
        id: slideshow.id,
        name: slideshow.name,
        canvas: slideshow.canvas,
        aspectRatioId: slideshow.aspectRatioId,
        slides: slideshow.slides,
      })
      router.replace(`/dashboard/studio/slideshows/${slideshow.id}`)
      toast.success('Draft saved')
    } catch {
      toast.error('Failed to save slideshow')
    } finally {
      setIsSaving(false)
    }
  }, [getProjectPayload, isSaving, loadProject, router, slideshowId, workspaceId])

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
        <Button
          size="sm"
          className="h-8 shrink-0 px-2.5"
          variant={slideshowId ? 'outline' : 'default'}
          onClick={() => void handleSave()}
          disabled={isSaving || !workspaceId}
        >
          {isSaving ? <Loader2Icon className="size-3.5 animate-spin" /> : <SaveIcon className="size-3.5" />}
          <span className="hidden sm:inline">
            {isSaving ? 'Saving…' : slideshowId ? 'Save' : 'Save draft'}
          </span>
        </Button>
      </div>
    </div>
  )
}
