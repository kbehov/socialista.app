import { StaticAdTemplateActions } from './_components/static-ad-template-actions'
import { StaticAdTemplatesList } from './_components/static-ad-templates-list'
import { StaticAdTemplatesToolbar } from './_components/static-ad-templates-toolbar'
import { SmartPagination } from '@/components/common/smart-pagination'
import { PageHeader } from '@/components/headers/page-header'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import { getStaticAdTemplateCategories, getStaticAdTemplates } from '@/services/static-ad-templates.service'
import { STATIC_AD_TEMPLATE_PAGE_SIZE, type MetaResponse } from '@socialista/types'

type StaticAdTemplatesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: STATIC_AD_TEMPLATE_PAGE_SIZE,
  hasNextPage: false,
  hasPreviousPage: false,
}

function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== 'string') return 1
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

export default async function StaticAdTemplatesPage({ searchParams }: StaticAdTemplatesPageProps) {
  const params = await searchParams
  const category = typeof params.category === 'string' ? params.category : undefined
  const page = parsePage(params.page)

  const [categoriesResult, templatesResult] = await Promise.all([
    getStaticAdTemplateCategories(),
    getStaticAdTemplates({
      category,
      page,
      limit: STATIC_AD_TEMPLATE_PAGE_SIZE,
    }),
  ])

  const categories = categoriesResult.data?.categories ?? []
  const templates = templatesResult.data?.templates ?? []
  const meta = templatesResult.meta ?? defaultMeta

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Static ad templates"
        description="Manage templates shown in the static ads studio gallery."
        breadcrumbs={[
          { label: 'Manager', href: MANAGER_ROUTES.ROOT },
          { label: 'Static ad templates' },
        ]}
        actions={<StaticAdTemplateActions categories={categories} />}
      />

      <section className="flex flex-col gap-6">
        <StaticAdTemplatesToolbar category={category} categories={categories} total={meta.total} />
        <StaticAdTemplatesList templates={templates} hasFilters={Boolean(category)} />
        <SmartPagination meta={meta} />
      </section>
    </div>
  )
}
