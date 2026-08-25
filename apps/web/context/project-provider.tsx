'use client'

import { getProjectId, useProjectStore, useProjectStoreActions } from '@/store/project.store'
import { getCurrentProjectIdClient, setCurrentProjectIdClient } from '@/utils/cookie.utils'
import { ProjectResponse } from '@socialista/types'
import { createContext, useEffect, useRef } from 'react'

type ProjectContextType = {
  isLoading: boolean
  projects: ProjectResponse[]
}

export const ProjectContext = createContext<ProjectContextType>({
  isLoading: true,
  projects: [],
})

function findProjectById(projects: ProjectResponse[], projectId: string | undefined) {
  if (!projectId || projectId === 'undefined' || projectId === 'null') return undefined
  return projects.find(project => project.id === projectId || project._id === projectId)
}

function projectListKey(projects: ProjectResponse[]) {
  return projects.map(project => getProjectId(project) ?? '').join(',')
}

function ensureCookieMatches(project: ProjectResponse) {
  const id = getProjectId(project)
  if (!id) return
  if (getCurrentProjectIdClient() !== id) {
    setCurrentProjectIdClient(id)
  }
}

function applyProjectsFromServer(projects: ProjectResponse[], workspaceId: string) {
  const { currentProject, setProjects, setCurrentProject, setWorkspaceId } = useProjectStore.getState()
  setProjects(projects)
  setWorkspaceId(workspaceId)

  if (!projects.length) {
    setCurrentProject(null)
    return
  }

  const cookieProjectId = getCurrentProjectIdClient()
  const cookieProject = findProjectById(projects, cookieProjectId)
  const storeProject = currentProject ? findProjectById(projects, getProjectId(currentProject)) : undefined

  if (cookieProject && (!storeProject || getProjectId(cookieProject) !== getProjectId(storeProject))) {
    setCurrentProject(cookieProject)
    return
  }

  if (storeProject) {
    ensureCookieMatches(storeProject)
    useProjectStore.setState({ currentProject: storeProject })
    return
  }

  const fallback = cookieProject ?? projects.find(project => project.isDefault) ?? projects[0]
  if (fallback) {
    setCurrentProject(fallback)
  }
}

export const ProjectProvider = ({
  children,
  projects,
  workspaceId,
}: {
  children: React.ReactNode
  projects: ProjectResponse[]
  workspaceId: string
}) => {
  const isLoading = useProjectStore(s => s.isLoading)
  const { setIsLoading } = useProjectStoreActions()
  const didHydrateRef = useRef(false)
  const listKeyRef = useRef<string | null>(null)
  const workspaceIdRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const finish = () => {
      if (cancelled) return
      applyProjectsFromServer(projects, workspaceId)
      listKeyRef.current = projectListKey(projects)
      workspaceIdRef.current = workspaceId
      didHydrateRef.current = true
      setIsLoading(false)
    }

    if (useProjectStore.persist.hasHydrated()) {
      finish()
      return
    }

    const unsubscribe = useProjectStore.persist.onFinishHydration(finish)
    void useProjectStore.persist.rehydrate()

    return () => {
      cancelled = true
      unsubscribe()
    }
    // Mount-only: project list updates are handled below without re-hydrating
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsLoading])

  useEffect(() => {
    if (!didHydrateRef.current) return

    const workspaceChanged = workspaceIdRef.current !== workspaceId
    const nextKey = projectListKey(projects)
    if (!workspaceChanged && listKeyRef.current === nextKey) {
      const { currentProject } = useProjectStore.getState()
      const refreshed = currentProject ? findProjectById(projects, getProjectId(currentProject)) : undefined

      useProjectStore.setState({
        projects,
        workspaceId,
        ...(refreshed ? { currentProject: refreshed } : {}),
      })

      if (refreshed) {
        ensureCookieMatches(refreshed)
      } else if (!currentProject) {
        applyProjectsFromServer(projects, workspaceId)
      }
      return
    }

    workspaceIdRef.current = workspaceId
    listKeyRef.current = nextKey
    applyProjectsFromServer(projects, workspaceId)
  }, [projects, workspaceId])

  if (isLoading) {
    return <ProjectContext.Provider value={{ isLoading, projects }}>{children}</ProjectContext.Provider>
  }

  return <ProjectContext.Provider value={{ isLoading, projects }}>{children}</ProjectContext.Provider>
}
