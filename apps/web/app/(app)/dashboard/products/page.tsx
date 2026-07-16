import { EmptyState } from '@/components/common/empty-state'
import { getProducts } from '@/services/product.service'
export default async function ProductsPage() {
  const products = await getProducts()
  console.log(products)

  if (products.success && products.data?.length === 0) {
    return <EmptyState title="No products found" description="You don't have any products yet" />
  }

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.data?.map(product => (
          <li key={product._id}>{product.name}</li>
        ))}
      </ul>
    </div>
  )
}
