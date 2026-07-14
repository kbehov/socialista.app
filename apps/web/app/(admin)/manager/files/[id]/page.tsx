import { FilesBrowser } from '@/components/files/files-browser'
import { PageHeader } from '@/components/headers/page-header'
import { MANAGER_FILES_ROUTES } from '@/constants/app-routes'
import { getFolderById } from '@/services/files.service'
import { formatFileCount } from '@/utils/format'
import { notFound } from 'next/navigation'

const ManagerFolderPage = async ({ params }: { params: Promise<{ id: string }> }) => {
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
        backHref={MANAGER_FILES_ROUTES.HOME}
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Files', href: MANAGER_FILES_ROUTES.HOME },
          { label: folder.name },
        ]}
      />

      <FilesBrowser
        folderId={id}
        folderName={folder.name}
        folderFileCount={folder.imagesCount}
        pathsVariant="manager"
      />
    </div>
  )
}

export default ManagerFolderPage
