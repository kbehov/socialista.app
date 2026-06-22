export const DASHBOARD_ROUTES = {
  HOME: '/dashboard',
  folder: (id: string) => `/dashboard/folders/${id}`,
} as const

export const MANAGER_FILES_ROUTES = {
  HOME: '/manager/collections',
  folder: (id: string) => `/manager/collections/${id}`,
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
