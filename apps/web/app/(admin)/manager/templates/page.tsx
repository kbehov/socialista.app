import { TemplateActions } from './_components/template-actions'
import { TemplatesList } from './_components/templates-list'
import { TemplatesToolbar } from './_components/templates-toolbar'
import { mergeStudioTemplateCategories } from './_lib/merge-categories'
import { SmartPagination } from '@/components/common/smart-pagination'
import { PageHeader } from '@/components/headers/page-header'
import { getStudioTemplateCategories, getStudioTemplates } from '@/services/studio-templates.service'
import {
  isStudioTemplateManagedKind,
  STUDIO_TEMPLATE_PAGE_SIZE,
  StudioTemplateKind,
  type MetaResponse,
  type StudioTemplateManagedKind,
} from '@socialista/types'

type TemplatesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: STUDIO_TEMPLATE_PAGE_SIZE,
  hasNextPage: false,
  hasPreviousPage: false,
}

function parseKind(value: string | string[] | undefined): StudioTemplateManagedKind {
  return typeof value === 'string' && isStudioTemplateManagedKind(value) ? value : StudioTemplateKind.IMAGE
}

function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== 'string') return 1
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const params = await searchParams
  const kind = parseKind(params.kind)
  const category = typeof params.category === 'string' ? params.category : undefined
  const page = parsePage(params.page)

  const [imageCategoriesResult, videoCategoriesResult, templatesResult] = await Promise.all([
    getStudioTemplateCategories(StudioTemplateKind.IMAGE),
    getStudioTemplateCategories(StudioTemplateKind.VIDEO),
    getStudioTemplates({
      kind,
      category,
      page,
      limit: STUDIO_TEMPLATE_PAGE_SIZE,
    }),
  ])

  const imageCategories = imageCategoriesResult.data?.categories ?? []
  const videoCategories = videoCategoriesResult.data?.categories ?? []
  const categories = mergeStudioTemplateCategories([imageCategories, videoCategories])
  const toolbarCategories = kind === StudioTemplateKind.VIDEO ? videoCategories : imageCategories
  const templates = templatesResult.data?.templates ?? []
  const meta = templatesResult.meta ?? defaultMeta

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Templates"
        description="Manage image and video templates used in the studio galleries."
        breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Templates' }]}
        actions={<TemplateActions defaultKind={kind} categories={categories} />}
      />

      <section className="flex flex-col gap-6">
        <TemplatesToolbar kind={kind} category={category} categories={toolbarCategories} total={meta.total} />
        <TemplatesList templates={templates} hasFilters={Boolean(category)} />
        <SmartPagination meta={meta} />
      </section>
    </div>
  )
}
