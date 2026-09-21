import { TaxonomyGrid } from '../../_components/taxonomy-grid'
import { PageHeader } from '@/components/headers/page-header'
import { InspirationActions } from '@/components/inspirations/inspiration-actions'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import { getInspirationCategories } from '@/services/inspiration.service'
import { TagsIcon } from 'lucide-react'

export default async function CategoriesPage() {
  const categories = await getInspirationCategories('limit=100&sort=name')
  const items = categories.data?.categories ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Categories"
        description="Groups used to filter inspirations."
        actions={<InspirationActions />}
        breadcrumbs={[
          { label: 'Manager', href: MANAGER_ROUTES.ROOT },
          { label: 'Inspirations', href: MANAGER_ROUTES.INSPIRATIONS },
          { label: 'Categories' },
        ]}
      />
      <TaxonomyGrid
        items={items}
        emptyIcon={TagsIcon}
        emptyTitle="No categories yet"
        emptyDescription="Create a category so inspirations can be grouped and filtered."
        countLabel={count => `${count} ${count === 1 ? 'inspiration' : 'inspirations'}`}
      />
    </div>
  )
}
