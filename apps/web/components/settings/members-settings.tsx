'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { DashboardSection } from '@/components/dashboard'
import { PaywallDialog } from '@/components/paywall/paywall-dialog'
import { InviteMemberDialog } from '@/components/settings/invite-member-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePaywall } from '@/hooks/use-paywall'
import { getInviteUrl } from '@/lib/invite-url'
import { cn } from '@/lib/utils'
import { deleteInvitation } from '@/services/invitation.service'
import { removeWorkspaceMember, updateWorkspaceMember } from '@/services/workspace.service'
import { getInitials } from '@/utils/user'
import type { InvitationResponse, WorkspaceMemberResponse, WorkspaceResponse } from '@socialista/types'
import { CheckIcon, CopyIcon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type MembersSettingsProps = {
  workspace: WorkspaceResponse
  members: WorkspaceMemberResponse[]
  invitations: InvitationResponse[]
}

function roleLabel(role: string) {
  if (role === 'owner') return 'Owner'
  if (role === 'admin') return 'Admin'
  return 'Member'
}

export function MembersSettings({ workspace, members, invitations }: MembersSettingsProps) {
  const router = useRouter()
  const paywall = usePaywall({ workspaceId: workspace.id, currentPlan: workspace.billing.plan })
  const [inviteOpen, setInviteOpen] = useState(false)
  const [pendingInvites, setPendingInvites] = useState(invitations)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [removeMember, setRemoveMember] = useState<WorkspaceMemberResponse | null>(null)
  const [revokeInvite, setRevokeInvite] = useState<InvitationResponse | null>(null)
  const [isPending, startTransition] = useTransition()

  const seatLimit = workspace.limits.members
  const atCapacity = members.length >= seatLimit

  const handleInviteClick = () => {
    if (atCapacity) {
      paywall.show('members_limit')
      return
    }
    setInviteOpen(true)
  }

  const handleRoleChange = (member: WorkspaceMemberResponse, role: 'admin' | 'member') => {
    if (role === member.role) return

    startTransition(async () => {
      try {
        const response = await updateWorkspaceMember(workspace.id, member.userId, { role })
        if (!response.success) {
          toast.error(response.message ?? 'Couldn’t update role')
          return
        }
        toast.success('Role updated')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Couldn’t update role')
      }
    })
  }

  const handleRemoveMember = () => {
    if (!removeMember) return
    const memberId = removeMember.userId

    startTransition(async () => {
      try {
        const response = await removeWorkspaceMember(workspace.id, memberId)
        setRemoveMember(null)
        if (!response.success) {
          toast.error(response.message ?? 'Couldn’t remove member')
          return
        }
        toast.success('Member removed')
        router.refresh()
      } catch (error) {
        setRemoveMember(null)
        toast.error(error instanceof Error ? error.message : 'Couldn’t remove member')
      }
    })
  }

  const handleCopyInvite = async (invitation: InvitationResponse) => {
    if (!invitation.token) {
      toast.error('Invite link is no longer available')
      return
    }
    try {
      await navigator.clipboard.writeText(getInviteUrl(invitation.token))
      setCopiedId(invitation.id)
      toast.success('Link copied')
      window.setTimeout(() => setCopiedId(current => (current === invitation.id ? null : current)), 1600)
    } catch {
      toast.error('Couldn’t copy link')
    }
  }

  const handleRevoke = () => {
    if (!revokeInvite) return
    const invitationId = revokeInvite.id

    startTransition(async () => {
      try {
        const response = await deleteInvitation(invitationId, workspace.id)
        setRevokeInvite(null)
        if (!response.success) {
          toast.error(response.message ?? 'Couldn’t revoke invite')
          return
        }
        setPendingInvites(current => current.filter(item => item.id !== invitationId))
        toast.success('Invite revoked')
        router.refresh()
      } catch (error) {
        setRevokeInvite(null)
        toast.error(error instanceof Error ? error.message : 'Couldn’t revoke invite')
      }
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardSection
        title="People"
        description={`${members.length} of ${seatLimit} seats`}
        action={
          <Button type="button" size="sm" className="h-8 rounded-full px-3" onClick={handleInviteClick}>
            <PlusIcon className="size-3.5" strokeWidth={1.75} />
            Invite
          </Button>
        }
      >
        <ul className="divide-y divide-border/50">
          {members.map(member => {
            const name = member.user?.name ?? 'Member'
            const email = member.user?.email ?? ''
            const isOwner = member.role === 'owner'

            return (
              <li key={member.userId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar className="size-8 rounded-lg">
                  {member.user?.avatar ? <AvatarImage src={member.user.avatar} alt="" /> : null}
                  <AvatarFallback className="rounded-lg text-[11px] font-medium">{getInitials(name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium tracking-tight">{name}</p>
                  {email ? <p className="truncate text-[11px] text-muted-foreground">{email}</p> : null}
                </div>
                {isOwner ? (
                  <Badge variant="secondary" className="capitalize">
                    Owner
                  </Badge>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Select
                      value={member.role}
                      onValueChange={value => handleRoleChange(member, value as 'admin' | 'member')}
                      disabled={isPending}
                    >
                      <SelectTrigger size="sm" className="h-7 w-[6.5rem] rounded-lg text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => setRemoveMember(member)}
                      disabled={isPending}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </DashboardSection>

      {pendingInvites.length > 0 ? (
        <DashboardSection title="Pending invites" description="Links expire after 24 hours.">
          <ul className="divide-y divide-border/50">
            {pendingInvites.map(invitation => (
              <li key={invitation.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium tracking-tight">{invitation.email}</p>
                  <p className="text-[11px] capitalize text-muted-foreground">{roleLabel(invitation.role)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn('h-7 px-2 text-xs', copiedId === invitation.id && 'text-foreground')}
                  onClick={() => void handleCopyInvite(invitation)}
                >
                  {copiedId === invitation.id ? (
                    <CheckIcon className="size-3.5" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setRevokeInvite(invitation)}
                  disabled={isPending}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        </DashboardSection>
      ) : null}

      <InviteMemberDialog
        workspaceId={workspace.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onCreated={invitation => {
          setPendingInvites(current => [invitation, ...current.filter(item => item.id !== invitation.id)])
          router.refresh()
        }}
      />
      <PaywallDialog {...paywall.dialogProps} />

      <DeleteConfirmDialog
        open={Boolean(removeMember)}
        onOpenChange={open => {
          if (!open) setRemoveMember(null)
        }}
        title="Remove this member?"
        description={
          removeMember
            ? `${removeMember.user?.name ?? 'This person'} will lose access to ${workspace.name}.`
            : ''
        }
        confirmLabel="Remove"
        isDeleting={isPending}
        onConfirm={handleRemoveMember}
      />

      <DeleteConfirmDialog
        open={Boolean(revokeInvite)}
        onOpenChange={open => {
          if (!open) setRevokeInvite(null)
        }}
        title="Revoke this invite?"
        description={revokeInvite ? `The link sent to ${revokeInvite.email} will stop working.` : ''}
        confirmLabel="Revoke"
        isDeleting={isPending}
        onConfirm={handleRevoke}
      />
    </div>
  )
}
