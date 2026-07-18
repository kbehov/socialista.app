import { auth } from '@/auth'
import { getWorkspaceBalance } from '@/services/workspace.service'
import { getCachedUserWorkspaces, getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const getDashboardLayoutData = cache(async () => {
  const session = await auth()
  if (!session) {
    redirect('/auth/signin')
  }

  const [workspaces, currentWorkspace] = await Promise.all([
    getCachedUserWorkspaces(),
    getCurrentWorkspace(),
  ])

  const workspaceBalance = currentWorkspace ? await getWorkspaceBalance(currentWorkspace._id) : null

  return {
    session,
    workspaces,
    aiCreditsBalance: workspaceBalance?.data?.aiCreditsBalance ?? 0,
  }
})
