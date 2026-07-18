import { StaticAdGenerationProgress } from '../_components/static-ad-generation-progress'

type StaticAdRunPageProps = {
  params: Promise<{ runId: string }>
}

export default async function StaticAdRunPage({ params }: StaticAdRunPageProps) {
  const { runId } = await params

  return (
    <div className="image-studio relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <StaticAdGenerationProgress runId={runId} />
    </div>
  )
}
