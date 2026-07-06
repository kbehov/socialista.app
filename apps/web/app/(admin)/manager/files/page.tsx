import { FilesBrowser } from '@/components/files/files-browser'
import { PageHeader } from '@/components/common/page-header'
import { getFolders } from '@/services/files.service'

export default async function ManagerFilesPage() {
  const foldersResult = await getFolders()
  const folders = foldersResult.data?.collections ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Files"
        description="Browse folders and files in your workspace."
        breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Files' }]}
      />

      <FilesBrowser folders={folders} pathsVariant="manager" />
    </div>
  )
}
