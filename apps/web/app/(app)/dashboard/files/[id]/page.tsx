import { PageHeader } from '@/components/common/page-header'
import { FilesBrowser } from '@/components/files/files-browser'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getFolderById } from '@/services/files.service'
import { formatFileCount } from '@/utils/format'
import { notFound } from 'next/navigation'

const DashboardFolderPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const folderResult = await getFolderById(id)

  if (!folderResult.data) {
    return notFound()
  }

  const folder = folderResult.data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={folder.name}
        description={formatFileCount(folder.imagesCount)}
        backHref={DASHBOARD_ROUTES.HOME}
        breadcrumbs={[{ label: 'Files', href: DASHBOARD_ROUTES.HOME }, { label: folder.name }]}
      />

      <FilesBrowser folderId={id} folderName={folder.name} folderFileCount={folder.imagesCount} />
    </div>
  )
}

export default DashboardFolderPage
