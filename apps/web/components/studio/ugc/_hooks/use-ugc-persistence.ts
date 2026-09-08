'use client'

import { updateUgcClip, updateUgcProject } from '@/services/ugc-project.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UpdateUgcProjectPayload } from '@socialista/types'
import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'

const DEBOUNCE_MS = 400

export function useUgcPersistence(projectId: string) {
  const setProject = useUgcProjectStore(s => s.setProject)
  const patchProjectLocal = useUgcProjectStore(s => s.patchProjectLocal)
  const patchClipLocal = useUgcProjectStore(s => s.patchClipLocal)
  const debounceTimers = useRef(new Map<string, number>())

  const clearDebounce = useCallback((key: string) => {
    const timer = debounceTimers.current.get(key)
    if (timer) {
      window.clearTimeout(timer)
      debounceTimers.current.delete(key)
    }
  }, [])

  const schedule = useCallback(
    (key: string, action: () => void) => {
      clearDebounce(key)
      debounceTimers.current.set(
        key,
        window.setTimeout(() => {
          debounceTimers.current.delete(key)
          action()
        }, DEBOUNCE_MS),
      )
    },
    [clearDebounce],
  )

  useEffect(() => {
    const timers = debounceTimers.current
    return () => {
      for (const timer of timers.values()) window.clearTimeout(timer)
      timers.clear()
    }
  }, [])

  const patchProject = useCallback(
    async (payload: UpdateUgcProjectPayload) => {
      const response = await updateUgcProject(projectId, payload)
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not save')
        return
      }
      setProject(response.data.project)
    },
    [projectId, setProject],
  )

  const patchClip = useCallback(
    async (clipId: string, payload: Parameters<typeof updateUgcClip>[2]) => {
      const response = await updateUgcClip(projectId, clipId, payload)
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not save')
        return
      }
      setProject(response.data.project)
    },
    [projectId, setProject],
  )

  const scheduleProjectPatch = useCallback(
    (field: string, payload: UpdateUgcProjectPayload) => {
      schedule(`project:${field}`, () => {
        void patchProject(payload)
      })
    },
    [patchProject, schedule],
  )

  const scheduleClipPatch = useCallback(
    (clipId: string, field: string, payload: Parameters<typeof updateUgcClip>[2]) => {
      schedule(`clip:${clipId}:${field}`, () => {
        void patchClip(clipId, payload)
      })
    },
    [patchClip, schedule],
  )

  const flushDebounced = useCallback(() => {
    for (const timer of debounceTimers.current.values()) window.clearTimeout(timer)
    debounceTimers.current.clear()
  }, [])

  return {
    patchProject,
    patchClip,
    patchProjectLocal,
    patchClipLocal,
    scheduleProjectPatch,
    scheduleClipPatch,
    flushDebounced,
  }
}
