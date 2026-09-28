import { lockedStudioShellRootClassName } from '@/components/dashboard/studio-shell'
import { SlideshowGenerationRunView } from '@/components/carousel/slideshow-generation-run-view'

type SlideshowGenerationRunPageProps = {
  params: Promise<{ runId: string }>
}

export default async function SlideshowGenerationRunPage({ params }: SlideshowGenerationRunPageProps) {
  const { runId } = await params

  return (
    <div className={lockedStudioShellRootClassName}>
      <SlideshowGenerationRunView runId={runId} />
    </div>
  )
}
