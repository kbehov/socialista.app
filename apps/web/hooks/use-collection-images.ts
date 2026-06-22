'use client'

import { getWorkspaceImages, uploadToCollection, uploadToWorkspace } from '@/services/collection.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { ImageResponse } from '@socialista/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type FileWithPreview, useFileUpload } from './use-file-upload'

type UseCollectionImagesOptions = {
  /** Provide a collectionId to scope images to that collection; omit for workspace-level images. */
  collectionId?: string
}

type UseCollectionImagesReturn = {
  images: ImageResponse[]
  isLoading: boolean
  isUploading: boolean
  error: string | null
  refetch: () => Promise<void>
  uploadState: ReturnType<typeof useFileUpload>[0]
  uploadActions: ReturnType<typeof useFileUpload>[1]
}

export function useCollectionImages({ collectionId }: UseCollectionImagesOptions = {}): UseCollectionImagesReturn {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)

  const [images, setImages] = useState<ImageResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref keeps the upload function stable so the file-upload hook callback never goes stale
  const uploadFnRef = useRef<(files: File[]) => Promise<void>>(async () => {})

  // Stable callback passed to useFileUpload — reads the ref at call time
  const handleFilesAdded = useCallback((addedFiles: FileWithPreview[]) => {
    const files = addedFiles.map(f => f.file).filter((f): f is File => f instanceof File)

    if (files.length > 0) {
      uploadFnRef.current(files)
    }
  }, [])

  const [uploadState, uploadActions] = useFileUpload({
    multiple: true,
    accept: 'image/*,video/*',
    maxSize: 50 * 1024 * 1024, // 50 MB — server enforces per-type limits (10 MB image / 50 MB video)
    onFilesAdded: handleFilesAdded,
  })

  const fetchImages = useCallback(async () => {
    if (!currentWorkspace) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await getWorkspaceImages(currentWorkspace._id, collectionId)
      if (response.data) {
        setImages(response.data.images)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }, [currentWorkspace, collectionId])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const upload = useCallback(
    async (files: File[]) => {
      if (!currentWorkspace || files.length === 0) return
      setIsUploading(true)
      setError(null)
      try {
        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)

          if (collectionId) {
            await uploadToCollection(currentWorkspace._id, collectionId, formData)
          } else {
            await uploadToWorkspace(currentWorkspace._id, formData)
          }
        }
        await fetchImages()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload files')
      } finally {
        setIsUploading(false)
      }
    },
    [currentWorkspace, collectionId, fetchImages],
  )

  // Keep the ref pointing at the latest upload function
  useEffect(() => {
    uploadFnRef.current = upload
  }, [upload])

  return {
    images,
    isLoading,
    isUploading,
    error,
    refetch: fetchImages,
    uploadState,
    uploadActions,
  }
}
