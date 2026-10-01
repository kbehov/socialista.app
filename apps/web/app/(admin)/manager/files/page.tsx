import { FilesBrowser } from '@/components/files/files-browser'
import { getFolders } from '@/services/files.service'

export default async function ManagerFilesPage() {
  const foldersResult = await getFolders()
  const folders = foldersResult.data?.collections ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FilesBrowser
        pageHeader={{
          title: 'Files',
          description: 'Browse folders and files in your workspace.',
          breadcrumbs: [{ label: 'Manager', href: '/manager' }, { label: 'Files' }],
        }}
        folders={folders}
        pathsVariant="manager"
      />
    </div>
  )
}
