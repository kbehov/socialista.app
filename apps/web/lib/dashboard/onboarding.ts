import type { PostStats } from '@socialista/types'

export type DashboardOnboardingSnapshot = {
  connectedAccounts: number
  hasScheduledOrPublished: boolean
  generationCount: number
}

export function buildOnboardingSnapshot(input: {
  connectedAccounts: number
  postStats?: PostStats | null
  generationTotal?: number
}): DashboardOnboardingSnapshot {
  const postStats = input.postStats ?? {}
  const scheduled = postStats.scheduled ?? 0
  const published = postStats.published ?? 0

  return {
    connectedAccounts: input.connectedAccounts,
    hasScheduledOrPublished: scheduled + published > 0,
    generationCount: input.generationTotal ?? 0,
  }
}

export function isOnboardingComplete(snapshot: DashboardOnboardingSnapshot): boolean {
  return snapshot.connectedAccounts > 0 && snapshot.hasScheduledOrPublished
}

export const DASHBOARD_ONBOARDING_DISMISS_STORAGE_KEY = 'socialista:dashboard-onboarding:dismissed:v1'
