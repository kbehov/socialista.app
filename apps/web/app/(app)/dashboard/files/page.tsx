import { FilesBrowser } from '@/components/files/files-browser'
import { PageHeader } from '@/components/headers/page-header'
import { getFolders, getWorkspaceFiles } from '@/services/files.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export default async function DashboardFilesPage() {
  const workspace = await getCurrentWorkspace()
  const foldersResult = await getFolders()
  const folders = foldersResult.data?.collections ?? []

  const filesResult = workspace ? await getWorkspaceFiles(workspace.id) : null
  const initialFiles = filesResult?.data?.images ?? []
  const filesError = filesResult && !filesResult.success ? (filesResult.message ?? 'Failed to load files') : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Files" description="Browse folders and upload files to your workspace." />

      <FilesBrowser
        folders={folders}
        workspaceId={workspace?.id}
        initialFiles={initialFiles}
        initialError={filesError}
      />
    </div>
  )
}
