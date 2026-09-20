'use client'

import { StudioTemplatesGallery } from '@/components/studio/templates/studio-templates-gallery'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { createSlideshowFromTemplate } from '@/services/slideshow.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { StudioTemplateKind, type StudioTemplateDto } from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function SlideshowTemplatesGallery({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [pending, startTransition] = useTransition()

  const handleRecreate = (template: StudioTemplateDto) => {
    if (pending) return
    startTransition(async () => {
      const response = await createSlideshowFromTemplate({
        workspaceId,
        templateId: template._id,
        ...(projectId ? { projectId } : {}),
        ...(template.name ? { name: template.name } : {}),
      })
      if (!response.success || !response.data?.slideshow) {
        toast.error(response.message ?? 'Could not recreate this slideshow')
        return
      }
      router.push(DASHBOARD_ROUTES.STUDIO.slideshow(response.data.slideshow.id))
    })
  }

  return (
    <StudioTemplatesGallery
      kind={StudioTemplateKind.SLIDESHOW}
      onRecreate={handleRecreate}
      emptyDescription="Import slideshow templates to start recreating carousels from a reference."
    />
  )
}
