import { WorkspaceResponse } from '@socialista/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { removeCurrentWorkspaceIdClient, setCurrentWorkspaceIdClient } from '@/utils/cookie.utils'

export function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  const id = workspace?.id || workspace?._id
  return id || undefined
}

type WorkspaceData = {
  workspaces: WorkspaceResponse[]
  isLoading: boolean
  currentWorkspace: WorkspaceResponse | null
}

type WorkspaceActions = {
  setWorkspaces: (workspaces: WorkspaceResponse[]) => void
  setIsLoading: (isLoading: boolean) => void
  setCurrentWorkspace: (currentWorkspace: WorkspaceResponse | null) => void
  updateWorkspace: (workspace: WorkspaceResponse) => void
  reset: () => void
}

type WorkspaceState = WorkspaceData & WorkspaceActions

const initialData: WorkspaceData = {
  workspaces: [],
  isLoading: true,
  currentWorkspace: null,
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    set => ({
      ...initialData,
      setWorkspaces: workspaces => set({ workspaces }),
      setIsLoading: isLoading => set({ isLoading }),
      setCurrentWorkspace: currentWorkspace => {
        const workspaceId = getWorkspaceId(currentWorkspace)
        if (workspaceId) {
          setCurrentWorkspaceIdClient(workspaceId)
        }
        // Only clear the cookie on an explicit null selection — never write "undefined"
        if (currentWorkspace === null) {
          removeCurrentWorkspaceIdClient()
        }
        set({ currentWorkspace })
      },
      updateWorkspace: workspace =>
        set(state => ({
          workspaces: state.workspaces.map(w => (w.id === workspace.id ? workspace : w)),
          currentWorkspace: state.currentWorkspace?.id === workspace.id ? workspace : state.currentWorkspace,
        })),
      reset: () => {
        removeCurrentWorkspaceIdClient()
        set(initialData)
      },
    }),
    {
      name: 'so_workspace_store',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: state => ({
        workspaces: state.workspaces,
        currentWorkspace: state.currentWorkspace,
      }),
    },
  ),
)

export const useWorkspaceStoreActions = () => {
  const setWorkspaces = useWorkspaceStore(s => s.setWorkspaces)
  const setIsLoading = useWorkspaceStore(s => s.setIsLoading)
  const setCurrentWorkspace = useWorkspaceStore(s => s.setCurrentWorkspace)
  const updateWorkspace = useWorkspaceStore(s => s.updateWorkspace)
  const reset = useWorkspaceStore(s => s.reset)
  return { setWorkspaces, setIsLoading, setCurrentWorkspace, updateWorkspace, reset }
}
