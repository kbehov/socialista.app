import { PageHeader } from '@/components/headers/page-header'
import { getInspirationCategories, getInspirationNiches } from '@/services/inspiration.service'
import { InspirationCreateWrapper } from '../_components/inspiration-create'
export default async function CreateInspirationPage() {
  const [categories, niches] = await Promise.all([
    getInspirationCategories('limit=100&sort=name'),
    getInspirationNiches('limit=100&sort=name'),
  ])
  return (
    <>
      <PageHeader
        title="Create inspiration"
        description="Import a TikTok post."
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Inspirations', href: '/manager/inspirations' },
          { label: 'Create' },
        ]}
        backHref="/manager/inspirations"
      />

      <InspirationCreateWrapper categories={categories.data?.categories ?? []} niches={niches.data?.niches ?? []} />
    </>
  )
}
