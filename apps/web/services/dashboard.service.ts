import { auth } from '@/auth'
import { buildOnboardingSnapshot, type DashboardOnboardingSnapshot } from '@/lib/dashboard/onboarding'
import { getWorkspaceAccounts } from '@/services/account.service'
import { getWorkspaceGenerations } from '@/services/generation.service'
import { getWorkspacePostStats } from '@/services/post.service'
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

  const workspaceId = currentWorkspace?._id

  const [workspaceBalance, projects] = await Promise.all([
    workspaceId ? getWorkspaceBalance(workspaceId) : Promise.resolve(null),
    workspaceId ? getCachedWorkspaceProjects(workspaceId) : Promise.resolve([]),
  ])

  return {
    session,
    workspaces,
    projects,
    currentWorkspace,
    aiCreditsBalance: workspaceBalance?.data?.aiCreditsBalance ?? 0,
  }
})

export const getDashboardOnboardingSnapshot = cache(
  async (workspaceId: string): Promise<DashboardOnboardingSnapshot> => {
    const [accountsResult, postStatsResult, generationsResult] = await Promise.all([
      getWorkspaceAccounts(workspaceId, { limit: 1, connectionStatus: 'connected' }),
      getWorkspacePostStats(workspaceId),
      getWorkspaceGenerations(workspaceId, { page: 1, limit: 1 }),
    ])

    return buildOnboardingSnapshot({
      connectedAccounts: accountsResult?.meta?.total ?? 0,
      postStats: postStatsResult?.data?.stats,
      generationTotal: generationsResult?.meta?.total,
    })
  },
)
