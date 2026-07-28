import type { SocialProvider } from './account.types.js'

export type AnalyticsRange = 'daily' | 'weekly' | 'monthly'

export type EngagementRateBasis = 'reach' | 'followers'

/** Point-in-time / flow metrics stored on a snapshot and returned by the API. */
export type AnalyticsMetrics = {
  followers: number | null
  following: number | null
  posts: number | null
  views: number | null
  reach: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  engagement: number | null
  engagementRate: number | null
}

export type AnalyticsSeriesPoint = {
  date: string
  followers: number | null
  views: number | null
  reach: number | null
  engagement: number | null
  posts: number | null
}

export type AnalyticsPeriodBounds = {
  start: string
  end: string
}

export type AnalyticsAccountInfo = {
  id: string
  provider: SocialProvider
  accountName: string
  username?: string
  avatar?: string
}

export type AnalyticsDataQuality = {
  status: 'ok' | 'needs_reauth' | 'unsupported' | 'error'
  lastFetchedAt?: string
  missingMetrics: string[]
}

export type AccountAnalyticsResponse = {
  account: AnalyticsAccountInfo
  range: AnalyticsRange
  period: {
    current: AnalyticsPeriodBounds
    previous: AnalyticsPeriodBounds
  }
  current: AnalyticsMetrics
  previous: AnalyticsMetrics
  delta: AnalyticsMetrics
  changePercent: Record<keyof AnalyticsMetrics, number | null>
  series: AnalyticsSeriesPoint[]
  dataQuality: AnalyticsDataQuality
}

export type AnalyticsAccountBreakdownRow = {
  account: AnalyticsAccountInfo
  followers: number | null
  views: number | null
  engagement: number | null
  engagementRate: number | null
  followersChangePercent: number | null
  dataQuality: AnalyticsDataQuality
}

export type WorkspaceAnalyticsSummaryResponse = {
  range: AnalyticsRange
  period: {
    current: AnalyticsPeriodBounds
    previous: AnalyticsPeriodBounds
  }
  totals: AnalyticsMetrics
  previousTotals: AnalyticsMetrics
  delta: AnalyticsMetrics
  changePercent: Record<keyof AnalyticsMetrics, number | null>
  series: AnalyticsSeriesPoint[]
  accounts: AnalyticsAccountBreakdownRow[]
  topAccount: AnalyticsAccountBreakdownRow | null
  meta: {
    accountsCovered: number
    accountsNeedingReauth: number
  }
}

export type AnalyticsTier = 'free' | 'premium'

export type AnalyticsSpend = {
  creditsUsed: number
  creditsRemaining: number
  generationCount: number
}

export type AnalyticsProviderAccountStat = {
  provider: SocialProvider
  accounts: number
  followers: number | null
}

export type AnalyticsFreeStats = {
  connectedAccounts: number
  accountsNeedingReauth: number
  totalFollowers: number | null
  accountsByProvider: AnalyticsProviderAccountStat[]
  scheduledPosts: number
  publishedPosts: number
  draftPosts: number
  spend: AnalyticsSpend
}

export type AnalyticsPremiumTotals = {
  totals: AnalyticsMetrics
  previousTotals: AnalyticsMetrics
  delta: AnalyticsMetrics
  changePercent: Record<keyof AnalyticsMetrics, number | null>
}

export type AnalyticsOverviewResponse = {
  tier: AnalyticsTier
  range: AnalyticsRange
  period: {
    current: AnalyticsPeriodBounds
    previous: AnalyticsPeriodBounds
  }
  free: AnalyticsFreeStats
  premium: AnalyticsPremiumTotals | null
}

export type AnalyticsProviderSeries = {
  provider: SocialProvider
  series: AnalyticsSeriesPoint[]
}

export type AnalyticsGrowthResponse = {
  range: AnalyticsRange
  period: {
    current: AnalyticsPeriodBounds
    previous: AnalyticsPeriodBounds
  }
  series: AnalyticsSeriesPoint[]
  byProvider: AnalyticsProviderSeries[]
}

export type AnalyticsPlatformRow = {
  provider: SocialProvider
  accounts: number
  current: AnalyticsMetrics
  previous: AnalyticsMetrics
  changePercent: Record<keyof AnalyticsMetrics, number | null>
}

export type AnalyticsPlatformsResponse = {
  range: AnalyticsRange
  period: {
    current: AnalyticsPeriodBounds
    previous: AnalyticsPeriodBounds
  }
  platforms: AnalyticsPlatformRow[]
}

export type AnalyticsAnomalyMetric = 'followers' | 'reach' | 'views' | 'engagement'

export type AnalyticsAnomaly = {
  metric: AnalyticsAnomalyMetric
  /** null = workspace-wide */
  provider: SocialProvider | null
  date: string
  value: number
  baseline: number
  changePercent: number
  direction: 'spike' | 'drop'
  severity: 'warning' | 'critical'
}

export type AnalyticsAnomaliesResponse = {
  range: AnalyticsRange
  period: {
    current: AnalyticsPeriodBounds
    previous: AnalyticsPeriodBounds
  }
  anomalies: AnalyticsAnomaly[]
}
