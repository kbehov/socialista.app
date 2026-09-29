'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { FilesDropzone } from '@/components/files/files-dropzone'
import { FilesFiltersToolbar } from '@/components/files/files-filters-toolbar'
import { FilesPageHeaderActions } from '@/components/files/files-page-header-actions'
import { PageHeader, type PageHeaderProps } from '@/components/headers/page-header'
import { FilesUploadEmptyState } from '@/components/files/files-upload-empty-state'
import { FileMediaGrid } from '@/components/media/file-media-grid'
import { FolderGrid } from '@/components/media/folder-grid'
import type { MediaGridItem } from '@/components/media/media-grid'
import { MediaGridSkeleton } from '@/components/media/media-grid-skeleton'
import { getFilesPaths, type FilesPathsVariant, type FilesRoutePaths } from '@/constants/app-routes'
import { WORKSPACE_FILES_PAGE_SIZE } from '@/constants/files'
import { useFilesFilters } from '@/hooks/use-files-filters'
import { useWorkspaceFiles } from '@/hooks/use-workspace-files'
import {
  filterFilesByType,
  getFileSortFromFilters,
  getFileTypesFromFilters,
  hasActiveFileFilters,
  parseFileFiltersFromSearchParams,
} from '@/lib/files/file-filters'
import { deleteWorkspaceFile, deleteWorkspaceFolder } from '@/services/files.service'
import { useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import { fileLabel } from '@/components/files/attach-media/utils'
import { formatFileCount } from '@/utils/format'
import type { CollectionResponse, ImageResponse } from '@socialista/types'
import { Loader2Icon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
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
  pageHeader?: Omit<PageHeaderProps, 'actions'>
}

type DeleteTarget =
  | { type: 'file'; id: string; name: string }
  | { type: 'folder'; id: string; name: string; fileCount: number }

function toMediaGridItems(files: ImageResponse[]): MediaGridItem[] {
  return files.map(file => ({
    id: file._id,
    src: file.url,
    alt: fileLabel(file),
    name: fileLabel(file),
    width: file.width,
    height: file.height,
  }))
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
    <div className="flex items-center justify-center gap-2 py-8 text-[13px] text-muted-foreground">
      <Loader2Icon className="size-3.5 animate-spin opacity-70" />
      Loading more
    </div>
  )
}

function FilesSectionLabel({ children }: { children: string }) {
  return (
    <h2 className="mb-3 px-0.5 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
      {children}
    </h2>
  )
}

function FilesFilterEmptyState({ hasMore, onClear }: { hasMore: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-sm font-medium tracking-tight text-foreground">No files match</p>
      <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
        {hasMore
          ? 'None of the loaded files match these filters. Scroll to load more, or adjust your filters.'
          : 'Try a different type or sort, or clear filters to see everything.'}
      </p>
      <Button type="button" variant="outline" size="sm" className="h-8" onClick={onClear}>
        Clear filters
      </Button>
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
  showFilterEmpty,
  hasMore,
  onClearFilters,
}: {
  folders: CollectionResponse[]
  files: ImageResponse[]
  paths: FilesRoutePaths
  isDragging: boolean
  onUpload: () => void
  onDeleteFile: (item: MediaGridItem) => void
  onDeleteFolder: (folder: Pick<CollectionResponse, '_id' | 'name' | 'imagesCount'>) => void
  showFilterEmpty: boolean
  hasMore: boolean
  onClearFilters: () => void
}) {
  const hasFolders = folders.length > 0
  const hasFiles = files.length > 0

  if (!hasFolders && !hasFiles && !showFilterEmpty) {
    return <FilesUploadEmptyState isDragging={isDragging} onUpload={onUpload} />
  }

  const showFilesSection = hasFiles || showFilterEmpty

  return (
    <div className="flex flex-col gap-8 pb-2">
      {hasFolders ? (
        <section>
          <FilesSectionLabel>Folders</FilesSectionLabel>
          <FolderGrid folders={folders} paths={paths} onDeleteFolder={onDeleteFolder} />
        </section>
      ) : null}

      {showFilesSection ? (
        <section>
          <FilesSectionLabel>Files</FilesSectionLabel>
          {showFilterEmpty ? (
            <FilesFilterEmptyState hasMore={hasMore} onClear={onClearFilters} />
          ) : (
            <FileMediaGrid items={toMediaGridItems(files)} onDeleteFile={onDeleteFile} />
          )}
        </section>
      ) : null}
    </div>
  )
}

function FilesBrowserContent({
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
  pageHeader,
}: FilesBrowserProps) {
  const paths = getFilesPaths(pathsVariant)
  const router = useRouter()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const { updateWorkspace } = useWorkspaceStoreActions()
  const isRootView = !folderId
  const resolvedWorkspaceId = workspaceId ?? currentWorkspace?.id ?? currentWorkspace?._id
  const resolvedScrollTarget =
    scrollableTarget ?? (pathsVariant === 'manager' ? MANAGER_FILES_SCROLL_ID : DASHBOARD_FILES_SCROLL_ID)

  const searchParams = useSearchParams()
  const { clearFilters } = useFilesFilters()
  const filters = useMemo(
    () => parseFileFiltersFromSearchParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  )
  const sort = getFileSortFromFilters(filters)
  const typeFilter = getFileTypesFromFilters(filters)
  const filtersActive = hasActiveFileFilters(filters)

  const { files, isLoading, isUploading, error, hasMore, total, fetchMore, refetch, uploadState, uploadActions } =
    useWorkspaceFiles({
      workspaceId: resolvedWorkspaceId,
      folderId,
      initialFiles,
      initialError,
      initialHasMore,
      initialTotal,
      pageSize,
      sort,
    })

  const visibleFiles = useMemo(() => filterFilesByType(files, typeFilter), [files, typeFilter])
  const showFilterEmpty = filtersActive && visibleFiles.length === 0 && files.length > 0

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { isDragging } = uploadState
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
      name: item.name ?? item.alt ?? 'File',
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
      files={visibleFiles}
      paths={paths}
      isDragging={isDragging}
      onUpload={uploadActions.openFileDialog}
      onDeleteFile={handleDeleteFile}
      onDeleteFolder={handleDeleteFolder}
      showFilterEmpty={showFilterEmpty}
      hasMore={hasMore}
      onClearFilters={clearFilters}
    />
  ) : showFilterEmpty ? (
    <FilesFilterEmptyState hasMore={hasMore} onClear={clearFilters} />
  ) : visibleFiles.length === 0 && !hasMore ? (
    <FilesUploadEmptyState isDragging={isDragging} onUpload={uploadActions.openFileDialog} />
  ) : (
    <div className="pb-2">
      <FilesSectionLabel>Files</FilesSectionLabel>
      <FileMediaGrid items={toMediaGridItems(visibleFiles)} onDeleteFile={handleDeleteFile} />
    </div>
  )

  const headerActions = (
    <FilesPageHeaderActions
      isUploading={isUploading}
      onUpload={uploadActions.openFileDialog}
      showNewFolder={isRootView}
      onDeleteFolder={
        !isRootView && folderId && folderName
          ? () => handleDeleteFolder({ _id: folderId, name: folderName, imagesCount: folderFileCount })
          : undefined
      }
    />
  )

  return (
    <>
      {pageHeader ? <PageHeader {...pageHeader} actions={headerActions} /> : null}

      <FilesFiltersToolbar filters={filters} total={total} visibleCount={visibleFiles.length} />

      <FilesDropzone
        borderless
        isDragging={isDragging}
        isUploading={isUploading}
        onDragEnter={uploadActions.handleDragEnter}
        onDragLeave={uploadActions.handleDragLeave}
        onDragOver={uploadActions.handleDragOver}
        onDrop={uploadActions.handleDrop}
        inputProps={uploadActions.getInputProps()}
        bodyClassName="min-h-0 p-0"
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

export function FilesBrowser(props: FilesBrowserProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          {props.pageHeader ? <PageHeader {...props.pageHeader} /> : null}
          <LoadingState message="Loading…">
            <MediaGridSkeleton />
          </LoadingState>
        </div>
      }
    >
      <FilesBrowserContent {...props} />
    </Suspense>
  )
}
