import { auth } from '@/auth'
import { getWorkspaceBalance } from '@/services/workspace.service'
import { getCachedWorkspaceProjects } from '@/utils/project.utils.server'
import { getCachedUserWorkspaces, getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const getDashboardData = cache(async () => {
  const session = await auth()
  if (!session) {
    redirect('/auth/signin')
  }

  const [workspaces, currentWorkspace] = await Promise.all([getCachedUserWorkspaces(), getCurrentWorkspace()])

  const [workspaceBalance, projects] = await Promise.all([
    currentWorkspace ? getWorkspaceBalance(currentWorkspace._id) : Promise.resolve(null),
    currentWorkspace ? getCachedWorkspaceProjects(currentWorkspace._id) : Promise.resolve([]),
  ])

  return {
    session,
    workspaces,
    projects,
    currentWorkspace,
    aiCreditsBalance: workspaceBalance?.data?.aiCreditsBalance ?? 0,
  }
})
