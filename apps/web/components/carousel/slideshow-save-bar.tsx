'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEditorStore } from '@/lib/carousel/store'
import { createSlideshow, updateSlideshow } from '@/services/slideshow.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import { Loader2Icon, SaveIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  return workspace?.id ?? workspace?._id
}

export function SlideshowSaveBar() {
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
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Input
        value={slideshowName}
        onChange={event => setSlideshowName(event.target.value)}
        placeholder="Untitled slideshow"
        className="h-10 min-w-0 flex-1 px-3 text-base font-medium"
        aria-label="Slideshow name"
      />
      <Button
        className="h-10 w-full shrink-0 px-4 sm:w-auto"
        onClick={() => void handleSave()}
        disabled={isSaving || !workspaceId}
      >
        {isSaving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
        {isSaving ? 'Saving…' : slideshowId ? 'Save draft' : 'Save as draft'}
      </Button>
    </div>
  )
}
