'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getInviteUrl } from '@/lib/invite-url'
import { createInvitation } from '@/services/invitation.service'
import type { InvitationResponse, InvitationRole } from '@socialista/types'
import { CheckIcon, CopyIcon, Loader2Icon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type InviteMemberDialogProps = {
  workspaceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (invitation: InvitationResponse) => void
}

export function InviteMemberDialog({ workspaceId, open, onOpenChange, onCreated }: InviteMemberDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitationRole>('member')
  const [created, setCreated] = useState<InvitationResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const reset = () => {
    setEmail('')
    setRole('member')
    setCreated(null)
    setCopied(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (isPending) return
    if (!next) reset()
    onOpenChange(next)
  }

  const handleInvite = () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || isPending) return

    startTransition(async () => {
      const response = await createInvitation({
        workspace: workspaceId,
        email: trimmed,
        role,
      })

      if (!response.success || !response.data?.invitation) {
        toast.error(response.message ?? 'Couldn’t send invite')
        return
      }

      setCreated(response.data.invitation)
      onCreated?.(response.data.invitation)
      toast.success('Invite created')
    })
  }

  const inviteUrl = created?.token ? getInviteUrl(created.token) : ''

  const handleCopy = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success('Link copied')
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('Couldn’t copy link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold tracking-[-0.02em]">
            {created ? 'Invite link ready' : 'Invite a member'}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            {created
              ? 'Share this link. It expires in 24 hours and only works for the invited email.'
              : 'They’ll join with the role you choose after signing in.'}
          </DialogDescription>
        </DialogHeader>

        {created ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
              <p className="truncate text-[13px] font-medium">{created.email}</p>
              <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">{created.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <Input readOnly value={inviteUrl} className="h-9 rounded-lg text-xs" />
              <Button type="button" size="sm" className="h-9 shrink-0 rounded-lg px-3" onClick={() => void handleCopy()}>
                {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                Copy
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email" className="text-xs text-muted-foreground">
                Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="name@studio.com"
                className="h-9 rounded-lg"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select value={role} onValueChange={value => setRole(value as InvitationRole)}>
                <SelectTrigger size="sm" className="w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-end">
          {created ? (
            <Button type="button" size="sm" className="rounded-lg" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-lg"
                onClick={handleInvite}
                disabled={isPending || !email.trim()}
              >
                {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
                Create invite
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
