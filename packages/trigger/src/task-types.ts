import type { refreshAccountToken } from './tasks/accounts/refresh-account-token.js'
import type { analyticsSweep } from './tasks/analytics/sweep-account-analytics.js'
import type { fetchAccountAnalyticsTask } from './tasks/analytics/fetch-account-analytics.js'
import type { realtimeImageGeneration } from './tasks/image/generate-image-realtime.js'
import type { realtimeStaticAdGeneration } from './tasks/image/generate-static-ad-realtime.js'
import type { cloneInfluencer } from './tasks/influencer/clone-influencer.js'
import type { generateInfluencer } from './tasks/influencer/generate-influencer.js'
import type { publishPost } from './tasks/posts/publish-post.js'
import type { exportVideo } from './tasks/video/export-video.js'

export type RealtimeImageGenerationTask = typeof realtimeImageGeneration
export type RealtimeStaticAdGenerationTask = typeof realtimeStaticAdGeneration
export type GenerateInfluencerTask = typeof generateInfluencer
export type CloneInfluencerTask = typeof cloneInfluencer
export type RefreshAccountTokenTask = typeof refreshAccountToken
export type PublishPostTask = typeof publishPost
export type AnalyticsSweepTask = typeof analyticsSweep
export type FetchAccountAnalyticsTask = typeof fetchAccountAnalyticsTask
export type ExportVideoTask = typeof exportVideo
