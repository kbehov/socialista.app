'use client'

import { COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
import { useGenerationRun } from '@/hooks/use-generation-run'
import { parseGenerationStatus } from '@/lib/image-generation/run-utils'
import { useEffect, useRef } from 'react'

export function UgcRunWatcher({
  runId,
  accessToken,
  onProgress,
  onSettled,
}: {
  runId: string
  accessToken: string
  onProgress: (progress: number, label: string) => void
  onSettled: () => void
}) {
  const { run } = useGenerationRun({ runId, accessToken })
  const settledRef = useRef(false)
  const onProgressRef = useRef(onProgress)
  const onSettledRef = useRef(onSettled)
  onProgressRef.current = onProgress
  onSettledRef.current = onSettled

  useEffect(() => {
    const status = parseGenerationStatus(run?.metadata)
    onProgressRef.current(status.progress, status.label)
  }, [run?.metadata])

  useEffect(() => {
    const status = run?.status
    if (!status || settledRef.current) return
    if (COMPLETED_STATUSES.has(status) || FAILED_STATUSES.has(status)) {
      settledRef.current = true
      onSettledRef.current()
    }
  }, [run?.status])

  return null
}
