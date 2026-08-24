import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { redirect } from 'next/navigation'

export default function ContextIndexPage() {
  redirect(DASHBOARD_ROUTES.PRODUCTS)
}
