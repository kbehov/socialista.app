import type { refreshAccountToken } from './tasks/accounts/refresh-account-token.js'
import type { analyticsSweep } from './tasks/analytics/sweep-account-analytics.js'
import type { fetchAccountAnalyticsTask } from './tasks/analytics/fetch-account-analytics.js'
import type { realtimeImageGeneration } from './tasks/image/generate-image-realtime.js'
import type { realtimeStaticAdGeneration } from './tasks/image/generate-static-ad-realtime.js'
import type { cloneInfluencer } from './tasks/influencer/clone-influencer.js'
import type { generateInfluencer } from './tasks/influencer/generate-influencer.js'
import type { publishPost } from './tasks/posts/publish-post.js'
import type { generateUgcStills } from './tasks/ugc/generate-ugc-stills.js'
import type { generateUgcVideo } from './tasks/ugc/generate-ugc-video.js'
import type { generateUgcImageAd } from './tasks/ugc/generate-ugc-image-ad.js'
import type { assembleUgcProject } from './tasks/ugc/assemble-ugc-project.js'
import type { exportVideo } from './tasks/video/export-video.js'
import type { generateVideoCaptions } from './tasks/video/generate-video-captions.js'
import type { realtimeVideoGeneration } from './tasks/video/generate-video-realtime.js'
import type { realtimeSlideshowGeneration } from './tasks/slideshow/generate-slideshow-realtime.js'

export type RealtimeImageGenerationTask = typeof realtimeImageGeneration
export type RealtimeStaticAdGenerationTask = typeof realtimeStaticAdGeneration
export type GenerateInfluencerTask = typeof generateInfluencer
export type CloneInfluencerTask = typeof cloneInfluencer
export type GenerateUgcStillsTask = typeof generateUgcStills
export type GenerateUgcVideoTask = typeof generateUgcVideo
export type GenerateUgcImageAdTask = typeof generateUgcImageAd
export type AssembleUgcProjectTask = typeof assembleUgcProject
export type RefreshAccountTokenTask = typeof refreshAccountToken
export type PublishPostTask = typeof publishPost
export type AnalyticsSweepTask = typeof analyticsSweep
export type FetchAccountAnalyticsTask = typeof fetchAccountAnalyticsTask
export type ExportVideoTask = typeof exportVideo
export type GenerateVideoCaptionsTask = typeof generateVideoCaptions
export type RealtimeVideoGenerationTask = typeof realtimeVideoGeneration
export type RealtimeSlideshowGenerationTask = typeof realtimeSlideshowGeneration
