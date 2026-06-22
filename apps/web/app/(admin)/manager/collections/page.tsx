import { FilesBrowser } from '@/components/collections/files-browser'
import { PageHeader } from '@/components/common/page-header'
import { managerFilesPaths } from '@/constants/app-routes'
import { getCollections } from '@/services/collection.service'

export default async function CollectionsPage() {
  const collections = await getCollections()
  const folders = collections.data?.collections ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Files"
        description="Browse folders and files in your workspace."
        breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Files' }]}
      />

      <FilesBrowser folders={folders} paths={managerFilesPaths} />
    </div>
  )
}
