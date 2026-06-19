'use client'

import { useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import { WorkspaceResponse } from '@socialista/types'
import { createContext, useEffect } from 'react'

type WorkspaceContextType = {
  isLoading: boolean
  workspaces: WorkspaceResponse[]
}

export const WorkspaceContext = createContext<WorkspaceContextType>({
  isLoading: true,
  workspaces: [],
})

export const WorkspaceProvider = ({
  children,
  workspaces,
}: {
  children: React.ReactNode
  workspaces: WorkspaceResponse[]
}) => {
  const { isLoading, currentWorkspace } = useWorkspaceStore()
  const { setWorkspaces, setIsLoading, setCurrentWorkspace } = useWorkspaceStoreActions()

  useEffect(() => {
    if (!workspaces.length) {
      setIsLoading(false)
      return
    }

    setWorkspaces(workspaces)
    if (!currentWorkspace) {
      setCurrentWorkspace(workspaces[0] ?? null)
    }
    setIsLoading(false)
  }, [workspaces, currentWorkspace, setWorkspaces, setIsLoading, setCurrentWorkspace])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <WorkspaceContext.Provider value={{ isLoading, workspaces }}>{children}</WorkspaceContext.Provider>
}
