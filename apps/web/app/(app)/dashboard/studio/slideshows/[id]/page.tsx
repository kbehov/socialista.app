import { SlideshowEditorLoader } from '@/components/carousel/slideshow-editor-loader'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'

export const metadata = createDashboardMetadata('Slideshow')

type SlideshowEditorPageProps = {
  params: Promise<{ id: string }>
}

export default async function SlideshowEditorPage({ params }: SlideshowEditorPageProps) {
  const { id } = await params
  return <SlideshowEditorLoader slideshowId={id} />
}
