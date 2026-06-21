import { PageHeader } from '@/components/common/page-header'
export default async function CollectionsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Collections"
        breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Collections' }]}
      />
    </div>
  )
}
