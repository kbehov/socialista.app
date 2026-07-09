import { SLIDESHOW_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type { SlideshowResponse } from '@socialista/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return Response.json({ error: 'ID is required' }, { status: 400 })
  }
  const result = await api.get<{ slideshow: SlideshowResponse }>(SLIDESHOW_ROUTES.GET_BY_ID(id), {
    signal: request.signal,
  })
  return Response.json(result)
}
