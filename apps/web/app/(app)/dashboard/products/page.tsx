import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/headers/page-header'
import { AddProductTrigger } from '@/components/products/add-product-trigger'
import { ProductsTable } from '@/components/tables/products.table'
import { Button } from '@/components/ui/button'
import { WorkspaceRequired } from '../_components/workspace-required'
import { getWorkspaceProducts } from '@/services/product.service'
import { formatItemCount } from '@/utils/format'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { PackageIcon, ShoppingBagIcon } from 'lucide-react'

export default async function ProductsPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view products." />
  }

  const response = await getWorkspaceProducts(workspace.id)
  const products = response.data?.products ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Products"
        description={`${formatItemCount(products.length)} in ${workspace.name}`}
        actions={<AddProductTrigger workspaceId={workspace.id} />}
      />

      {!response.success ? (
        <ErrorState
          title={response.message ?? 'Failed to load products'}
          description="Refresh the page to try again."
          className="flex-1 rounded-xl"
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={ShoppingBagIcon}
          title="Build your product catalog"
          description="Import products from any store URL to use them in slideshows, videos, and campaigns."
          minHeight="lg"
          variant="default"
          className="flex-1 rounded-2xl border-border/60 bg-gradient-to-b from-muted/30 to-muted/10"
          iconClassName="size-12 rounded-2xl border-0 bg-background shadow-xs ring-1 ring-border/60 [&_svg]:size-5"
          action={
            <>
              <AddProductTrigger
                workspaceId={workspace.id}
                label="Import from URL"
                showPlusIcon={false}
              />
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
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  )
}
