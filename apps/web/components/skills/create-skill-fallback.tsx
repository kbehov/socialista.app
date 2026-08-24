import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { ChevronLeftIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

type CreateSkillFallbackProps = {
  title: string
  description: string
  action?: ReactNode
}

export function CreateSkillFallback({ title, description, action }: CreateSkillFallbackProps) {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col px-1 pb-24 pt-10 sm:pt-12">
      <div className="mb-8 flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href={DASHBOARD_ROUTES.SKILLS} aria-label="Back to skills">
            <ChevronLeftIcon className="size-4" strokeWidth={1.75} />
          </Link>
        </Button>
        <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
          <Link href={DASHBOARD_ROUTES.SKILLS} className="transition-colors hover:text-foreground">
            Skills
          </Link>
          <span className="mx-1.5 text-muted-foreground/50">/</span>
          <span className="font-medium text-foreground/80">New skill</span>
        </nav>
      </div>

      <div className="flex flex-col items-center px-5 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
          <SparklesIcon className="size-5" strokeWidth={1.5} />
        </div>
        <p className="mt-5 text-base font-semibold tracking-[-0.02em]">{title}</p>
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  )
}
