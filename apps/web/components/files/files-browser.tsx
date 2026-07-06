'use client'

import { CreateFolderSheet } from '@/components/files/create-folder-sheet'
import { FilesDropzone } from '@/components/files/files-dropzone'
import { FilesToolbar, FolderToolbar } from '@/components/files/files-toolbar'
import { FilesUploadEmptyState } from '@/components/files/files-upload-empty-state'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { FileMediaGrid } from '@/components/media/file-media-grid'
import { FolderGrid } from '@/components/media/folder-grid'
import type { MediaGridItem } from '@/components/media/media-grid'
import { MediaGridSkeleton } from '@/components/media/media-grid-skeleton'
import { formatFileCount } from '@/lib/format'
import { getFilesPaths, type FilesPathsVariant, type FilesRoutePaths } from '@/constants/app-routes'
import { useWorkspaceFiles } from '@/hooks/use-workspace-files'
import { deleteWorkspaceFile, deleteWorkspaceFolder } from '@/services/files.service'
import { useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import type { CollectionResponse, ImageResponse } from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

type FilesBrowserProps = {
  folders?: CollectionResponse[]
  folderId?: string
  folderName?: string
  folderFileCount?: number
  pathsVariant?: FilesPathsVariant
}

type DeleteTarget =
  | { type: 'file'; id: string; name: string }
  | { type: 'folder'; id: string; name: string; fileCount: number }

function toMediaGridItems(files: ImageResponse[]): MediaGridItem[] {
  return files.map(file => ({
    id: file._id,
    src: file.url,
    alt: '',
  }))
}

function getFileLabel(file: MediaGridItem) {
  if (file.alt) return file.alt
  try {
    return new URL(file.src).pathname.split('/').pop() ?? 'File'
  } catch {
    return 'File'
  }
}

function applyFreedStorage(
  workspace: NonNullable<ReturnType<typeof useWorkspaceStore.getState>['currentWorkspace']>,
  freedBytes: number,
) {
  return {
    ...workspace,
    usage: {
      ...workspace.usage,
      storage: Math.max(0, workspace.usage.storage - freedBytes),
    },
  }
}

function FinderContent({
  folders,
  files,
  paths,
  isDragging,
  onUpload,
  onDeleteFile,
  onDeleteFolder,
}: {
  folders: CollectionResponse[]
  files: ImageResponse[]
  paths: FilesRoutePaths
  isDragging: boolean
  onUpload: () => void
  onDeleteFile: (item: MediaGridItem) => void
  onDeleteFolder: (folder: Pick<CollectionResponse, '_id' | 'name' | 'imagesCount'>) => void
}) {
  const hasFolders = folders.length > 0
  const hasFiles = files.length > 0

  if (!hasFolders && !hasFiles) {
    return <FilesUploadEmptyState isDragging={isDragging} onUpload={onUpload} />
  }

  return (
    <div className="flex flex-col gap-5">
      {hasFolders && <FolderGrid folders={folders} paths={paths} onDeleteFolder={onDeleteFolder} />}

      {hasFolders && hasFiles && <div className="border-t border-border/60" />}

      {hasFiles && <FileMediaGrid items={toMediaGridItems(files)} onDeleteFile={onDeleteFile} />}
    </div>
  )
}

export function FilesBrowser({
  folders = [],
  folderId,
  folderName,
  folderFileCount = 0,
  pathsVariant = 'dashboard',
}: FilesBrowserProps) {
  const paths = getFilesPaths(pathsVariant)
  const router = useRouter()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const { updateWorkspace } = useWorkspaceStoreActions()
  const isRootView = !folderId

  const { files, isLoading, isUploading, error, refetch, uploadState, uploadActions } = useWorkspaceFiles({
    folderId,
  })

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { isDragging } = uploadState
  const totalItems = folders.length + files.length
  const hasItems = totalItems > 0
  const title = folderName ?? currentWorkspace?.name ?? 'Files'

  const handleDeleteSuccess = useCallback(
    (freedBytes: number) => {
      if (currentWorkspace && freedBytes > 0) {
        updateWorkspace(applyFreedStorage(currentWorkspace, freedBytes))
      }
      setDeleteTarget(null)
      void refetch()
      router.refresh()
    },
    [currentWorkspace, refetch, router, updateWorkspace],
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget || !currentWorkspace) return

    setIsDeleting(true)
    try {
      if (deleteTarget.type === 'file') {
        const response = await deleteWorkspaceFile(currentWorkspace._id, deleteTarget.id, folderId)
        if (!response.success) {
          throw new Error(response.message ?? 'Failed to delete file')
        }
        toast.success('File deleted')
        handleDeleteSuccess(response.data?.freedBytes ?? 0)
        return
      }

      const response = await deleteWorkspaceFolder(currentWorkspace._id, deleteTarget.id)
      if (!response.success) {
        throw new Error(response.message ?? 'Failed to delete folder')
      }

      toast.success('Folder deleted')
      handleDeleteSuccess(response.data?.freedBytes ?? 0)

      if (folderId === deleteTarget.id) {
        router.push(paths.root)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }, [currentWorkspace, deleteTarget, folderId, handleDeleteSuccess, paths.root, router])

  const handleDeleteFile = useCallback((item: MediaGridItem) => {
    setDeleteTarget({
      type: 'file',
      id: item.id,
      name: getFileLabel(item),
    })
  }, [])

  const handleDeleteFolder = useCallback((folder: Pick<CollectionResponse, '_id' | 'name' | 'imagesCount'>) => {
    setDeleteTarget({
      type: 'folder',
      id: folder._id,
      name: folder.name,
      fileCount: folder.imagesCount,
    })
  }, [])

  const deleteDescription =
    deleteTarget?.type === 'file'
      ? `“${deleteTarget.name}” will be permanently removed from your workspace. This action cannot be undone.`
      : deleteTarget
        ? `“${deleteTarget.name}” and ${formatFileCount(deleteTarget.fileCount)} inside it will be permanently removed. This action cannot be undone.`
        : ''

  return (
    <>
      <FilesDropzone
        isDragging={isDragging}
        isUploading={isUploading}
        onDragEnter={uploadActions.handleDragEnter}
        onDragLeave={uploadActions.handleDragLeave}
        onDragOver={uploadActions.handleDragOver}
        onDrop={uploadActions.handleDrop}
        inputProps={uploadActions.getInputProps()}
        className={hasItems ? 'border-solid' : undefined}
        header={
          isRootView ? (
            <FilesToolbar
              title={title}
              itemCount={totalItems}
              isUploading={isUploading}
              onUpload={uploadActions.openFileDialog}
              actions={<CreateFolderSheet variant="toolbar" />}
            />
          ) : (
            <FolderToolbar
              title={title}
              fileCount={files.length}
              isUploading={isUploading}
              onUpload={uploadActions.openFileDialog}
              onDeleteFolder={
                folderId && folderName
                  ? () => handleDeleteFolder({ _id: folderId, name: folderName, imagesCount: folderFileCount })
                  : undefined
              }
            />
          )
        }
      >
        {isLoading ? (
          <LoadingState message="Loading…">
            <MediaGridSkeleton />
          </LoadingState>
        ) : error ? (
          <ErrorState title={error} description="Try refreshing the page or uploading again." />
        ) : isRootView ? (
          <FinderContent
            folders={folders}
            files={files}
            paths={paths}
            isDragging={isDragging}
            onUpload={uploadActions.openFileDialog}
            onDeleteFile={handleDeleteFile}
            onDeleteFolder={handleDeleteFolder}
          />
        ) : files.length === 0 ? (
          <FilesUploadEmptyState isDragging={isDragging} onUpload={uploadActions.openFileDialog} />
        ) : (
          <FileMediaGrid items={toMediaGridItems(files)} onDeleteFile={handleDeleteFile} />
        )}
      </FilesDropzone>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open && !isDeleting) {
            setDeleteTarget(null)
          }
        }}
        title={deleteTarget?.type === 'file' ? 'Delete file?' : 'Delete folder?'}
        description={deleteDescription}
        confirmLabel={deleteTarget?.type === 'file' ? 'Delete file' : 'Delete folder'}
        isDeleting={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
      />
    </>
  )
}
