import { TemplateActions } from '../_components/template-actions'
import { TemplateCategoriesGrid } from '../_components/template-categories-grid'
import { mergeStudioTemplateCategories } from '../_lib/merge-categories'
import { PageHeader } from '@/components/headers/page-header'
import { getStudioTemplateCategories } from '@/services/studio-templates.service'
import { StudioTemplateKind } from '@socialista/types'

export default async function TemplateCategoriesPage() {
  const [imageCategoriesResult, videoCategoriesResult] = await Promise.all([
    getStudioTemplateCategories(StudioTemplateKind.IMAGE),
    getStudioTemplateCategories(StudioTemplateKind.VIDEO),
  ])

  const categories = mergeStudioTemplateCategories([
    imageCategoriesResult.data?.categories ?? [],
    videoCategoriesResult.data?.categories ?? [],
  ])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Categories"
        description="Shared groups for image and video templates."
        actions={<TemplateActions defaultKind={StudioTemplateKind.IMAGE} categories={categories} />}
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Templates', href: '/manager/templates' },
          { label: 'Categories' },
        ]}
      />

      <TemplateCategoriesGrid categories={categories} />
    </div>
  )
}
