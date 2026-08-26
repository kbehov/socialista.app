import { AddBrandTrigger } from '@/components/brands/add-brand-trigger'
import { BrandsList } from '@/components/brands/brands-list'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ContextHubSection } from '@/components/context/context-hub-section'
import { dashboardSurface } from '@/components/dashboard'
import { getWorkspaceBrands } from '@/services/brand.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { PaletteIcon } from 'lucide-react'

export default async function ContextBrandsPage() {
  const { workspace, project } = await getCurrentWorkspaceContext()

  if (!workspace) return null

  const response = await getWorkspaceBrands(workspace.id, { projectId: project?.id })
  const brands = response.data?.brands ?? []

  if (!response.success) {
    return (
      <ErrorState
        title={response.message ?? 'Failed to load brands'}
        description="Refresh the page to try again."
        className="flex-1 rounded-xl"
      />
    )
  }

  if (brands.length === 0) {
    return (
      <ContextHubSection label="Brands">
        <EmptyState
          icon={PaletteIcon}
          title="Add your first brand"
          description="Store name, logo, colors, and positioning so AI tools can stay on-brand."
          minHeight="lg"
          variant="ghost"
          className="flex-1"
          iconClassName={dashboardSurface.emptyIcon}
          action={<AddBrandTrigger workspaceId={workspace.id} />}
        />
      </ContextHubSection>
    )
  }

  return (
    <ContextHubSection label="Brands">
      <div className="min-h-0 flex-1 overflow-auto p-1">
        <BrandsList brands={brands} workspaceId={workspace.id} className="border-0 shadow-none" />
      </div>
    </ContextHubSection>
  )
}
