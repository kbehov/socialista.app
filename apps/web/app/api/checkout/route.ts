import { Checkout } from '@polar-sh/nextjs'

import { appUrl, polarServer } from '@/lib/polar/polar'

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: `${appUrl}/dashboard/upgrade?success=true`,
  returnUrl: `${appUrl}/dashboard/upgrade`,
  server: polarServer,
})
