export const DASHBOARD_ROUTES = {
  HOME: '/dashboard/files',
  UPGRADE: '/dashboard/upgrade',
  folder: (id: string) => `/dashboard/files/${id}`,
} as const

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
