import { FilesBrowser } from '@/components/files/files-browser'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { WORKSPACE_FILES_PAGE_SIZE } from '@/constants/files'
import { getFolderById, getWorkspaceFiles } from '@/services/files.service'
import { formatFileCount } from '@/utils/format'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type DashboardFolderPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: DashboardFolderPageProps): Promise<Metadata> {
  const { id } = await params
  const folderResult = await getFolderById(id)
  const name = folderResult.data?.name?.trim()
  return createDashboardMetadata(name || 'Folder')
}

const DashboardFolderPage = async ({ params }: DashboardFolderPageProps) => {
  const { id } = await params
  const [folderResult, workspace] = await Promise.all([getFolderById(id), getCurrentWorkspace()])

  if (!folderResult.data) {
    return notFound()
  }

  const folder = folderResult.data
  const filesResult = workspace
    ? await getWorkspaceFiles(workspace.id, id, {
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
        title: folder.name,
        description: formatFileCount(folder.imagesCount),
        backHref: DASHBOARD_ROUTES.HOME,
        breadcrumbs: [{ label: 'Files', href: DASHBOARD_ROUTES.HOME }, { label: folder.name }],
      }}
      folderId={id}
      folderName={folder.name}
      folderFileCount={folder.imagesCount}
      workspaceId={workspace?.id}
      initialFiles={initialFiles}
      initialError={filesError}
      initialHasMore={Boolean(filesResult?.meta?.hasNextPage)}
      initialTotal={filesResult?.meta?.total}
    />
  )
}

export default DashboardFolderPage
