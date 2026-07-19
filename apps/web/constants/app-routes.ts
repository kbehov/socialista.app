export const DASHBOARD_ROUTES = {
  ROOT: '/dashboard',
  HOME: '/dashboard/files',
  UPGRADE: '/dashboard/upgrade',
  FILES: '/dashboard/files',
  folder: (id: string) => `/dashboard/files/${id}`,
  PRODUCTS: '/dashboard/products',
  ACCOUNTS: '/dashboard/accounts',
  GENERATIONS: '/dashboard/generations',
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

export function isDashboardGenerationsPath(pathname: string) {
  return (
    pathname === DASHBOARD_ROUTES.GENERATIONS ||
    pathname.startsWith(`${DASHBOARD_ROUTES.GENERATIONS}/`)
  )
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

export function isStudioSegmentPath(pathname: string, segment: 'slideshows' | 'videos') {
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
