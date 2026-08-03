'use client'

import { getWorkspaceFiles, uploadToFolder, uploadToWorkspace } from '@/services/files.service'
import { WORKSPACE_FILES_PAGE_SIZE } from '@/constants/files'
import type { ImageResponse } from '@socialista/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type FileWithPreview, useFileUpload } from './use-file-upload'

type UseWorkspaceFilesOptions = {
  workspaceId?: string
  folderId?: string
  /** When provided (including empty), skip the initial client fetch. */
  initialFiles?: ImageResponse[]
  initialError?: string | null
  /** Whether more pages exist after `initialFiles`. Defaults to false. */
  initialHasMore?: boolean
  /** Total file count from the first page meta (optional). */
  initialTotal?: number
  pageSize?: number
}

type UseWorkspaceFilesReturn = {
  files: ImageResponse[]
  isLoading: boolean
  isLoadingMore: boolean
  isUploading: boolean
  error: string | null
  hasMore: boolean
  total: number
  fetchMore: () => void
  refetch: () => Promise<void>
  uploadState: ReturnType<typeof useFileUpload>[0]
  uploadActions: ReturnType<typeof useFileUpload>[1]
}

export function useWorkspaceFiles({
  workspaceId,
  folderId,
  initialFiles,
  initialError = null,
  initialHasMore = false,
  initialTotal,
  pageSize = WORKSPACE_FILES_PAGE_SIZE,
}: UseWorkspaceFilesOptions = {}): UseWorkspaceFilesReturn {
  const hasServerData = initialFiles !== undefined
  const [files, setFiles] = useState(initialFiles ?? [])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [total, setTotal] = useState(initialTotal ?? initialFiles?.length ?? 0)
  const [isLoading, setIsLoading] = useState(!hasServerData && Boolean(workspaceId))
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  const loadRequestId = useRef(0)
  const uploadFnRef = useRef<(files: File[]) => Promise<void>>(async () => {})
  const pageRef = useRef(page)
  const hasMoreRef = useRef(hasMore)
  const isLoadingMoreRef = useRef(isLoadingMore)

  pageRef.current = page
  hasMoreRef.current = hasMore
  isLoadingMoreRef.current = isLoadingMore

  useEffect(() => {
    if (!hasServerData) return
    setTimeout(() => {
      setFiles(initialFiles ?? [])
      setError(initialError ?? null)
      setPage(1)
      setHasMore(initialHasMore)
      setTotal(initialTotal ?? initialFiles?.length ?? 0)
    }, 0)
  }, [hasServerData, initialFiles, initialError, initialHasMore, initialTotal])

  const handleFilesAdded = useCallback((addedFiles: FileWithPreview[]) => {
    const nextFiles = addedFiles.map(f => f.file).filter((f): f is File => f instanceof File)

    if (nextFiles.length > 0) {
      uploadFnRef.current(nextFiles)
    }
  }, [])

  const [uploadState, uploadActions] = useFileUpload({
    multiple: true,
    accept: 'image/*,video/*',
    maxSize: 50 * 1024 * 1024,
    onFilesAdded: handleFilesAdded,
  })

  const loadPage = useCallback(
    async (pageNum: number, mode: 'replace' | 'append') => {
      if (!workspaceId) {
        setIsLoading(false)
        return
      }

      const requestId = ++loadRequestId.current
      if (mode === 'replace') {
        setIsLoading(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const response = await getWorkspaceFiles(workspaceId, folderId, {
          page: pageNum,
          limit: pageSize,
          sort: '-createdAt',
        })

        if (requestId !== loadRequestId.current) return

        const nextImages = response.data?.images ?? []
        setFiles(current => (mode === 'append' ? [...current, ...nextImages] : nextImages))
        setPage(pageNum)
        setHasMore(Boolean(response.meta?.hasNextPage))
        if (typeof response.meta?.total === 'number') {
          setTotal(response.meta.total)
        }
      } catch (err) {
        if (requestId !== loadRequestId.current) return
        setError(err instanceof Error ? err.message : 'Failed to load files')
        if (mode === 'replace') {
          setFiles([])
          setHasMore(false)
          setTotal(0)
        }
      } finally {
        if (requestId === loadRequestId.current) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    [workspaceId, folderId, pageSize],
  )

  const fetchFiles = useCallback(async () => {
    await loadPage(1, 'replace')
  }, [loadPage])

  useEffect(() => {
    if (hasServerData) return
    setTimeout(() => {
      void loadPage(1, 'replace')
    }, 0)
  }, [hasServerData, loadPage])

  const fetchMore = useCallback(() => {
    if (!workspaceId || isLoadingMoreRef.current || !hasMoreRef.current) return
    void loadPage(pageRef.current + 1, 'append')
  }, [workspaceId, loadPage])

  const upload = useCallback(
    async (incomingFiles: File[]) => {
      if (!workspaceId || incomingFiles.length === 0) return
      setIsUploading(true)
      setError(null)
      try {
        for (const file of incomingFiles) {
          const formData = new FormData()
          formData.append('file', file)

          if (folderId) {
            await uploadToFolder(workspaceId, folderId, formData)
          } else {
            await uploadToWorkspace(workspaceId, formData)
          }
        }
        await loadPage(1, 'replace')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload files')
      } finally {
        setIsUploading(false)
      }
    },
    [workspaceId, folderId, loadPage],
  )

  useEffect(() => {
    uploadFnRef.current = upload
  }, [upload])

  return {
    files,
    isLoading,
    isLoadingMore,
    isUploading,
    error,
    hasMore,
    total,
    fetchMore,
    refetch: fetchFiles,
    uploadState,
    uploadActions,
  }
}
