'use client'

import { CreateStaticAdCategorySheet } from './create-static-ad-category-sheet'
import { StaticAdTemplateCreateSheet } from './static-ad-template-create-sheet'
import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { StaticAdTemplateCategoryDto } from '@socialista/types'
import { ChevronDownIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'

type StaticAdTemplateActionsProps = {
  categories: StaticAdTemplateCategoryDto[]
  align?: 'start' | 'center' | 'end'
}

export function StaticAdTemplateActions({ categories, align = 'end' }: StaticAdTemplateActionsProps) {
  const [templateOpen, setTemplateOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className={cn(dashboardSurface.createCta, 'gap-1.5')}>
            <PlusIcon className="size-3.5" />
            New
            <ChevronDownIcon className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align={align} className="w-44">
          <DropdownMenuItem
            onSelect={event => {
              event.preventDefault()
              setTemplateOpen(true)
            }}
          >
            Template
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
        </DropdownMenuContent>
      </DropdownMenu>

      <StaticAdTemplateCreateSheet open={templateOpen} onOpenChange={setTemplateOpen} categories={categories} />
      <CreateStaticAdCategorySheet open={categoryOpen} onOpenChange={setCategoryOpen} />
    </>
  )
}
