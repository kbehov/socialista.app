import { redirect } from 'next/navigation'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'

export default function DashboardPage() {
  redirect(DASHBOARD_ROUTES.HOME)
}
