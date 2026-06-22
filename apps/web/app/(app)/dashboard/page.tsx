import { FilesBrowser } from '@/components/collections/files-browser'
import { PageHeader } from '@/components/common/page-header'
import { getCollections } from '@/services/collection.service'

export default async function DashboardPage() {
  const collections = await getCollections()
  const folders = collections.data?.collections ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Files"
        description="Browse folders and upload files to your workspace."
      />

      <FilesBrowser folders={folders} />
    </div>
  )
}
