/** Route remote image URLs through the server proxy for canvas/export and fetch. */
export function proxiedImageUrl(url: string): string {
  if (!url || url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  return `/api/image-proxy?url=${encodeURIComponent(url)}`
}

const HOTLINK_HOST_HINTS = ['tiktok', 'byteoversea', 'muscdn']

/** True when the CDN blocks hotlinking without a server-side Referer. */
export function needsImageHotlinkProxy(url: string): boolean {
  try {
    const host = new URL(unwrapProxiedImageUrl(url)).hostname.toLowerCase()
    return HOTLINK_HOST_HINTS.some(hint => host.includes(hint))
  } catch {
    return false
  }
}

/**
 * URL for `<img>` / CSS display. Uses the original CDN except for hosts that
 * reject hotlinking (TikTok). Canvas export still rewrites through the proxy.
 */
export function displayImageUrl(url: string): string {
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) return url
  if (url.startsWith('/') && !url.includes('/api/image-proxy')) return url
  const unwrapped = unwrapProxiedImageUrl(url)
  if (needsImageHotlinkProxy(unwrapped)) return proxiedImageUrl(unwrapped)
  return unwrapped
}

/** Unwrap nested `/api/image-proxy?url=…` wrappers down to the original remote URL. */
export function unwrapProxiedImageUrl(url: string): string {
  let current = url.trim()
  if (!current) return current

  for (let i = 0; i < 5; i++) {
    const proxyPathIndex = current.indexOf('/api/image-proxy')
    if (proxyPathIndex === -1) break

    const queryIndex = current.indexOf('?', proxyPathIndex)
    if (queryIndex === -1) break

    const inner = new URLSearchParams(current.slice(queryIndex + 1)).get('url')
    if (!inner || inner === current) break
    current = inner
  }

  return current
}

/** True when the slide image still depends on an external or local transient URL. */
export function isExternalSlideImageUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return true
  if (trimmed.includes('/api/image-proxy')) return true
  return /^https?:\/\//i.test(trimmed)
}
