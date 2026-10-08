import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { redirect } from 'next/navigation'

export const metadata = createDashboardMetadata('Products')

export default function ProductsRedirectPage() {
  redirect(DASHBOARD_ROUTES.PRODUCTS)
}
