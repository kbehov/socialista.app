import { CustomerPortal } from '@polar-sh/nextjs'

import { ensureDb } from '@/lib/db'
import { appUrl, polarServer } from '@/lib/polar'
import { getWorkspaceById } from '@socialista/db'

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN as string,
  getCustomerId: async (req: Request) => {
    const workspaceId = new URL(req.url).searchParams.get('workspaceId')
    if (!workspaceId) return ''

    await ensureDb()
    const workspace = await getWorkspaceById(workspaceId)
    return workspace?.billing.polarCustomerId ?? ''
  },
  returnUrl: `${appUrl}/dashboard/upgrade`,
  server: polarServer,
})
