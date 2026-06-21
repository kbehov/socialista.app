'use client'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export function UserDropdown() {
  const { data: session } = useSession()

  return (
    <Avatar size="sm">
      <AvatarImage src={session?.user?.image ?? ''} />
      <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}
