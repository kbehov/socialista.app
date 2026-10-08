import { SlideshowCreateEditor } from '@/components/carousel/slideshow-create-editor'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'

export const metadata = createDashboardMetadata('Create slideshow')

export default function CreateSlideshowPage() {
  return <SlideshowCreateEditor />
}
