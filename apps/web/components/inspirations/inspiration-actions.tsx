'use client'

import { CreateCategorySheet } from '@/components/inspirations/create-category-sheet'
import { CreateNicheSheet } from '@/components/inspirations/create-niche-sheet'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type InspirationActionsProps = {
  align?: 'start' | 'center' | 'end'
}

export function InspirationActions({ align = 'end' }: InspirationActionsProps) {
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [nicheOpen, setNicheOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="h-8 gap-1.5 rounded-lg">
            <PlusIcon className="size-3.5" />
            New
            <ChevronDownIcon className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align={align} className="w-44">
          <DropdownMenuItem asChild>
            <Link href="/manager/inspirations/create">Inspiration</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={event => {
              event.preventDefault()
              setCategoryOpen(true)
            }}
          >
            Category
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={event => {
              event.preventDefault()
              setNicheOpen(true)
            }}
          >
            Niche
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateCategorySheet open={categoryOpen} onOpenChange={setCategoryOpen} />
      <CreateNicheSheet open={nicheOpen} onOpenChange={setNicheOpen} />
    </>
  )
}
