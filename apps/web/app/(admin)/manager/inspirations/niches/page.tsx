import { PageHeader } from '@/components/common/page-header'
import { InspirationActions } from '@/components/inspirations/inspiration-actions'
import { getInspirationNiches } from '@/services/inspiration.service'
export default async function NichesPage() {
  const niches = await getInspirationNiches('limit=100&sort=name')
  console.log(niches.data?.niches)
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Niches"
        description="Manage niches"
        actions={<InspirationActions />}
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Inspirations', href: '/manager/inspirations' },
          { label: 'Niches' },
        ]}
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 ">
        {niches.data?.niches.map(niche => (
          <div key={niche._id} className="group">
            <div className="flex items-center gap-2 group-hover:border border-border rounded-lg p-1 transition-colors">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-2xl">{niche.icon}</span>
              </div>
              <div className="text-sm font-medium">{niche.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
