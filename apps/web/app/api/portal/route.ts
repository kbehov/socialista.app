import { NextResponse } from 'next/server'

import { ApiError } from '@/lib/api'
import { appUrl, polar } from '@/lib/polar/polar'
import { getWorkspaceBilling } from '@/services/workspace.service'

export async function GET(req: Request) {
  const workspaceId = new URL(req.url).searchParams.get('workspaceId')
  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
  }

  let customerId: string | undefined
  try {
    const { data } = await getWorkspaceBilling(workspaceId)
    customerId = data?.billing.polarCustomerId
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    throw error
  }

  if (!customerId) {
    return NextResponse.json({ error: 'customerId not defined' }, { status: 400 })
  }

  const { customerPortalUrl } = await polar.customerSessions.create({
    returnUrl: `${appUrl}/dashboard/upgrade`,
    customerId,
  })

  return NextResponse.redirect(customerPortalUrl)
}
