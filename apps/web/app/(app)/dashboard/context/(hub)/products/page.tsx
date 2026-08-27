import { ErrorState } from "@/components/common/error-state";
import { AddProductTrigger } from "@/components/products/add-product-trigger";
import { ProductsTable } from "@/components/tables/products.table";
import { getWorkspaceProducts } from "@/services/product.service";
import { getCurrentWorkspaceContext } from "@/utils/project.utils.server";

export default async function ContextProductsPage() {
  const { workspace, project } = await getCurrentWorkspaceContext();

  if (!workspace) return null;

  const response = await getWorkspaceProducts(workspace.id, {
    projectId: project?.id,
  });
  const products = response.data?.products ?? [];

  if (!response.success) {
    return (
      <ErrorState
        title={response.message ?? "Failed to load products"}
        description="Refresh the page to try again."
        className="flex-1"
      />
    );
  }

  if (products.length === 0) {
    return (
      <section className="flex min-h-0 flex-1 flex-col justify-center py-10 sm:py-14">
        <h2 className="text-lg font-medium tracking-[-0.02em] text-foreground">
          Build your product catalog
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/64">
          Import from a store URL or add a product by hand for slideshows,
          videos, and campaigns.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <AddProductTrigger
            workspaceId={workspace.id}
            label="Import from URL"
            showPlusIcon={false}
            defaultTab="url"
          />
          <AddProductTrigger
            workspaceId={workspace.id}
            label="Manual entry"
            variant="outline"
            showPlusIcon={false}
            defaultTab="manual"
          />
        </div>

        <p className="mt-6 text-sm text-foreground/56">
          Supports Shopify, WooCommerce, and most standard product pages.
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <ProductsTable products={products} />
    </section>
  );
}
