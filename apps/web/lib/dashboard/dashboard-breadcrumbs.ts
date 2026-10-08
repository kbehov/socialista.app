import { DASHBOARD_ROUTES, isDashboardRootPath, isStaticAdsPath } from '@/constants/app-routes'

export type DashboardBreadcrumbItem = {
  label: string
  href?: string
}

function crumbs(segments: Array<{ label: string; href?: string }>): DashboardBreadcrumbItem[] {
  if (segments.length === 0) return []

  return segments.map((segment, index) => {
    const isLast = index === segments.length - 1
    return {
      label: segment.label,
      href: isLast ? undefined : segment.href,
    }
  })
}

function matchPath(pathname: string, pattern: RegExp): string[] | null {
  const match = pathname.match(pattern)
  if (!match) return null
  return match.slice(1)
}

export function getDashboardBreadcrumbs(pathname: string): DashboardBreadcrumbItem[] {
  const path = pathname.split('?')[0]

  if (!path.startsWith('/dashboard')) return []

  if (isDashboardRootPath(path)) {
    return crumbs([{ label: 'Analytics', href: DASHBOARD_ROUTES.ROOT }])
  }

  if (path === DASHBOARD_ROUTES.FILES) {
    return crumbs([{ label: 'Files', href: DASHBOARD_ROUTES.FILES }])
  }

  if (matchPath(path, /^\/dashboard\/files\/[^/]+$/)) {
    return crumbs([
      { label: 'Files', href: DASHBOARD_ROUTES.FILES },
      { label: 'Folder' },
    ])
  }

  if (path === DASHBOARD_ROUTES.ACCOUNTS) {
    return crumbs([{ label: 'Accounts', href: DASHBOARD_ROUTES.ACCOUNTS }])
  }

  if (matchPath(path, /^\/dashboard\/accounts\/analytics\/[^/]+$/)) {
    return crumbs([
      { label: 'Accounts', href: DASHBOARD_ROUTES.ACCOUNTS },
      { label: 'Analytics' },
    ])
  }

  if (path === DASHBOARD_ROUTES.POSTS) {
    return crumbs([{ label: 'Posts', href: DASHBOARD_ROUTES.POSTS }])
  }

  if (path === '/dashboard/posts/create') {
    return crumbs([
      { label: 'Posts', href: DASHBOARD_ROUTES.POSTS },
      { label: 'Create' },
    ])
  }

  if (path === DASHBOARD_ROUTES.GENERATIONS) {
    return crumbs([{ label: 'Generations', href: DASHBOARD_ROUTES.GENERATIONS }])
  }

  if (path === DASHBOARD_ROUTES.NOTIFICATIONS) {
    return crumbs([{ label: 'Notifications', href: DASHBOARD_ROUTES.NOTIFICATIONS }])
  }

  if (path === DASHBOARD_ROUTES.ACCOUNT) {
    return crumbs([{ label: 'Account', href: DASHBOARD_ROUTES.ACCOUNT }])
  }

  if (path === DASHBOARD_ROUTES.UPGRADE) {
    return crumbs([{ label: 'Upgrade', href: DASHBOARD_ROUTES.UPGRADE }])
  }

  if (path === DASHBOARD_ROUTES.SETTINGS) {
    return crumbs([{ label: 'Settings', href: DASHBOARD_ROUTES.SETTINGS }])
  }

  if (path === DASHBOARD_ROUTES.SETTINGS_MEMBERS) {
    return crumbs([
      { label: 'Settings', href: DASHBOARD_ROUTES.SETTINGS },
      { label: 'Members' },
    ])
  }

  if (path === DASHBOARD_ROUTES.SETTINGS_BILLING) {
    return crumbs([
      { label: 'Settings', href: DASHBOARD_ROUTES.SETTINGS },
      { label: 'Plan' },
    ])
  }

  if (path === DASHBOARD_ROUTES.BRANDS) {
    return crumbs([
      { label: 'Context', href: DASHBOARD_ROUTES.PRODUCTS },
      { label: 'Brands' },
    ])
  }

  if (path === DASHBOARD_ROUTES.PRODUCTS || path === '/dashboard/products') {
    return crumbs([
      { label: 'Context', href: DASHBOARD_ROUTES.PRODUCTS },
      { label: 'Products' },
    ])
  }

  if (path === DASHBOARD_ROUTES.SKILLS) {
    return crumbs([
      { label: 'Context', href: DASHBOARD_ROUTES.PRODUCTS },
      { label: 'Skills' },
    ])
  }

  if (path === DASHBOARD_ROUTES.createSkill) {
    return crumbs([
      { label: 'Context', href: DASHBOARD_ROUTES.PRODUCTS },
      { label: 'Skills', href: DASHBOARD_ROUTES.SKILLS },
      { label: 'Create' },
    ])
  }

  if (matchPath(path, /^\/dashboard\/context\/skills\/[^/]+\/edit$/)) {
    return crumbs([
      { label: 'Context', href: DASHBOARD_ROUTES.PRODUCTS },
      { label: 'Skills', href: DASHBOARD_ROUTES.SKILLS },
      { label: 'Edit' },
    ])
  }

  const studio = DASHBOARD_ROUTES.STUDIO

  if (isStaticAdsPath(path)) {
    if (path === studio.STATIC_ADS) {
      return crumbs([{ label: 'Static ads', href: studio.STATIC_ADS }])
    }
    if (matchPath(path, /^\/dashboard\/studio\/images\/static-ads\/[^/]+$/)) {
      return crumbs([
        { label: 'Static ads', href: studio.STATIC_ADS },
        { label: 'Generation' },
      ])
    }
  }

  if (path === studio.IMAGES) {
    return crumbs([{ label: 'Images', href: studio.IMAGES }])
  }

  if (matchPath(path, /^\/dashboard\/studio\/images\/[^/]+$/)) {
    return crumbs([
      { label: 'Images', href: studio.IMAGES },
      { label: 'Generation' },
    ])
  }

  if (path === studio.VIDEOS) {
    return crumbs([{ label: 'Videos', href: studio.VIDEOS }])
  }

  if (path === studio.VIDEO_CREATE) {
    return crumbs([
      { label: 'Videos', href: studio.VIDEOS },
      { label: 'Create' },
    ])
  }

  if (matchPath(path, /^\/dashboard\/studio\/videos\/generate\/[^/]+$/)) {
    return crumbs([
      { label: 'Videos', href: studio.VIDEOS },
      { label: 'Generation' },
    ])
  }

  if (matchPath(path, /^\/dashboard\/studio\/videos\/[^/]+$/)) {
    return crumbs([
      { label: 'Videos', href: studio.VIDEOS },
      { label: 'Editor' },
    ])
  }

  if (path === studio.SLIDESHOWS) {
    return crumbs([{ label: 'Slideshows', href: studio.SLIDESHOWS }])
  }

  if (path === studio.SLIDESHOW_CREATE) {
    return crumbs([
      { label: 'Slideshows', href: studio.SLIDESHOWS },
      { label: 'Create' },
    ])
  }

  if (matchPath(path, /^\/dashboard\/studio\/slideshows\/run\/[^/]+$/)) {
    return crumbs([
      { label: 'Slideshows', href: studio.SLIDESHOWS },
      { label: 'Generation' },
    ])
  }

  if (matchPath(path, /^\/dashboard\/studio\/slideshows\/[^/]+$/)) {
    return crumbs([
      { label: 'Slideshows', href: studio.SLIDESHOWS },
      { label: 'Editor' },
    ])
  }

  if (path === studio.INFLUENCERS) {
    return crumbs([{ label: 'Influencers', href: studio.INFLUENCERS }])
  }

  if (path === studio.INFLUENCER_CREATE) {
    return crumbs([
      { label: 'Influencers', href: studio.INFLUENCERS },
      { label: 'Create' },
    ])
  }

  if (matchPath(path, /^\/dashboard\/studio\/influencers\/[^/]+$/)) {
    return crumbs([
      { label: 'Influencers', href: studio.INFLUENCERS },
      { label: 'Influencer' },
    ])
  }

  if (path === studio.UGC) {
    return crumbs([{ label: 'UGC ads', href: studio.UGC }])
  }

  if (path === studio.UGC_CREATE) {
    return crumbs([
      { label: 'UGC ads', href: studio.UGC },
      { label: 'Create' },
    ])
  }

  if (matchPath(path, /^\/dashboard\/studio\/ugc\/[^/]+$/)) {
    return crumbs([
      { label: 'UGC ads', href: studio.UGC },
      { label: 'Project' },
    ])
  }

  return crumbs([{ label: 'Dashboard', href: DASHBOARD_ROUTES.ROOT }])
}
