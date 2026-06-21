import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL ?? 'http://localhost:8080'

export async function POST(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  const accessToken = session?.accessToken as string | undefined

  if (!userId || !accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const response = await fetch(`${API_URL}/inspirations/upload-video`, {
    method: 'POST',
    headers: {
      'x-user-id': userId,
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })

  const payload = (await response.json()) as {
    success?: boolean
    data?: { url?: string }
    message?: string
    error?: string
  }

  if (!response.ok || !payload.success) {
    return NextResponse.json(
      { error: payload.message ?? payload.error ?? 'Failed to upload video' },
      { status: response.status },
    )
  }

  return NextResponse.json({ url: payload.data?.url })
}
