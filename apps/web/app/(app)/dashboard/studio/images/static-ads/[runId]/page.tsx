import { lockedStudioShellRootClassName } from '@/components/dashboard/studio-shell'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { StaticAdGenerationProgress } from '@/components/studio/static-ads/static-ad-generation-progress'

export const metadata = createDashboardMetadata('Static ad')

type StaticAdRunPageProps = {
  params: Promise<{ runId: string }>
}

export default async function StaticAdRunPage({ params }: StaticAdRunPageProps) {
  const { runId } = await params

  return (
    <div className={lockedStudioShellRootClassName}>
      <StaticAdGenerationProgress runId={runId} />
    </div>
  )
}
