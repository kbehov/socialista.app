'use client'

import { getWorkspaceBalance } from '@/services/workspace.service'
import { useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import type { WorkspaceBalanceResponse } from '@socialista/types'
import { useEffect, useState } from 'react'

export function useWorkspaceBilling() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const { updateWorkspace } = useWorkspaceStoreActions()
  const [balance, setBalance] = useState<WorkspaceBalanceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const workspaceId = currentWorkspace?.id
    if (!workspaceId) {
      setBalance(null)
      setError(null)
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)

    void getWorkspaceBalance(workspaceId)
      .then(response => {
        if (cancelled) return

        if (!response.success || !response.data) {
          setBalance(null)
          setError(response.message ?? 'Failed to load balance')
          return
        }

        setBalance(response.data)

        const workspace = useWorkspaceStore.getState().currentWorkspace
        if (workspace?.id === workspaceId) {
          updateWorkspace({
            ...workspace,
            billing: {
              ...workspace.billing,
              aiCreditsBalance: response.data.aiCreditsBalance,
              plan: response.data.plan,
              status: response.data.status,
            },
            usage: {
              storage: response.data.usage.storage.used,
              posts: response.data.usage.posts.used,
              accounts: response.data.usage.accounts.used,
            },
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBalance(null)
          setError('Failed to load balance')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentWorkspace?.id, updateWorkspace])

  const credits = balance?.aiCreditsBalance ?? currentWorkspace?.billing.aiCreditsBalance ?? 0

  return {
    balance: balance,
    credits,
    usage: balance?.usage ?? null,
    isLoading,
    error,
  }
}
