import type { Metadata } from 'next'

import { SITE_CONFIG } from './base'

/** Applied to dashboard segment titles (see `createDashboardLayoutMetadata`). */
export const DASHBOARD_TITLE_TEMPLATE = `%s · ${SITE_CONFIG.name}`

/**
 * Page-level dashboard metadata. Pass only the segment title; the dashboard layout
 * `title.template` appends ` · Socialista`.
 */
export function createDashboardMetadata(title: string): Metadata {
  return { title }
}

function formatDashboardTitle(segment: string): string {
  return DASHBOARD_TITLE_TEMPLATE.replace('%s', segment)
}

/** Metadata for `app/(app)/dashboard/layout.tsx` — owns the dashboard title template. */
export function createDashboardLayoutMetadata(defaultTitle = 'Dashboard'): Metadata {
  return {
    title: {
      default: formatDashboardTitle(defaultTitle),
      template: DASHBOARD_TITLE_TEMPLATE,
    },
  }
}
