import { VideoEditorLoader } from '@/components/video/video-editor-loader'

type VideoEditorPageProps = {
  params: Promise<{ id: string }>
}

export default async function VideoEditorPage({ params }: VideoEditorPageProps) {
  const { id } = await params
  return <VideoEditorLoader videoId={id} />
}
