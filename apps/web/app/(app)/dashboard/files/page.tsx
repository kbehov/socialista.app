import { FilesBrowser } from '@/components/files/files-browser'
import { PageHeader } from '@/components/headers/page-header'
import { getFolders } from '@/services/files.service'

export default async function DashboardFilesPage() {
  const foldersResult = await getFolders()
  const folders = foldersResult.data?.collections ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Files" description="Browse folders and upload files to your workspace." />

      <FilesBrowser folders={folders} />
    </div>
  )
}
