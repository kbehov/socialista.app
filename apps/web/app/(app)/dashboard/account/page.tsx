import { AccountSettings } from '@/components/settings/account-settings'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/headers/page-header'
import { auth } from '@/auth'
import { getMe } from '@/services/user.service'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const response = await getMe()
  const user = response.data?.user

  if (!response.success || !user) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader title="Account" description="Manage your profile and sign-in details." />
        <ErrorState
          title={response.message ?? 'Couldn’t load your account'}
          description="Refresh the page to try again."
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Account" description="Manage your profile and sign-in details." />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 pb-12">
        <AccountSettings user={user} />
      </div>
    </div>
  )
}
