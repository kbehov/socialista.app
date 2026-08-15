import { InviteAcceptCard } from '@/components/settings/invite-accept-card'
import Logo from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES, invitePath } from '@/constants/app-routes'
import { previewInvitation } from '@/services/invitation.service'
import { auth } from '@/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type InvitePageProps = {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(invitePath(token))}`)
  }

  const preview = await previewInvitation(token)

  if (!preview.success || !preview.data) {
    const isWrongEmail = preview.message?.toLowerCase().includes('different email')

    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        <div className="mb-8">
          <Logo href="/" />
        </div>
        <div className="w-full max-w-[420px] rounded-2xl border border-border/60 bg-background p-6 text-center shadow-xs">
          <h1 className="text-lg font-semibold tracking-[-0.03em]">
            {isWrongEmail ? 'This invite is for a different email' : 'Invite unavailable'}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {isWrongEmail
              ? `Sign in with ${session.user.email ? 'the invited address' : 'the email this invite was sent to'} to continue.`
              : (preview.message ?? 'This invite is missing or no longer valid.')}
          </p>
          <Button type="button" className="mt-6 h-9 rounded-full px-4" asChild>
            <Link href={DASHBOARD_ROUTES.ROOT}>Go to dashboard</Link>
          </Button>
        </div>
      </main>
    )
  }

  return <InviteAcceptCard token={token} preview={preview.data} />
}
