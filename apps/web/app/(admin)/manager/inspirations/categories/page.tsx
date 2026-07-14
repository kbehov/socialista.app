import { PageHeader } from '@/components/headers/page-header'
import { InspirationActions } from '@/components/inspirations/inspiration-actions'
import { getInspirationCategories } from '@/services/inspiration.service'
export default async function CategoriesPage() {
  const categories = await getInspirationCategories('limit=100&sort=name')
  console.log(categories.data?.categories)
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Categories"
        description="Manage categories"
        actions={<InspirationActions />}
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Inspirations', href: '/manager/inspirations' },
          { label: 'Categories' },
        ]}
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 ">
        {categories.data?.categories.map(category => (
          <div key={category._id} className="group">
            <div className="flex items-center gap-2 group-hover:border border-border rounded-lg p-1 transition-colors">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-2xl">{category.icon}</span>
              </div>
              <div className="text-sm font-medium">{category.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
