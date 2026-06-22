import { FilesBrowser } from '@/components/collections/files-browser'
import { PageHeader } from '@/components/common/page-header'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { formatFileCount } from '@/lib/format'
import { getCollectionById } from '@/services/collection.service'
import { notFound } from 'next/navigation'

const DashboardFolderPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const collection = await getCollectionById(id)

  if (!collection.data) {
    return notFound()
  }

  const folder = collection.data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={folder.name}
        description={formatFileCount(folder.imagesCount)}
        backHref={DASHBOARD_ROUTES.HOME}
        breadcrumbs={[
          { label: 'Files', href: DASHBOARD_ROUTES.HOME },
          { label: folder.name },
        ]}
      />

      <FilesBrowser folderId={id} folderName={folder.name} folderFileCount={folder.imagesCount} />
    </div>
  )
}

export default DashboardFolderPage
