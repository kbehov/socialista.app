'use client'

import Logo from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { acceptInvitation, rejectInvitation } from '@/services/invitation.service'
import { setCurrentWorkspaceIdClient } from '@/utils/cookie.utils'
import { getInitials } from '@/utils/user'
import type { InvitationPreviewResponse } from '@socialista/types'
import { Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

type InviteAcceptCardProps = {
  token: string
  preview: InvitationPreviewResponse
}

export function InviteAcceptCard({ token, preview }: InviteAcceptCardProps) {
  const router = useRouter()
  const [isSubmitting, startTransition] = useTransition()
  const { invitation, workspace, expired } = preview
  const canRespond = invitation.status === 'pending' && !expired

  const handleAccept = () => {
    startTransition(async () => {
      const response = await acceptInvitation({ token })
      if (!response.success) {
        toast.error(response.message ?? 'Couldn’t accept invite')
        return
      }

      const workspaceId = response.data?.workspace.id ?? workspace.id
      setCurrentWorkspaceIdClient(workspaceId)
      toast.success(`Joined ${workspace.name}`)
      router.push(DASHBOARD_ROUTES.ROOT)
      router.refresh()
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const response = await rejectInvitation({ token })
      if (!response.success) {
        toast.error(response.message ?? 'Couldn’t decline invite')
        return
      }

      toast.success('Invite declined')
      router.push(DASHBOARD_ROUTES.ROOT)
      router.refresh()
    })
  }

  const message = !canRespond
    ? invitation.status === 'accepted'
      ? 'This invite has already been accepted.'
      : invitation.status === 'rejected'
        ? 'This invite was declined.'
        : 'This invite has expired.'
    : `You’ve been invited as ${invitation.role === 'admin' ? 'an admin' : 'a member'}.`

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Logo href="/" />
      </div>
      <div className="w-full max-w-[420px] rounded-2xl border border-border/60 bg-background p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/40',
            )}
          >
            {workspace.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={workspace.logo} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-sm font-semibold tracking-tight text-muted-foreground">
                {getInitials(workspace.name)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Workspace invite</p>
            <h1 className="truncate text-lg font-semibold tracking-[-0.03em]">{workspace.name}</h1>
          </div>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{message}</p>

        {canRespond ? (
          <div className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 flex-1 rounded-full"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              Decline
            </Button>
            <Button type="button" className="h-9 flex-1 rounded-full" onClick={handleAccept} disabled={isSubmitting}>
              {isSubmitting ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
              Join workspace
            </Button>
          </div>
        ) : (
          <Button type="button" className="mt-6 h-9 w-full rounded-full" asChild>
            <Link href={DASHBOARD_ROUTES.ROOT}>Go to dashboard</Link>
          </Button>
        )}
      </div>
    </main>
  )
}
