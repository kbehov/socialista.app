export const ACCESS_TTL_SEC = 60 * 60 * 24 * 1 // 1 days
export const REFRESH_TTL_SEC = 60 * 60 * 24 * 7 // 7 days
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/mp4',
  'video/webm',
  'video/ogg',
])
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MiB (original, before conversion)
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50 MiB (original, before conversion)
