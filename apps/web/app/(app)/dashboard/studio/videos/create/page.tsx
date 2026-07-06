import { VideoCreateEditor } from '@/components/video/video-create-editor'

type CreateVideoPageProps = {
  searchParams: Promise<{ slideshowId?: string }>
}

export default async function CreateVideoPage({ searchParams }: CreateVideoPageProps) {
  const { slideshowId } = await searchParams
  return <VideoCreateEditor slideshowId={slideshowId} />
}
