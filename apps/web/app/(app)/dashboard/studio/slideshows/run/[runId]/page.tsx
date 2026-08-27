import { SlideshowGenerationRunView } from '@/components/carousel/slideshow-generation-run-view'

type SlideshowGenerationRunPageProps = {
  params: Promise<{ runId: string }>
}

export default async function SlideshowGenerationRunPage({ params }: SlideshowGenerationRunPageProps) {
  const { runId } = await params

  return (
    <div className="image-studio studio-shell relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <SlideshowGenerationRunView runId={runId} />
    </div>
  )
}
