import { lockedStudioShellRootClassName } from '@/components/dashboard/studio-shell'
import { StaticAdGenerationProgress } from '@/components/studio/static-ads/static-ad-generation-progress'

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
