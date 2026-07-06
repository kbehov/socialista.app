import { api } from '@/lib/api'
import { SLIDESHOW_ROUTES } from '@/constants/routes'
import type { SlideshowResponse } from '@socialista/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params
  const result = await api.get<{ slideshow: SlideshowResponse }>(SLIDESHOW_ROUTES.GET_BY_ID(id), {
    signal: request.signal,
  })
  return Response.json(result)
}
