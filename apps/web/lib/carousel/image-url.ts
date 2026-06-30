/** Route remote image URLs through the server proxy for display and export. */
export function proxiedImageUrl(url: string): string {
  if (!url || url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  return `/api/image-proxy?url=${encodeURIComponent(url)}`
}
