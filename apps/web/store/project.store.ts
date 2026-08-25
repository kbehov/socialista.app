import { ProjectResponse } from '@socialista/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { removeCurrentProjectIdClient, setCurrentProjectIdClient } from '@/utils/cookie.utils'

export function getProjectId(project: { id?: string; _id?: string } | null | undefined): string | undefined {
  const id = project?.id || project?._id
  return id || undefined
}

type ProjectData = {
  projects: ProjectResponse[]
  isLoading: boolean
  currentProject: ProjectResponse | null
  workspaceId: string | null
}

type ProjectActions = {
  setProjects: (projects: ProjectResponse[]) => void
  setIsLoading: (isLoading: boolean) => void
  setCurrentProject: (currentProject: ProjectResponse | null) => void
  addProject: (project: ProjectResponse) => void
  updateProject: (project: ProjectResponse) => void
  removeProject: (projectId: string) => void
  setWorkspaceId: (workspaceId: string | null) => void
  reset: () => void
}

type ProjectState = ProjectData & ProjectActions

const initialData: ProjectData = {
  projects: [],
  isLoading: true,
  currentProject: null,
  workspaceId: null,
}

export const useProjectStore = create<ProjectState>()(
  persist(
    set => ({
      ...initialData,
      setProjects: projects => set({ projects }),
      setIsLoading: isLoading => set({ isLoading }),
      setWorkspaceId: workspaceId => set({ workspaceId }),
      setCurrentProject: currentProject => {
        const projectId = getProjectId(currentProject)
        if (projectId) {
          setCurrentProjectIdClient(projectId)
        }
        if (currentProject === null) {
          removeCurrentProjectIdClient()
        }
        set({ currentProject })
      },
      addProject: project =>
        set(state => {
          const id = getProjectId(project)
          const exists = state.projects.some(item => getProjectId(item) === id)
          return {
            projects: exists
              ? state.projects.map(item => (getProjectId(item) === id ? project : item))
              : [...state.projects, project],
          }
        }),
      updateProject: project =>
        set(state => {
          const id = getProjectId(project)
          return {
            projects: state.projects.map(item => (getProjectId(item) === id ? project : item)),
            currentProject: getProjectId(state.currentProject) === id ? project : state.currentProject,
          }
        }),
      removeProject: projectId =>
        set(state => {
          const remaining = state.projects.filter(item => getProjectId(item) !== projectId)
          const currentId = getProjectId(state.currentProject)
          const currentProject =
            currentId === projectId
              ? (remaining.find(item => item.isDefault) ?? remaining[0] ?? null)
              : state.currentProject
          const nextId = getProjectId(currentProject)
          if (nextId) {
            setCurrentProjectIdClient(nextId)
          } else {
            removeCurrentProjectIdClient()
          }
          return { projects: remaining, currentProject }
        }),
      reset: () => {
        removeCurrentProjectIdClient()
        set(initialData)
      },
    }),
    {
      name: 'so_project_store',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: state => ({
        projects: state.projects,
        currentProject: state.currentProject,
        workspaceId: state.workspaceId,
      }),
    },
  ),
)

export const useProjectStoreActions = () => {
  const setProjects = useProjectStore(s => s.setProjects)
  const setIsLoading = useProjectStore(s => s.setIsLoading)
  const setCurrentProject = useProjectStore(s => s.setCurrentProject)
  const addProject = useProjectStore(s => s.addProject)
  const updateProject = useProjectStore(s => s.updateProject)
  const removeProject = useProjectStore(s => s.removeProject)
  const setWorkspaceId = useProjectStore(s => s.setWorkspaceId)
  const reset = useProjectStore(s => s.reset)
  return {
    setProjects,
    setIsLoading,
    setCurrentProject,
    addProject,
    updateProject,
    removeProject,
    setWorkspaceId,
    reset,
  }
}
