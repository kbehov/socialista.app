import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { redirect } from 'next/navigation'

export default function ProductsRedirectPage() {
  redirect(DASHBOARD_ROUTES.PRODUCTS)
}
