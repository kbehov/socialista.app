'use client'

import { VIDEO_LIST_PAGE_SIZE } from '@/constants/studio'
import { deleteVideo, duplicateVideo, getWorkspaceVideos } from '@/services/video.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import type { VideoSummaryResponse } from '@socialista/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type UseVideosListOptions = {
  workspaceId: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
}

export function useVideosList({
  workspaceId,
  initialVideos,
  initialError = null,
  initialHasMore = false,
}: UseVideosListOptions) {
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [videos, setVideos] = useState(initialVideos)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [error, setError] = useState<string | null>(initialError)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<VideoSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const skipInitialSync = useRef(true)
  const requestIdRef = useRef(0)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    if (skipInitialSync.current) {
      skipInitialSync.current = false
      return
    }
    setVideos(initialVideos)
    setError(initialError)
    setPage(1)
    setHasMore(initialHasMore)
  }, [initialVideos, initialError, initialHasMore])

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      const requestId = ++requestIdRef.current
      const response = await getWorkspaceVideos(workspaceId, {
        status: 'draft',
        page: nextPage,
        limit: VIDEO_LIST_PAGE_SIZE,
        projectId,
      })

      if (requestId !== requestIdRef.current) return

      if (!response.success || !response.data) {
        const message = response.message ?? 'Failed to load videos'
        if (append) {
          toast.error(message)
          return
        }
        setError(message)
        setVideos([])
        setHasMore(false)
        return
      }

      const nextVideos = response.data.videos
      setError(null)
      setVideos(current => (append ? [...current, ...nextVideos] : nextVideos))
      setPage(nextPage)
      setHasMore(Boolean(response.meta?.hasNextPage))
    },
    [workspaceId, projectId],
  )

  const loadVideos = useCallback(async () => {
    setIsLoading(true)
    await fetchPage(1, false)
    setIsLoading(false)
  }, [fetchPage])

  const fetchMore = useCallback(() => {
    if (isLoading || loadingMoreRef.current || !hasMore) return
    loadingMoreRef.current = true
    void fetchPage(page + 1, true).finally(() => {
      loadingMoreRef.current = false
    })
  }, [fetchPage, hasMore, isLoading, page])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || isDeleting) return false
    setIsDeleting(true)
    const response = await deleteVideo(deleteTarget.id)
    setIsDeleting(false)
    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete video')
      return false
    }
    toast.success('Video deleted')
    const deletedId = deleteTarget.id
    setVideos(current => current.filter(video => video.id !== deletedId))
    setDeleteTarget(null)
    return true
  }, [deleteTarget, isDeleting])

  const handleDuplicate = useCallback(
    async (video: VideoSummaryResponse) => {
      if (duplicatingId) return
      setDuplicatingId(video.id)
      const response = await duplicateVideo(video.id)
      setDuplicatingId(null)
      if (!response.success || !response.data?.video) {
        toast.error(response.message ?? 'Failed to duplicate video')
        return
      }
      toast.success(`Duplicated as “${response.data.video.name}”`)
      await fetchPage(1, false)
    },
    [duplicatingId, fetchPage],
  )

  return {
    videos,
    error,
    isLoading,
    hasMore,
    deleteTarget,
    isDeleting,
    duplicatingId,
    setDeleteTarget,
    loadVideos,
    fetchMore,
    handleDelete,
    handleDuplicate,
  }
}
