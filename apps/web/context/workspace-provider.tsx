'use client'

import { getWorkspaceId, useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import { getCurrentWorkspaceIdClient, setCurrentWorkspaceIdClient } from '@/utils/cookie.utils'
import { WorkspaceResponse } from '@socialista/types'
import { createContext, useEffect, useRef } from 'react'

type WorkspaceContextType = {
  isLoading: boolean
  workspaces: WorkspaceResponse[]
}

export const WorkspaceContext = createContext<WorkspaceContextType>({
  isLoading: true,
  workspaces: [],
})

function findWorkspaceById(workspaces: WorkspaceResponse[], workspaceId: string | undefined) {
  if (!workspaceId || workspaceId === 'undefined' || workspaceId === 'null') return undefined
  return workspaces.find(workspace => workspace.id === workspaceId || workspace._id === workspaceId)
}

function workspaceListKey(workspaces: WorkspaceResponse[]) {
  return workspaces.map(workspace => getWorkspaceId(workspace) ?? '').join(',')
}

function ensureCookieMatches(workspace: WorkspaceResponse) {
  const id = getWorkspaceId(workspace)
  if (!id) return
  if (getCurrentWorkspaceIdClient() !== id) {
    setCurrentWorkspaceIdClient(id)
  }
}

/**
 * Apply server workspace list without wiping a valid selection.
 * Never clears the cookie from this path.
 */
function applyWorkspacesFromServer(workspaces: WorkspaceResponse[]) {
  const { currentWorkspace, setWorkspaces, setCurrentWorkspace } = useWorkspaceStore.getState()
  setWorkspaces(workspaces)

  if (!workspaces.length) {
    return
  }

  const cookieWorkspaceId = getCurrentWorkspaceIdClient()
  const cookieWorkspace = findWorkspaceById(workspaces, cookieWorkspaceId)
  const storeWorkspace = currentWorkspace
    ? findWorkspaceById(workspaces, getWorkspaceId(currentWorkspace))
    : undefined

  if (cookieWorkspace && (!storeWorkspace || getWorkspaceId(cookieWorkspace) !== getWorkspaceId(storeWorkspace))) {
    setCurrentWorkspace(cookieWorkspace)
    return
  }

  if (storeWorkspace) {
    ensureCookieMatches(storeWorkspace)
    useWorkspaceStore.setState({ currentWorkspace: storeWorkspace })
    return
  }

  const fallback = cookieWorkspace ?? workspaces[0]
  if (fallback) {
    setCurrentWorkspace(fallback)
  }
}

export const WorkspaceProvider = ({
  children,
  workspaces,
}: {
  children: React.ReactNode
  workspaces: WorkspaceResponse[]
}) => {
  const isLoading = useWorkspaceStore(s => s.isLoading)
  const { setIsLoading } = useWorkspaceStoreActions()
  const didHydrateRef = useRef(false)
  const listKeyRef = useRef<string | null>(null)

  // Hydrate once from localStorage, then sync with cookie / server list
  useEffect(() => {
    let cancelled = false

    const finish = () => {
      if (cancelled) return
      applyWorkspacesFromServer(workspaces)
      listKeyRef.current = workspaceListKey(workspaces)
      didHydrateRef.current = true
      setIsLoading(false)
    }

    if (useWorkspaceStore.persist.hasHydrated()) {
      finish()
      return
    }

    const unsubscribe = useWorkspaceStore.persist.onFinishHydration(finish)
    void useWorkspaceStore.persist.rehydrate()

    return () => {
      cancelled = true
      unsubscribe()
    }
    // Mount-only: workspaces updates are handled below without re-hydrating
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsLoading])

  // Keep store in sync when server props change — without re-running persist hydration
  useEffect(() => {
    if (!didHydrateRef.current) return

    const nextKey = workspaceListKey(workspaces)
    if (listKeyRef.current === nextKey) {
      const { currentWorkspace } = useWorkspaceStore.getState()
      const refreshed = currentWorkspace
        ? findWorkspaceById(workspaces, getWorkspaceId(currentWorkspace))
        : undefined

      useWorkspaceStore.setState({
        workspaces,
        ...(refreshed ? { currentWorkspace: refreshed } : {}),
      })

      if (refreshed) {
        ensureCookieMatches(refreshed)
      } else if (!currentWorkspace) {
        applyWorkspacesFromServer(workspaces)
      }
      return
    }

    listKeyRef.current = nextKey
    applyWorkspacesFromServer(workspaces)
  }, [workspaces])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <WorkspaceContext.Provider value={{ isLoading, workspaces }}>{children}</WorkspaceContext.Provider>
}
