import { PageHeader } from '@/components/common/page-header'

export default function ManagerPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your admin workspace and content activity."
        breadcrumbs={[{ label: 'Manager' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Inspirations', 'Accounts', 'Activity'].map(label => (
          <div
            key={label}
            className="flex min-h-28 flex-col justify-between rounded-lg border border-border p-4"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-medium tabular-nums tracking-tight">—</p>
          </div>
        ))}
      </div>
    </>
  )
}
