'use client'

import { StudioTemplatesGallery } from '@/components/studio/templates/studio-templates-gallery'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { createUgcProjectFromTemplate } from '@/services/ugc-project.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { StudioTemplateKind, type StudioTemplateDto } from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function UgcTemplatesGallery({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [pending, startTransition] = useTransition()

  const handleRecreate = (template: StudioTemplateDto) => {
    if (pending) return
    startTransition(async () => {
      const response = await createUgcProjectFromTemplate({
        workspaceId,
        templateId: template._id,
        ...(projectId ? { projectId } : {}),
        ...(template.name ? { name: template.name } : {}),
      })
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not recreate this UGC ad')
        return
      }
      router.push(DASHBOARD_ROUTES.STUDIO.ugcProject(response.data.project.id))
    })
  }

  return (
    <StudioTemplatesGallery
      kind={StudioTemplateKind.UGC}
      onRecreate={handleRecreate}
      emptyDescription="Import UGC templates to start recreating trending ads with your product."
    />
  )
}
