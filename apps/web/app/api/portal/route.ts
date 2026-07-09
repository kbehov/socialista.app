import { CustomerPortal } from '@polar-sh/nextjs'

import { appUrl, polarServer } from '@/lib/polar/polar'
import { getWorkspaceBilling } from '@/services/workspace.service'

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN as string,
  getCustomerId: async (req: Request) => {
    const workspaceId = new URL(req.url).searchParams.get('workspaceId')
    if (!workspaceId) return ''

    const { data } = await getWorkspaceBilling(workspaceId)
    return data?.billing.polarCustomerId ?? ''
  },
  returnUrl: `${appUrl}/dashboard/upgrade`,
  server: polarServer,
})
