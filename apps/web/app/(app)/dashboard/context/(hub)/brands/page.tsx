import { AddBrandTrigger } from '@/components/brands/add-brand-trigger'
import { BrandsList } from '@/components/brands/brands-list'
import { ErrorState } from '@/components/common/error-state'
import { getWorkspaceBrands } from '@/services/brand.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'

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
        className="flex-1"
      />
    )
  }

  if (brands.length === 0) {
    return (
      <section className="flex min-h-0 flex-1 flex-col justify-center py-12 sm:py-16">
        <h2 className="text-lg font-medium tracking-[-0.02em] text-foreground">
          Add your first brand
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/64">
          Store name, logo, colors, and positioning so AI tools can stay on-brand.
        </p>

        <div className="mt-8">
          <AddBrandTrigger workspaceId={workspace.id} />
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <p className="mb-6 text-sm text-foreground/56">
        {brands.length} {brands.length === 1 ? 'brand' : 'brands'}
      </p>
      <BrandsList brands={brands} workspaceId={workspace.id} />
    </section>
  )
}
