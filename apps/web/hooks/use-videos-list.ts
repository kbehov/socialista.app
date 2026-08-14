'use client'

import { deleteVideo, duplicateVideo, getWorkspaceVideos } from '@/services/video.service'
import type { VideoSummaryResponse } from '@socialista/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type UseVideosListOptions = {
  workspaceId: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
}

export function useVideosList({ workspaceId, initialVideos, initialError = null }: UseVideosListOptions) {
  const [videos, setVideos] = useState(initialVideos)
  const [error, setError] = useState<string | null>(initialError)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<VideoSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const skipInitialSync = useRef(true)

  useEffect(() => {
    if (skipInitialSync.current) {
      skipInitialSync.current = false
      return
    }
    setVideos(initialVideos)
    setError(initialError)
  }, [initialVideos, initialError])

  const loadVideos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const response = await getWorkspaceVideos(workspaceId, 'draft')
    if (!response.success || !response.data) {
      setError(response.message ?? 'Failed to load videos')
      setVideos([])
      setIsLoading(false)
      return
    }
    setVideos(response.data.videos)
    setIsLoading(false)
  }, [workspaceId])

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
    setVideos(current => current.filter(video => video.id !== deleteTarget.id))
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
      await loadVideos()
    },
    [duplicatingId, loadVideos],
  )

  return {
    videos,
    error,
    isLoading,
    deleteTarget,
    isDeleting,
    duplicatingId,
    setDeleteTarget,
    loadVideos,
    handleDelete,
    handleDuplicate,
  }
}
