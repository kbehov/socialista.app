export const ACCESS_TTL_SEC = 60 * 60 * 24 * 1 // 1 days
export const REFRESH_TTL_SEC = 60 * 60 * 24 * 7 // 7 days
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
