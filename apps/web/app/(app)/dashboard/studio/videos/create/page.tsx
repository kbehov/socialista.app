import { VideoCreateEditor } from '@/components/video/video-create-editor'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'

export const metadata = createDashboardMetadata('Create video')

type CreateVideoPageProps = {
  searchParams: Promise<{ slideshowId?: string }>
}

export default async function CreateVideoPage({ searchParams }: CreateVideoPageProps) {
  const { slideshowId } = await searchParams
  return <VideoCreateEditor slideshowId={slideshowId} />
}
