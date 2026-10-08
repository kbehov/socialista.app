import { lockedStudioShellRootClassName } from '@/components/dashboard/studio-shell'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { SlideshowGenerationRunView } from '@/components/carousel/slideshow-generation-run-view'

export const metadata = createDashboardMetadata('Slideshow generation')

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
