'use server'

const UNSPLASH_API_BASE = 'https://api.unsplash.com'

type UnsplashPhotoUrls = {
  raw?: string
  full?: string
  regular?: string
  small?: string
  thumb?: string
}

type UnsplashPhotoUser = {
  name?: string
  links?: { html?: string }
}

type UnsplashApiPhoto = {
  id: string
  description?: string | null
  alt_description?: string | null
  width?: number
  height?: number
  urls?: UnsplashPhotoUrls
  links?: { download_location?: string }
  user?: UnsplashPhotoUser
}

type UnsplashApiSearchResponse = {
  total?: number
  total_pages?: number
  results?: UnsplashApiPhoto[]
}

export type UnsplashPhotoResult = {
  id: string
  imageUrl: string
  previewUrl: string
  title?: string | null
  altText?: string | null
  width?: number
  height?: number
  photographerName?: string
  photographerUrl?: string
  downloadLocation: string
}

export type UnsplashSearchPhotosResponse = {
  items: UnsplashPhotoResult[]
  page: number
  totalPages: number
}

function getUnsplashAccessKey(): string {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim()
  if (!key) {
    throw new Error('Unsplash API is not configured')
  }
  return key
}

function normalizePhoto(photo: UnsplashApiPhoto): UnsplashPhotoResult | null {
  const imageUrl = photo.urls?.regular ?? photo.urls?.full ?? photo.urls?.small
  const previewUrl = photo.urls?.small ?? photo.urls?.thumb ?? imageUrl
  const downloadLocation = photo.links?.download_location

  if (!imageUrl || !downloadLocation) return null

  const photographerUrl = photo.user?.links?.html
    ? `${photo.user.links.html}?utm_source=socialista&utm_medium=referral`
    : undefined

  return {
    id: photo.id,
    imageUrl,
    previewUrl: previewUrl ?? '',
    title: photo.description ?? null,
    altText: photo.alt_description ?? photo.description ?? null,
    width: photo.width,
    height: photo.height,
    photographerName: photo.user?.name,
    photographerUrl,
    downloadLocation,
  }
}

async function unsplashFetch<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(`${UNSPLASH_API_BASE}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${getUnsplashAccessKey()}`,
      'Accept-Version': 'v1',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  })

  if (!response.ok) {
    let message = `Unsplash API error (${response.status})`
    try {
      const body = (await response.json()) as { errors?: string[] }
      if (body.errors?.[0]) message = body.errors[0]
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function searchUnsplashPhotos(input: {
  query: string
  page?: number
  perPage?: number
}): Promise<UnsplashSearchPhotosResponse> {
  const query = input.query.trim()
  if (!query) {
    throw new Error('Search query is required')
  }

  const page = Math.max(input.page ?? 1, 1)
  const perPage = Math.min(Math.max(input.perPage ?? 30, 1), 30)

  const data = await unsplashFetch<UnsplashApiSearchResponse>('/search/photos', {
    query,
    page: String(page),
    per_page: String(perPage),
  })

  const items = (data.results ?? []).map(normalizePhoto).filter((photo): photo is UnsplashPhotoResult => photo != null)

  return {
    items,
    page,
    totalPages: data.total_pages ?? page,
  }
}

/** Required by Unsplash API guidelines when a photo is used. */
export async function trackUnsplashDownload(downloadLocation: string): Promise<void> {
  if (!downloadLocation.startsWith('https://api.unsplash.com/')) return

  try {
    await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${getUnsplashAccessKey()}`,
        'Accept-Version': 'v1',
      },
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    })
  } catch {
    // Non-blocking attribution tracking
  }
}
