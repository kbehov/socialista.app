import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    accessExpiresAt?: string
    refreshExpiresAt?: string
    error?: 'RefreshTokenError'
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      status?: string
      role?: string
    }
  }

  interface User {
    id: string
    status?: string
    role?: string
    accessToken?: string
    refreshToken?: string
    accessExpiresAt?: string
    refreshExpiresAt?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    accessToken?: string
    refreshToken?: string
    accessExpiresAt?: string
    refreshExpiresAt?: string
    status?: string
    role?: string
    error?: 'RefreshTokenError'
  }
}
