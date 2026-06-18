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
    try {
      console.log('workspaces.length', workspaces.length)
      if (!workspaces.length) return
      setWorkspaces(workspaces || [])
      if (!currentWorkspace) {
        setCurrentWorkspace(workspaces[0] || null)
        console.log('currentWorkspace', currentWorkspace)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [workspaces, currentWorkspace, setWorkspaces, setIsLoading, setCurrentWorkspace, workspaces.length])
  if (isLoading) {
    return <div>Loading...</div>
  }
  return <WorkspaceContext.Provider value={{ isLoading, workspaces }}>{children}</WorkspaceContext.Provider>
}
