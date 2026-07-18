import { FilesBrowser } from '@/components/files/files-browser'
import { PageHeader } from '@/components/headers/page-header'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getFolderById, getWorkspaceFiles } from '@/services/files.service'
import { formatFileCount } from '@/utils/format'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { notFound } from 'next/navigation'

const DashboardFolderPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const [folderResult, workspace] = await Promise.all([getFolderById(id), getCurrentWorkspace()])

  if (!folderResult.data) {
    return notFound()
  }

  const folder = folderResult.data
  const filesResult = workspace ? await getWorkspaceFiles(workspace.id, id) : null
  const initialFiles = filesResult?.data?.images ?? []
  const filesError = filesResult && !filesResult.success ? (filesResult.message ?? 'Failed to load files') : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={folder.name}
        description={formatFileCount(folder.imagesCount)}
        backHref={DASHBOARD_ROUTES.HOME}
        breadcrumbs={[{ label: 'Files', href: DASHBOARD_ROUTES.HOME }, { label: folder.name }]}
      />

      <FilesBrowser
        folderId={id}
        folderName={folder.name}
        folderFileCount={folder.imagesCount}
        workspaceId={workspace?.id}
        initialFiles={initialFiles}
        initialError={filesError}
      />
    </div>
  )
}

export default DashboardFolderPage
