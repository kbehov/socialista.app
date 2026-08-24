'use client'

import { dashboardSurface } from '@/components/dashboard/surface'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { parseSkillMarkdown } from '@/lib/skills/parse-skill-markdown'
import { storeImportedSkillDraft } from '@/lib/skills/skill-import-storage'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, FileTextIcon, PenLineIcon, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, type ChangeEvent } from 'react'
import { toast } from 'sonner'

type CreateSkillMenuProps = {
  label?: string
  variant?: 'default' | 'outline'
  className?: string
}

export function CreateSkillMenu({
  label = 'Create skill',
  variant = 'default',
  className,
}: CreateSkillMenuProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    void file
      .text()
      .then(text => {
        const draft = parseSkillMarkdown(text, file.name)
        if (!draft.content.trim()) {
          toast.error('That markdown file is empty.')
          return
        }
        storeImportedSkillDraft(draft)
        router.push(DASHBOARD_ROUTES.createSkill)
      })
      .catch(() => {
        toast.error('Could not read that file. Try another .md file.')
      })
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".md,.markdown,text/markdown"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={handleFileChange}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant={variant}
            className={cn(variant === 'default' && dashboardSurface.createCta, className)}
          >
            <PlusIcon className="size-3.5" />
            {label}
            <ChevronDownIcon className="size-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild>
            <Link href={DASHBOARD_ROUTES.createSkill}>
              <PenLineIcon />
              Write from scratch
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              window.setTimeout(() => fileRef.current?.click(), 0)
            }}
          >
            <FileTextIcon />
            Import from Markdown
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
