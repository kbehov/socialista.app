export const DASHBOARD_ROUTES = {
  ROOT: '/dashboard',
  HOME: '/dashboard/files',
  UPGRADE: '/dashboard/upgrade',
  FILES: '/dashboard/files',
  folder: (id: string) => `/dashboard/files/${id}`,
  PRODUCTS: '/dashboard/products',
  ACCOUNTS: '/dashboard/accounts',
  accountAnalytics: (accountId: string) => `/dashboard/accounts/analytics/${accountId}`,
  ANALYTICS: '/dashboard/analytics',
  POSTS: '/dashboard/posts',
  createPost: (opts?: { generationId?: string; slideshowId?: string }) => {
    const params = new URLSearchParams()
    if (opts?.generationId) params.set('generationId', opts.generationId)
    if (opts?.slideshowId) params.set('slideshowId', opts.slideshowId)
    const qs = params.toString()
    return qs ? `/dashboard/posts/create?${qs}` : '/dashboard/posts/create'
  },
  GENERATIONS: '/dashboard/generations',
  NOTIFICATIONS: '/dashboard/notifications',
  ACCOUNT: '/dashboard/account',
  SETTINGS: '/dashboard/settings',
  SETTINGS_MEMBERS: '/dashboard/settings/members',
  SETTINGS_BILLING: '/dashboard/settings/billing',
  STUDIO: {
    IMAGES: '/dashboard/studio/images',
    imageRun: (runId: string) => `/dashboard/studio/images/${runId}`,
    STATIC_ADS: '/dashboard/studio/images/static-ads',
    staticAdRun: (runId: string) => `/dashboard/studio/images/static-ads/${runId}`,
    SLIDESHOWS: '/dashboard/studio/slideshows',
    slideshow: (id: string) => `/dashboard/studio/slideshows/${id}`,
    SLIDESHOW_CREATE: '/dashboard/studio/slideshows/create',
    VIDEOS: '/dashboard/studio/videos',
    video: (id: string) => `/dashboard/studio/videos/${id}`,
    VIDEO_CREATE: '/dashboard/studio/videos/create',
    videoRun: (runId: string) => `/dashboard/studio/videos/generate/${runId}`,
    INFLUENCERS: '/dashboard/studio/influencers',
    influencer: (id: string) => `/dashboard/studio/influencers/${id}`,
    INFLUENCER_CREATE: '/dashboard/studio/influencers/create',
    INFLUENCER_CLONE: '/dashboard/studio/influencers/clone',
    UGC: '/dashboard/studio/ugc',
    ugcProject: (id: string) => `/dashboard/studio/ugc/${id}`,
    UGC_CREATE: '/dashboard/studio/ugc/create',
  },
} as const

export function isDashboardFilesPath(pathname: string) {
  return pathname === DASHBOARD_ROUTES.FILES || pathname.startsWith(`${DASHBOARD_ROUTES.FILES}/`)
}

export function isDashboardProductsPath(pathname: string) {
  return (
    pathname === DASHBOARD_ROUTES.PRODUCTS || pathname.startsWith(`${DASHBOARD_ROUTES.PRODUCTS}/`)
  )
}

export function isDashboardAccountsPath(pathname: string) {
  return (
    pathname === DASHBOARD_ROUTES.ACCOUNTS || pathname.startsWith(`${DASHBOARD_ROUTES.ACCOUNTS}/`)
  )
}

export function isDashboardRootPath(pathname: string) {
  return pathname === DASHBOARD_ROUTES.ROOT
}

export function isDashboardAnalyticsPath(pathname: string) {
  return (
    pathname === DASHBOARD_ROUTES.ANALYTICS ||
    pathname.startsWith(`${DASHBOARD_ROUTES.ANALYTICS}/`)
  )
}

export function isDashboardGenerationsPath(pathname: string) {
  return (
    pathname === DASHBOARD_ROUTES.GENERATIONS ||
    pathname.startsWith(`${DASHBOARD_ROUTES.GENERATIONS}/`)
  )
}

export function isDashboardNotificationsPath(pathname: string) {
  return (
    pathname === DASHBOARD_ROUTES.NOTIFICATIONS ||
    pathname.startsWith(`${DASHBOARD_ROUTES.NOTIFICATIONS}/`)
  )
}

export function isDashboardSettingsPath(pathname: string) {
  return (
    pathname === DASHBOARD_ROUTES.SETTINGS || pathname.startsWith(`${DASHBOARD_ROUTES.SETTINGS}/`)
  )
}

export function isDashboardPostsPath(pathname: string) {
  return pathname === DASHBOARD_ROUTES.POSTS || pathname.startsWith(`${DASHBOARD_ROUTES.POSTS}/`)
}

export function isStudioImagesPath(pathname: string) {
  if (pathname === DASHBOARD_ROUTES.STUDIO.IMAGES) return true
  if (!pathname.startsWith(`${DASHBOARD_ROUTES.STUDIO.IMAGES}/`)) return false
  return !pathname.startsWith(DASHBOARD_ROUTES.STUDIO.STATIC_ADS)
}

export function isStaticAdsPath(pathname: string) {
  return (
    pathname === DASHBOARD_ROUTES.STUDIO.STATIC_ADS ||
    pathname.startsWith(`${DASHBOARD_ROUTES.STUDIO.STATIC_ADS}/`)
  )
}

export function isStudioSegmentPath(
  pathname: string,
  segment: 'slideshows' | 'videos' | 'influencers' | 'ugc',
) {
  const base = `/dashboard/studio/${segment}`
  return pathname === base || pathname.startsWith(`${base}/`)
}

export const MANAGER_FILES_ROUTES = {
  HOME: '/manager/files',
  folder: (id: string) => `/manager/files/${id}`,
} as const

export type FilesRoutePaths = {
  root: string
  folder: (id: string) => string
}

export const dashboardFilesPaths: FilesRoutePaths = {
  root: DASHBOARD_ROUTES.HOME,
  folder: DASHBOARD_ROUTES.folder,
}

export const managerFilesPaths: FilesRoutePaths = {
  root: MANAGER_FILES_ROUTES.HOME,
  folder: MANAGER_FILES_ROUTES.folder,
}

export type FilesPathsVariant = 'dashboard' | 'manager'

const filesPathsByVariant: Record<FilesPathsVariant, FilesRoutePaths> = {
  dashboard: dashboardFilesPaths,
  manager: managerFilesPaths,
}

export function getFilesPaths(variant: FilesPathsVariant): FilesRoutePaths {
  return filesPathsByVariant[variant]
}

export function invitePath(token: string) {
  return `/invite/${token}`
}
