'use client'

import { getWorkspaceFiles, uploadToFolder, uploadToWorkspace } from '@/services/files.service'
import type { ImageResponse } from '@socialista/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type FileWithPreview, useFileUpload } from './use-file-upload'

type UseWorkspaceFilesOptions = {
  workspaceId?: string
  folderId?: string
  /** When provided (including empty), skip the initial client fetch. */
  initialFiles?: ImageResponse[]
  initialError?: string | null
}

type UseWorkspaceFilesReturn = {
  files: ImageResponse[]
  isLoading: boolean
  isUploading: boolean
  error: string | null
  refetch: () => Promise<void>
  uploadState: ReturnType<typeof useFileUpload>[0]
  uploadActions: ReturnType<typeof useFileUpload>[1]
}

export function useWorkspaceFiles({
  workspaceId,
  folderId,
  initialFiles,
  initialError = null,
}: UseWorkspaceFilesOptions = {}): UseWorkspaceFilesReturn {
  const hasServerData = initialFiles !== undefined
  const [files, setFiles] = useState(initialFiles ?? [])
  const [isLoading, setIsLoading] = useState(!hasServerData && Boolean(workspaceId))
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  useEffect(() => {
    if (!hasServerData) return
    setTimeout(() => {
      setFiles(initialFiles ?? [])
      setError(initialError ?? null)
    }, 0)
  }, [hasServerData, initialFiles, initialError])

  const uploadFnRef = useRef<(files: File[]) => Promise<void>>(async () => {})

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

  const fetchFiles = useCallback(async () => {
    if (!workspaceId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await getWorkspaceFiles(workspaceId, folderId)
      if (response.data) {
        setFiles(response.data.images)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }, [workspaceId, folderId])

  useEffect(() => {
    if (hasServerData) return
    setTimeout(() => {
      void fetchFiles()
    }, 0)
  }, [hasServerData, fetchFiles])

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
        await fetchFiles()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload files')
      } finally {
        setIsUploading(false)
      }
    },
    [workspaceId, folderId, fetchFiles],
  )

  useEffect(() => {
    uploadFnRef.current = upload
  }, [upload])

  return {
    files,
    isLoading,
    isUploading,
    error,
    refetch: fetchFiles,
    uploadState,
    uploadActions,
  }
}
