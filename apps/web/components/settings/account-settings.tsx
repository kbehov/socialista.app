'use client'

import { DashboardSection } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { updateUser, uploadUserAvatar } from '@/services/user.service'
import { getInitials } from '@/utils/user'
import type { User } from '@socialista/types'
import { CameraIcon, EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
}

type AccountSettingsProps = {
  user: User
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  disabled,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
  disabled?: boolean
  placeholder?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          className="h-9 rounded-lg pr-9"
        />
        <button
          type="button"
          onClick={() => setVisible(current => !current)}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          disabled={disabled}
        >
          {visible ? <EyeOffIcon className="size-3.5" strokeWidth={1.75} /> : <EyeIcon className="size-3.5" strokeWidth={1.75} />}
        </button>
      </div>
    </div>
  )
}

export function AccountSettings({ user: initialUser }: AccountSettingsProps) {
  const router = useRouter()
  const { update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState(initialUser)
  const [name, setName] = useState(initialUser.name)
  const [email, setEmail] = useState(initialUser.email)
  const [avatar, setAvatar] = useState(initialUser.avatar ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingPassword, startPasswordTransition] = useTransition()

  const trimmedName = name.trim()
  const trimmedEmail = email.trim().toLowerCase()
  const profileDirty = trimmedName !== user.name || trimmedEmail !== user.email.toLowerCase()
  const connectedProviders = user.connectedProviders ?? []

  const persistSession = async (nextUser: User) => {
    setUser(nextUser)
    setName(nextUser.name)
    setEmail(nextUser.email)
    setAvatar(nextUser.avatar ?? '')
    await update({
      user: {
        name: nextUser.name,
        email: nextUser.email,
        image: nextUser.avatar ?? null,
        status: nextUser.status,
        role: nextUser.role,
      },
    })
    router.refresh()
  }

  const handleSaveProfile = () => {
    if (!trimmedName || !trimmedEmail || isPending) return

    startTransition(async () => {
      try {
        const response = await updateUser({
          name: trimmedName,
          email: trimmedEmail,
        })

        if (!response.success || !response.data?.user) {
          toast.error(response.message ?? 'Couldn’t save profile')
          return
        }

        await persistSession(response.data.user)
        toast.success('Profile updated')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Couldn’t save profile')
      }
    })
  }

  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await uploadUserAvatar(formData)

      if (!response.success || !response.data?.user) {
        toast.error(response.message ?? 'Couldn’t upload photo')
        return
      }

      await persistSession(response.data.user)
      toast.success('Photo updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Couldn’t upload photo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    if (isUploading || isPending || !avatar) return

    startTransition(async () => {
      try {
        const response = await updateUser({ avatar: null })
        if (!response.success || !response.data?.user) {
          toast.error(response.message ?? 'Couldn’t remove photo')
          return
        }

        await persistSession(response.data.user)
        toast.success('Photo removed')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Couldn’t remove photo')
      }
    })
  }

  const handleSavePassword = () => {
    if (isSavingPassword) return
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (user.hasPassword && !currentPassword) {
      toast.error('Enter your current password')
      return
    }

    startPasswordTransition(async () => {
      try {
        const response = await updateUser({
          password,
          currentPassword: user.hasPassword ? currentPassword : undefined,
        })

        if (!response.success || !response.data?.user) {
          toast.error(response.message ?? 'Couldn’t update password')
          return
        }

        setCurrentPassword('')
        setPassword('')
        setConfirmPassword('')
        await persistSession(response.data.user)
        toast.success(user.hasPassword ? 'Password updated' : 'Password set')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Couldn’t update password')
      }
    })
  }

  const providerLabels = connectedProviders.map(provider => PROVIDER_LABELS[provider] ?? provider)

  return (
    <div className="flex flex-col gap-5">
      <DashboardSection title="Profile" description="How you appear across Socialista.">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isPending}
              className={cn(
                'relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted/40',
                'transition-transform duration-150 ease-out active:scale-[0.97]',
                'hover:border-border focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                'motion-reduce:active:scale-100',
              )}
              aria-label="Change profile photo"
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-lg font-semibold tracking-tight text-muted-foreground">
                  {getInitials(trimmedName || user.name)}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity hover:opacity-100">
                {isUploading ? (
                  <Loader2Icon className="size-4 animate-spin text-white" />
                ) : (
                  <CameraIcon className="size-4 text-white" strokeWidth={1.75} />
                )}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="sr-only"
              onChange={event => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void handleAvatarFile(file)
              }}
            />
            <div className="min-w-0">
              <p className="text-[13px] font-medium tracking-tight">Photo</p>
              <p className="mt-0.5 text-xs text-muted-foreground">A square image works best.</p>
              {avatar ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 px-2 text-xs text-muted-foreground"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading || isPending}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account-name" className="text-xs text-muted-foreground">
              Name
            </Label>
            <Input
              id="account-name"
              value={name}
              onChange={event => setName(event.target.value)}
              maxLength={80}
              autoComplete="name"
              className="h-9 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account-email" className="text-xs text-muted-foreground">
              Email
            </Label>
            <Input
              id="account-email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              className="h-9 rounded-lg"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full px-4"
              onClick={handleSaveProfile}
              disabled={!profileDirty || trimmedName.length < 2 || !trimmedEmail || isPending}
            >
              {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Password"
        description={
          user.hasPassword
            ? 'Choose a new password for email sign-in.'
            : 'Add a password so you can also sign in with email.'
        }
      >
        <div className="flex flex-col gap-4">
          {user.hasPassword ? (
            <PasswordField
              id="current-password"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              disabled={isSavingPassword}
            />
          ) : null}
          <PasswordField
            id="new-password"
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            disabled={isSavingPassword}
            placeholder="At least 8 characters"
          />
          <PasswordField
            id="confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            disabled={isSavingPassword}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full px-4"
              onClick={handleSavePassword}
              disabled={!password || !confirmPassword || isSavingPassword}
            >
              {isSavingPassword ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
              {user.hasPassword ? 'Update password' : 'Set password'}
            </Button>
          </div>
        </div>
      </DashboardSection>

      {providerLabels.length > 0 ? (
        <DashboardSection title="Connected accounts" description="You can also sign in with these providers.">
          <ul className="flex flex-col gap-2">
            {providerLabels.map(label => (
              <li
                key={label}
                className="flex h-9 items-center rounded-lg border border-border/60 bg-muted/20 px-3 text-[13px] font-medium"
              >
                {label}
              </li>
            ))}
          </ul>
        </DashboardSection>
      ) : null}
    </div>
  )
}
