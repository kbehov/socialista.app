import { auth } from '@/auth'
import { ManagerDirectory } from './_components/manager-directory'
import { DashboardGreeting } from '@/components/dashboard'
import { PageHeader } from '@/components/headers/page-header'
import { getFirstName, getGreeting } from '@/utils/greeting'

export default async function ManagerPage() {
  const session = await auth()
  const { text: greeting, period } = getGreeting()
  const firstName = getFirstName(session?.user?.name)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={<DashboardGreeting greeting={greeting} name={firstName} period={period} />}
        description="Catalog, templates, files, and models for the product."
      />
      <ManagerDirectory />
    </div>
  )
}
