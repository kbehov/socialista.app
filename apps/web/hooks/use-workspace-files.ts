'use client'

import { getWorkspaceFiles, uploadToFolder, uploadToWorkspace } from '@/services/files.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { ImageResponse } from '@socialista/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type FileWithPreview, useFileUpload } from './use-file-upload'

type UseWorkspaceFilesOptions = {
  /** Scope files to a folder; omit for workspace root. */
  folderId?: string
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

export function useWorkspaceFiles({ folderId }: UseWorkspaceFilesOptions = {}): UseWorkspaceFilesReturn {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)

  const [files, setFiles] = useState<ImageResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (!currentWorkspace) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await getWorkspaceFiles(currentWorkspace._id, folderId)
      if (response.data) {
        setFiles(response.data.images)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }, [currentWorkspace, folderId])

  useEffect(() => {
    void fetchFiles()
  }, [fetchFiles])

  const upload = useCallback(
    async (incomingFiles: File[]) => {
      if (!currentWorkspace || incomingFiles.length === 0) return
      setIsUploading(true)
      setError(null)
      try {
        for (const file of incomingFiles) {
          const formData = new FormData()
          formData.append('file', file)

          if (folderId) {
            await uploadToFolder(currentWorkspace._id, folderId, formData)
          } else {
            await uploadToWorkspace(currentWorkspace._id, formData)
          }
        }
        await fetchFiles()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload files')
      } finally {
        setIsUploading(false)
      }
    },
    [currentWorkspace, folderId, fetchFiles],
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
