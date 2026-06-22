import type { WorkspaceResponse } from '@socialista/types'

const BYTES_PER_MB = 1024 * 1024

export type WorkspaceStorageStats = {
  usedBytes: number
  limitBytes: number
  remainingBytes: number
  percentUsed: number
  isFull: boolean
  isNearFull: boolean
}

export function getWorkspaceStorageStats(workspace: WorkspaceResponse): WorkspaceStorageStats {
  const usedBytes = Math.max(0, workspace.usage.storage)
  const limitBytes = Math.max(0, workspace.limits.storage * BYTES_PER_MB)
  const remainingBytes = Math.max(0, limitBytes - usedBytes)
  const percentUsed = limitBytes > 0 ? Math.min(100, (usedBytes / limitBytes) * 100) : 0

  return {
    usedBytes,
    limitBytes,
    remainingBytes,
    percentUsed,
    isFull: limitBytes > 0 && remainingBytes === 0,
    isNearFull: percentUsed >= 85,
  }
}
