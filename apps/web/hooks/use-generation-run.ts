'use client'

import { useRealtimeRun, useRun } from '@trigger.dev/react-hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { RealtimeImageGenerationTask } from '@socialista/trigger/task-types'

const TERMINAL_STATUSES = new Set([
  'COMPLETED',
  'FAILED',
  'CRASHED',
  'SYSTEM_FAILURE',
  'CANCELED',
  'CANCELLED',
  'TIMED_OUT',
  'EXPIRED',
  'INTERRUPTED',
])

type GenerationRunSnapshot = {
  status?: string
  metadata?: Record<string, unknown>
  output?: unknown
  payload?: unknown
  error?: unknown
  durationMs?: number
  finishedAt?: string | Date | null
}

function isTerminalRun(run: GenerationRunSnapshot | undefined) {
  return run?.status ? TERMINAL_STATUSES.has(run.status) : false
}

function getRunProgress(run: GenerationRunSnapshot | undefined) {
  const status = run?.metadata?.status as { progress?: number } | undefined
  return typeof status?.progress === 'number' ? status.progress : 0
}

function mergeRuns(
  realtimeRun: GenerationRunSnapshot | undefined,
  polledRun: GenerationRunSnapshot | undefined,
) {
  if (!realtimeRun && !polledRun) return undefined
  if (isTerminalRun(polledRun)) return polledRun
  if (isTerminalRun(realtimeRun)) return realtimeRun

  if (!realtimeRun) return polledRun
  if (!polledRun) return realtimeRun

  return getRunProgress(realtimeRun) >= getRunProgress(polledRun) ? realtimeRun : polledRun
}

type UseGenerationRunOptions = {
  runId: string
  accessToken: string | null
}

export function useGenerationRun({ runId, accessToken }: UseGenerationRunOptions) {
  const enabled = Boolean(accessToken)
  const hookOptions = {
    accessToken: accessToken ?? undefined,
    enabled,
  }

  const [realtimeEnabled, setRealtimeEnabled] = useState(true)

  const {
    run: realtimeRun,
    error: realtimeError,
    stop,
  } = useRealtimeRun<RealtimeImageGenerationTask>(runId, {
    ...hookOptions,
    enabled: enabled && realtimeEnabled,
  })

  const { run: polledRun, error: polledError } = useRun<RealtimeImageGenerationTask>(runId, {
    ...hookOptions,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 2500,
  })

  const run = useMemo(
    () => mergeRuns(realtimeRun, polledRun as GenerationRunSnapshot | undefined),
    [realtimeRun, polledRun],
  )
  const error = realtimeError ?? polledError

  const reconnectRealtime = useCallback(() => {
    stop()
    setRealtimeEnabled(false)
    queueMicrotask(() => setRealtimeEnabled(true))
  }, [stop])

  useEffect(() => {
    if (!enabled) return

    const resync = () => {
      if (document.visibilityState !== 'visible') return

      const current = mergeRuns(realtimeRun, polledRun as GenerationRunSnapshot | undefined)
      if (!isTerminalRun(current)) {
        reconnectRealtime()
      }
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        resync()
      }
    }

    document.addEventListener('visibilitychange', resync)
    window.addEventListener('online', resync)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      document.removeEventListener('visibilitychange', resync)
      window.removeEventListener('online', resync)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [enabled, realtimeRun, polledRun, reconnectRealtime])

  return { run, error }
}
