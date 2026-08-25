import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ContextHubSection } from '@/components/context/context-hub-section'
import { dashboardSurface } from '@/components/dashboard'
import { AddProductTrigger } from '@/components/products/add-product-trigger'
import { ProductsTable } from '@/components/tables/products.table'
import { Button } from '@/components/ui/button'
import { getWorkspaceProducts } from '@/services/product.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { PackageIcon, ShoppingBagIcon } from 'lucide-react'

export default async function ContextProductsPage() {
  const { workspace, project } = await getCurrentWorkspaceContext()

  if (!workspace) return null

  const response = await getWorkspaceProducts(workspace.id, { projectId: project?.id })
  const products = response.data?.products ?? []

  if (!response.success) {
    return (
      <ErrorState
        title={response.message ?? 'Failed to load products'}
        description="Refresh the page to try again."
        className="flex-1 rounded-xl"
      />
    )
  }

  if (products.length === 0) {
    return (
      <ContextHubSection label="Products">
        <EmptyState
          icon={ShoppingBagIcon}
          title="Build your product catalog"
          description="Import products from any store URL to use them in slideshows, videos, and campaigns."
          minHeight="lg"
          variant="ghost"
          className="flex-1"
          iconClassName={dashboardSurface.emptyIcon}
          action={
            <>
              <AddProductTrigger workspaceId={workspace.id} label="Import from URL" showPlusIcon={false} />
              <Button size="sm" variant="outline" className="h-9 rounded-full px-4" disabled>
                <PackageIcon className="size-3.5" />
                Manual entry
              </Button>
            </>
          }
          footer={
            <p className="mt-6 text-[11px] text-muted-foreground">
              Supports Shopify, WooCommerce, and most standard product pages.
            </p>
          }
        />
      </ContextHubSection>
    )
  }

  return (
    <ContextHubSection label="Products">
      <div className="min-h-0 flex-1 overflow-auto p-1">
        <ProductsTable products={products} className="border-0 shadow-none" />
      </div>
    </ContextHubSection>
  )
}
