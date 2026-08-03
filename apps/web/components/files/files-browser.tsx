'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { CreateFolderSheet } from '@/components/files/create-folder-sheet'
import { FilesDropzone } from '@/components/files/files-dropzone'
import { FilesToolbar, FolderToolbar } from '@/components/files/files-toolbar'
import { FilesUploadEmptyState } from '@/components/files/files-upload-empty-state'
import { FileMediaGrid } from '@/components/media/file-media-grid'
import { FolderGrid } from '@/components/media/folder-grid'
import type { MediaGridItem } from '@/components/media/media-grid'
import { MediaGridSkeleton } from '@/components/media/media-grid-skeleton'
import { getFilesPaths, type FilesPathsVariant, type FilesRoutePaths } from '@/constants/app-routes'
import { WORKSPACE_FILES_PAGE_SIZE } from '@/constants/files'
import { useWorkspaceFiles } from '@/hooks/use-workspace-files'
import { cn } from '@/lib/utils'
import { deleteWorkspaceFile, deleteWorkspaceFolder } from '@/services/files.service'
import { useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import { formatFileCount } from '@/utils/format'
import type { CollectionResponse, ImageResponse } from '@socialista/types'
import { Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { toast } from 'sonner'

export const DASHBOARD_FILES_SCROLL_ID = 'dashboard-scroll'
export const MANAGER_FILES_SCROLL_ID = 'manager-scroll'

type FilesBrowserProps = {
  folders?: CollectionResponse[]
  folderId?: string
  folderName?: string
  folderFileCount?: number
  pathsVariant?: FilesPathsVariant
  workspaceId?: string
  initialFiles?: ImageResponse[]
  initialError?: string | null
  initialHasMore?: boolean
  initialTotal?: number
  pageSize?: number
  /** DOM id of the scrollable parent. Defaults by `pathsVariant`. */
  scrollableTarget?: string
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

function FilesScrollLoader() {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
      <Loader2Icon className="size-4 animate-spin" />
      Loading more files…
    </div>
  )
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
  workspaceId,
  initialFiles,
  initialError = null,
  initialHasMore = false,
  initialTotal,
  pageSize = WORKSPACE_FILES_PAGE_SIZE,
  scrollableTarget,
}: FilesBrowserProps) {
  const paths = getFilesPaths(pathsVariant)
  const router = useRouter()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const { updateWorkspace } = useWorkspaceStoreActions()
  const isRootView = !folderId
  const resolvedWorkspaceId = workspaceId ?? currentWorkspace?.id ?? currentWorkspace?._id
  const resolvedScrollTarget =
    scrollableTarget ?? (pathsVariant === 'manager' ? MANAGER_FILES_SCROLL_ID : DASHBOARD_FILES_SCROLL_ID)

  const { files, isLoading, isUploading, error, hasMore, total, fetchMore, refetch, uploadState, uploadActions } =
    useWorkspaceFiles({
      workspaceId: resolvedWorkspaceId,
      folderId,
      initialFiles,
      initialError,
      initialHasMore,
      initialTotal,
      pageSize,
    })

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { isDragging } = uploadState
  const fileCountLabel = isRootView ? total : files.length
  const totalItems = folders.length + fileCountLabel
  const hasItems = folders.length > 0 || files.length > 0 || hasMore
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
    if (!deleteTarget || !resolvedWorkspaceId) return

    setIsDeleting(true)
    try {
      if (deleteTarget.type === 'file') {
        const response = await deleteWorkspaceFile(resolvedWorkspaceId, deleteTarget.id, folderId)
        if (!response.success) {
          throw new Error(response.message ?? 'Failed to delete file')
        }
        toast.success('File deleted')
        handleDeleteSuccess(response.data?.freedBytes ?? 0)
        return
      }

      const response = await deleteWorkspaceFolder(resolvedWorkspaceId, deleteTarget.id)
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
  }, [resolvedWorkspaceId, deleteTarget, folderId, handleDeleteSuccess, paths.root, router])

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

  const browserContent = isRootView ? (
    <FinderContent
      folders={folders}
      files={files}
      paths={paths}
      isDragging={isDragging}
      onUpload={uploadActions.openFileDialog}
      onDeleteFile={handleDeleteFile}
      onDeleteFolder={handleDeleteFolder}
    />
  ) : files.length === 0 && !hasMore ? (
    <FilesUploadEmptyState isDragging={isDragging} onUpload={uploadActions.openFileDialog} />
  ) : (
    <FileMediaGrid items={toMediaGridItems(files)} onDeleteFile={handleDeleteFile} />
  )

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
        className={cn(hasItems ? 'border-solid' : undefined)}
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
              fileCount={folderFileCount > 0 ? folderFileCount : total}
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
        ) : (
          <InfiniteScroll
            dataLength={files.length}
            next={fetchMore}
            hasMore={hasMore}
            loader={<FilesScrollLoader />}
            scrollableTarget={resolvedScrollTarget}
            scrollThreshold={0.9}
            className="flex flex-col"
          >
            {browserContent}
          </InfiniteScroll>
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
