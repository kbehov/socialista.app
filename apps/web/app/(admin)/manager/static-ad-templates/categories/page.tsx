import { StaticAdTemplateActions } from '../_components/static-ad-template-actions'
import { StaticAdTemplateCategoriesGrid } from '../_components/static-ad-template-categories-grid'
import { PageHeader } from '@/components/headers/page-header'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import { getStaticAdTemplateCategories } from '@/services/static-ad-templates.service'

export default async function StaticAdTemplateCategoriesPage() {
  const categoriesResult = await getStaticAdTemplateCategories()
  const categories = categoriesResult.data?.categories ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Categories"
        description="Groups for filtering static ad templates in the studio."
        actions={<StaticAdTemplateActions categories={categories} />}
        breadcrumbs={[
          { label: 'Manager', href: MANAGER_ROUTES.ROOT },
          { label: 'Static ad templates', href: MANAGER_ROUTES.STATIC_AD_TEMPLATES },
          { label: 'Categories' },
        ]}
      />

      <StaticAdTemplateCategoriesGrid categories={categories} />
    </div>
  )
}
