import { FilesBrowser } from '@/components/files/files-browser'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { WORKSPACE_FILES_PAGE_SIZE } from '@/constants/files'
import { getFolders, getWorkspaceFiles } from '@/services/files.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export const metadata = createDashboardMetadata('Files')

export default async function DashboardFilesPage() {
  const workspace = await getCurrentWorkspace()
  const foldersResult = await getFolders()
  const folders = foldersResult.data?.collections ?? []

  const filesResult = workspace
    ? await getWorkspaceFiles(workspace.id, undefined, {
        page: 1,
        limit: WORKSPACE_FILES_PAGE_SIZE,
        sort: '-createdAt',
      })
    : null
  const initialFiles = filesResult?.data?.images ?? []
  const filesError = filesResult && !filesResult.success ? (filesResult.message ?? 'Failed to load files') : null

  return (
    <FilesBrowser
      pageHeader={{
        title: 'Files',
        description: 'Browse folders and upload files to your workspace.',
      }}
      folders={folders}
      workspaceId={workspace?.id}
      initialFiles={initialFiles}
      initialError={filesError}
      initialHasMore={Boolean(filesResult?.meta?.hasNextPage)}
      initialTotal={filesResult?.meta?.total}
    />
  )
}
