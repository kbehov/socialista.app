import { VideoEditorLoader } from '@/components/video/video-editor-loader'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'

export const metadata = createDashboardMetadata('Video')

type VideoEditorPageProps = {
  params: Promise<{ id: string }>
}

export default async function VideoEditorPage({ params }: VideoEditorPageProps) {
  const { id } = await params
  return <VideoEditorLoader videoId={id} />
}
